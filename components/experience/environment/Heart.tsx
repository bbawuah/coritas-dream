import React from 'react';
import { ComponentProps } from './types/types';

export const Heart: React.FC<ComponentProps> = (props) => {
  const { nodes, material } = props;

  return <mesh geometry={nodes.heart.geometry} material={material} />;
};
