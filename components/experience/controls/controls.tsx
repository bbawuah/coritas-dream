import React from 'react';
import { OrbitControls } from '@react-three/drei';

interface Props {}

export const Controls: React.FC<Props> = (props) => {
  return (
    <OrbitControls
      enablePan={false}
      enableZoom={false}
      maxPolarAngle={Math.PI / 2}
    />
  );
};
