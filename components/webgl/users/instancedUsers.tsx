import { useFrame } from '@react-three/fiber';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';
import { getState, useStore } from '../../../store/store';
import { Html } from '@react-three/drei';
import { Room } from 'colyseus.js';

interface Props {
  playerId: string;
  room: Room;
}

export const InstancedUsers: React.FC<Props> = (props) => {
  const { playerId, room } = props;
  const instancedMeshRef = useRef<THREE.InstancedMesh>();
  const { playersCount } = useStore(({ playersCount }) => ({
    playersCount,
  }));

  const dummy = new THREE.Object3D();

  useEffect(() => {
    if (instancedMeshRef.current) {
      instancedMeshRef.current.castShadow = true;
      instancedMeshRef.current.receiveShadow = true;
      instancedMeshRef.current.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    }
  }, []);

  // Listen directly to websocket in renderloop
  useFrame(() => {
    if (instancedMeshRef.current) {
      room.onMessage('move', (data) => {
        const { players } = data;
        const ids = Object.keys(players);

        ids
          .filter((id) => id !== playerId)
          .forEach((id, index) => {
            dummy.position.set(players[id].x, players[id].y, players[id].z);

            dummy.updateMatrix();
            instancedMeshRef?.current?.setMatrixAt(index, dummy.matrix);
          });
      });

      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[
        new RoundedBoxGeometry(1.0, 2.0, 1.0, 10, 0.5),
        new THREE.MeshStandardMaterial({ color: new THREE.Color('#00ff00') }),
        playersCount,
      ]}
      onClick={(e) => handleClickedPlayer(e.instanceId)}
    >
      {renderPlayerLabels()}
    </instancedMesh>
  );

  function renderPlayerLabels() {
    const players = getState().players;
    const ids = Object.keys(players); //Probably need to refactor this to a React.Ref

    return ids
      .filter((id) => id !== playerId)
      .map((id) => {
        const vector = new THREE.Vector3(
          players[id].x,
          players[id].y + 1.5,
          players[id].z
        );
        return (
          <Html
            key={id}
            position={vector}
            style={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <span>{id}</span>
          </Html>
        );
      });
  }

  function handleClickedPlayer(index?: number) {
    const players = getState().players;
    const ids = Object.keys(players).filter((id) => id !== playerId);

    console.log(`Clicked on player ${index ? ids[index] : ids[0]}`);
  }
};
