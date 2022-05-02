import React from 'react';
import { ComponentProps } from './types/types';

export const Building: React.FC<ComponentProps> = (props) => {
  const { nodes, material } = props;

  return (
    <>
      <mesh geometry={nodes['main-area'].geometry} material={material} />

      <mesh geometry={nodes['main-area001'].geometry} material={material} />
      <mesh geometry={nodes['main-area002'].geometry} material={material} />
      <mesh geometry={nodes['main-area003'].geometry} material={material} />
      <mesh geometry={nodes['main-area004'].geometry} material={material} />
      <mesh geometry={nodes['main-area005'].geometry} material={material} />
      <mesh geometry={nodes['main-area006'].geometry} material={material} />
      <mesh geometry={nodes['main-area007'].geometry} material={material} />
    </>
  );
};
