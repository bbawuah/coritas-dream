import React from 'react';
import * as THREE from 'three';
import { ComponentProps } from './types/types';

export const Bridges: React.FC<ComponentProps> = (props) => {
  const { nodes, baseColor } = props;

  const material = new THREE.MeshStandardMaterial({
    color: baseColor,
  });

  return (
    <>
      <mesh geometry={nodes.bridge003.geometry} material={material} />
      <mesh geometry={nodes.bridge001.geometry} material={material} />
      <mesh geometry={nodes.bridge002.geometry} material={material} />
    </>
  );
};
