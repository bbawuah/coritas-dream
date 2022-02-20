import { useFrame } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';
import { getState, IPlayers, subscribe, useStore } from '../../../store/store';
import { Model } from './model';
import { Text } from '@react-three/drei';

interface Props {
  playerId?: string;
}

export const InstancedUsers: React.FC<Props> = (props) => {
  const { playerId } = props;
  const instancedMeshRef = useRef<THREE.InstancedMesh>();
  const count = useRef<number>(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (instancedMeshRef.current) {
      instancedMeshRef.current.castShadow = true;
      instancedMeshRef.current.receiveShadow = true;
      instancedMeshRef.current.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    }
  }, []);

  useFrame(() => {
    if (instancedMeshRef.current) {
      const players = getState().players;
      const ids = Object.keys(players);

      count.current = ids.length; //Update count ref

      ids
        .filter((id) => id !== playerId)
        .forEach((id, index) => {
          dummy.position.set(players[id].x, players[id].y, players[id].z);

          // console.log(dummy.position);

          dummy.updateMatrix();
          instancedMeshRef?.current?.setMatrixAt(index, dummy.matrix);
        });

      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh
      position={new THREE.Vector3(4, 1, 0)}
      ref={instancedMeshRef}
      args={[
        new RoundedBoxGeometry(1.0, 2.0, 1.0, 10, 0.5),
        new THREE.MeshStandardMaterial({ color: new THREE.Color('#00ff00') }),
        count.current,
      ]}
    />
  );
};
