import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useHelper } from '@react-three/drei';
import { MeshBVH, MeshBVHVisualizer } from 'three-mesh-bvh';
import { useStore } from '../../../store/store';

interface Props {}

// When loading a scene, you should consider merging the geometry before creating MeshBVH instance
export const Floor: React.FC<Props> = (props) => {
  const ref = useRef<THREE.Mesh>();
  const { set } = useStore(({ set }) => ({ set }));

  useEffect(() => {
    if (ref.current) {
      ref.current.geometry.boundsTree = new MeshBVH(ref.current.geometry);

      set((state) => {
        if (ref.current) {
          // (ref.current.material as THREE.MeshStandardMaterial).wireframe = true;
          (ref.current.material as THREE.MeshStandardMaterial).opacity = 0.2;

          return { ...state, collider: ref.current };
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useHelper(ref, MeshBVHVisualizer);

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial opacity={1} color={'#99EAF5'} />
    </mesh>
  );
};
