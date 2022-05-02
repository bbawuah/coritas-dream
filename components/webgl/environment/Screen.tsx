import React from 'react';
import { ComponentProps } from './types/types';

export const Screen: React.FC<ComponentProps> = (props) => {
  const { nodes, material } = props;

  return <mesh geometry={nodes.screen.geometry} material={material} />;
};
