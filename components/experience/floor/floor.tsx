import { extend, ThreeElement } from '@react-three/fiber';
import React from 'react';
import { FloorMaterial } from './floorMaterial'; //This is a temporary material

extend({ FloorMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    floorMaterial: ThreeElement<typeof FloorMaterial>;
  }
}

interface Props {}

export const Floor: React.FC<Props> = (props) => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      <planeGeometry args={[100, 100]} />
      <floorMaterial />
      {/* <meshStandardMaterial transparent opacity={0.3} color={'#99EAF5'} /> */}
    </mesh>
  );
};
