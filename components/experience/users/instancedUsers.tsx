import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';
import { getState, useStore } from '../../../store/store';
import { Text } from '@react-three/drei';

interface Props {
  playerId: string;
}

type ILabelsType = Record<string, any>;

export const InstancedUsers: React.FC<Props> = (props) => {
  const { playerId } = props;
  const { camera } = useThree();
  const instancedMeshRef = useRef<THREE.InstancedMesh>();
  const labelsRef = useRef<ILabelsType>({});
  const { playersCount, set } = useStore(({ playersCount, set }) => ({
    playersCount,
    set,
  }));

  const dummy = new THREE.Object3D();
  const tempMatrix = new THREE.Matrix4();

  const maxPlayers = 150;

  const [matrice] = useState(() => {
    const mArray = new Float32Array(maxPlayers * 16); //Create Float32Array with length max amount of players
    for (let i = 0; i < maxPlayers; i++)
      tempMatrix.identity().toArray(mArray, i * 16); //Store matrix in Float32Array

    return mArray; //Return array
  });

  const oldPosition = useRef<THREE.Vector3>(new THREE.Vector3());
  const newPosition = useRef<THREE.Vector3>(new THREE.Vector3());
  const newPositionLabel = useRef<THREE.Vector3>(new THREE.Vector3());
  const lerpAlpha = 0.1;

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
      // Only move players in here
      const players = getState().players;

      if (players) {
        const ids = Object.keys(players);
        ids
          .filter((id) => id !== playerId)
          .forEach((player, index) => {
            instancedMeshRef.current?.getMatrixAt(index, tempMatrix);
            oldPosition.current.setFromMatrixPosition(tempMatrix);

            newPosition.current.set(
              players[player].x,
              players[player].y,
              players[player].z
            );

            dummy.position.lerpVectors(
              oldPosition.current,
              newPosition.current,
              lerpAlpha
            );

            dummy.updateMatrix();
            instancedMeshRef.current?.setMatrixAt(index, dummy.matrix);

            if (labelsRef.current[player]) {
              newPositionLabel.current.set(
                players[player].x,
                players[player].y + 1.5,
                players[player].z
              );
              labelsRef.current[player].position.lerp(
                newPositionLabel.current,
                lerpAlpha
              );
              newPositionLabel.current.set(0, 0, 0);
              labelsRef.current[player].quaternion.copy(camera.quaternion);
            }
          });
      }

      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
      instancedMeshRef.current.instanceMatrix.updateRange.count =
        (playersCount - 1) * 16;
      instancedMeshRef.current.count = playersCount - 1;
    }
  });

  return (
    <Suspense fallback={null}>
      <instancedMesh
        ref={instancedMeshRef}
        args={[
          new RoundedBoxGeometry(1.0, 2.0, 1.0, 10, 0.5),
          undefined,
          playersCount - 1,
        ]}
        onClick={(e) => handleClickedPlayer(e.instanceId)}
        onPointerOver={() => {
          set((state) => ({ ...state, hovered: true }));
        }}
        onPointerOut={() => set((state) => ({ ...state, hovered: false }))}
      >
        <instancedBufferAttribute
          attach="instanceMatrix"
          count={matrice.length / 16}
          array={matrice}
          itemSize={16}
          usage={THREE.DynamicDrawUsage}
        />
        <meshStandardMaterial color={0x00ff00} />
      </instancedMesh>
      {renderPlayerLabels()}
    </Suspense>
  );

  function renderPlayerLabels() {
    const players = getState().players;

    if (players) {
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
              {players[id].id}
            </Text>
          );
        });

      return jsx;
    }
  }

  function handleClickedPlayer(index?: number) {
    const players = getState().players;

    if (players) {
      const ids = Object.keys(players).filter((id) => id !== playerId);

      console.log(`Clicked on player ${index ? ids[index] : ids[0]}`);
    }
  }
};
