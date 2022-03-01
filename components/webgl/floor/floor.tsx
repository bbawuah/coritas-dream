import { usePlane } from '@react-three/cannon';
import React from 'react';

interface Props {}

// When loading a scene, you should consider merging the geometry before creating MeshBVH instance
export const Floor: React.FC<Props> = (props) => {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -0.5, 0],
  }));

  return (
    <mesh ref={ref}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial opacity={1} color={'#99EAF5'} />
    </mesh>
  );
};
