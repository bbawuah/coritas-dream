import { useFrame, useThree } from '@react-three/fiber';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';
import { getState, useStore } from '../../../store/store';
import { Text } from '@react-three/drei';

interface Props {
  playerId: string;
  onPointerOver: () => void;
  onPointerOut: () => void;
}

type ILabelsType = Record<string, any>;

export const InstancedUsers: React.FC<Props> = (props) => {
  const { playerId, onPointerOver, onPointerOut } = props;
  const { camera } = useThree();
  const instancedMeshRef = useRef<THREE.InstancedMesh>();
  const labelsRef = useRef<ILabelsType>({});
  const { playersCount } = useStore(({ playersCount }) => ({
    playersCount,
  }));

  const dummy = new THREE.Object3D();

  useEffect(() => {
    if (instancedMeshRef.current && labelsRef.current) {
      instancedMeshRef.current.castShadow = true;
      instancedMeshRef.current.receiveShadow = true;
      instancedMeshRef.current.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    }
  }, []);

  // Listen directly to websocket in renderloop
  useFrame(() => {
    if (instancedMeshRef.current) {
      const players = getState().players;
      const ids = Object.keys(players);

      ids
        .filter((id) => id !== playerId)
        .forEach((player, index) => {
          dummy.position.set(
            players[player].x,
            players[player].y,
            players[player].z
          );

          dummy.updateMatrix();
          instancedMeshRef?.current?.setMatrixAt(index, dummy.matrix);

          labelsRef.current[player].position.set(
            players[player].x,
            players[player].y + 1.5,
            players[player].z
          );

          labelsRef.current[player].quaternion.copy(camera.quaternion);
        });

      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <instancedMesh
        ref={instancedMeshRef}
        args={[
          new RoundedBoxGeometry(1.0, 2.0, 1.0, 10, 0.5),
          new THREE.MeshStandardMaterial({ color: new THREE.Color('#00ff00') }),
          playersCount,
        ]}
        onClick={(e) => handleClickedPlayer(e.instanceId)}
      />
      {renderPlayerLabels()}
    </>
  );

  function renderPlayerLabels() {
    const players = getState().players;
    const ids = Object.keys(players);

    const jsx = ids
      .filter((id) => id !== playerId)
      .map((id) => {
        return (
          <Text
            key={id}
            ref={(element) => {
              return (labelsRef.current[id] = element);
            }}
            color={'#000'}
            fontSize={0.25}
            letterSpacing={0.03}
            lineHeight={1}
          >
            {id}
          </Text>
        );
      });

    return jsx;
  }

  function handleClickedPlayer(index?: number) {
    const players = getState().players;
    const ids = Object.keys(players).filter((id) => id !== playerId);

    console.log(`Clicked on player ${index ? ids[index] : ids[0]}`);
  }
};
