import React from 'react';
import { ComponentProps } from './types/types';

export const Dove: React.FC<ComponentProps> = (props) => {
  const { nodes, material } = props;

  return <mesh geometry={nodes.dove.geometry} material={material} />;
};
