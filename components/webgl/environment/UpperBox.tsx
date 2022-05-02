import React from 'react';
import { ComponentProps } from './types/types';

export const UpperBox: React.FC<ComponentProps> = (props) => {
  const { nodes, material } = props;

  return <mesh geometry={nodes['upper-box001'].geometry} material={material} />;
};
