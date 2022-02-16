import React from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';
import { Text } from '@react-three/drei';

interface Props {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  id: string;
}

export const OtherUsers: React.FC<Props> = (props) => {
  const { position, rotation, id } = props;

  return (
    <mesh
      position={position}
      rotation={rotation}
      geometry={new RoundedBoxGeometry(1.0, 2.0, 1.0, 10, 0.5)}
      castShadow={true}
      receiveShadow={true}
    >
      <meshStandardMaterial shadowSide={2} />
      <Text
        position={[0, 1.5, 0]}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {id}
      </Text>
    </mesh>
  );
};
