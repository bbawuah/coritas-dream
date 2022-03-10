import React from 'react';

interface Props {}

// When loading a scene, you should consider merging the geometry before creating MeshBVH instance
export const Floor: React.FC<Props> = (props) => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial opacity={1} color={'#99EAF5'} />
    </mesh>
  );
};
