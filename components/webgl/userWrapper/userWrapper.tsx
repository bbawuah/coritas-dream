import React, { useRef } from 'react';
import { Text } from '@react-three/drei';

interface Props {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  id: string;
}

export const UserWrapper: React.FC<Props> = (props) => {
  const { position, rotation, id } = props;
  const ref = useRef();

  return (
    <mesh ref={ref} position={position} rotation={rotation}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial />
      <Text
        position={[0, 1.0, 0]}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {id}
      </Text>
    </mesh>
  );
};
