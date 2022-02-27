import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useStore } from '../../../store/store';

interface Props {}

// When loading a scene, you should consider merging the geometry before creating MeshBVH instance
export const Floor: React.FC<Props> = (props) => {
  const ref = useRef<THREE.Mesh>();
  // const { set } = useStore(({ set }) => ({ set }));

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial opacity={1} color={'#99EAF5'} />
    </mesh>
  );
};
