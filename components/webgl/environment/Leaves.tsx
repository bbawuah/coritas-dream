import React from 'react';
import { ComponentProps } from './types/types';
import * as THREE from 'three';

export const Leaves: React.FC<ComponentProps> = (props) => {
  const { nodes } = props;
  const material = new THREE.MeshStandardMaterial({
    color: 0x84e8ac,
  });

  return <mesh geometry={nodes.leaves.geometry} material={material} />;
};
