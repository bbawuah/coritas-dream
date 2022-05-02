import React from 'react';
import { ComponentProps } from './types/types';

export const Fist: React.FC<ComponentProps> = (props) => {
  const { nodes, material } = props;

  return <mesh geometry={nodes.fist.geometry} material={material} />;
};
