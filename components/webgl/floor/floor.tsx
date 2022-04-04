import { extend, ReactThreeFiber } from '@react-three/fiber';
import React from 'react';
import { FloorMaterial } from './floorMaterial';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      floorMaterial: ReactThreeFiber.Object3DNode<
        FloorMaterial,
        typeof FloorMaterial
      >;
    }
  }
}

extend({ FloorMaterial });

interface Props {}

// When loading a scene, you should consider merging the geometry before creating MeshBVH instance
export const Floor: React.FC<Props> = (props) => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      <planeGeometry args={[100, 100]} />
      <floorMaterial />
      {/* <meshStandardMaterial transparent opacity={0.3} color={'#99EAF5'} /> */}
    </mesh>
  );
};
