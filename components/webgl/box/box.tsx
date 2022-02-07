import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';

interface Props {
  position: THREE.Vector3;
}

export const Box: React.FC<Props> = (props) => {
  const { position } = props;
  const ref = useRef();

  if (ref.current) {
    (ref.current as THREE.Mesh).position.copy(position);
  }

  useFrame((state, delta) => {
    if (ref.current) {
      (ref.current as any).rotation.x = (ref.current as any).rotation.z +=
        delta;
    }
  });

  return (
    <mesh ref={ref}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial />
    </mesh>
  );
};
