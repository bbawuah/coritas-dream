import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { useStore } from '../../../store/store';
import { ComponentProps } from './types/types';
import { Text, useTexture } from '@react-three/drei';
import { useThree } from '@react-three/fiber';

export const BigScreen: React.FC<ComponentProps> = (props) => {
  const { nodes } = props;
  const { canvasContainerRef, set } = useStore(
    ({ canvasContainerRef, set }) => ({ canvasContainerRef, set })
  );

  const texture = useTexture('./general/corita.jpg');
  texture.flipY = false;

  const material = new THREE.MeshBasicMaterial({
    map: texture,
  });

  return <mesh geometry={nodes.screen001.geometry} material={material} />;
};
