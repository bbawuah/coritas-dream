/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import * as THREE from 'three';
import React, { useEffect, useRef, useState } from 'react';
import { useGLTF, useTexture } from '@react-three/drei';
import { ComponentProps, EnvironmentProps, GLTFResult } from './types/types';
import { Pillars } from './Pillars';
import { LaunchArea } from './LaunchArea';
import { VideoScreen } from './VideoScreen';
import { Leaves } from './Leaves';
import { Bridges } from './Bridges';
import { Building } from './Building';
import { Dove } from './Dove';
import { Fist } from './Fist';
import { Screen } from './Screen';
import { Heart } from './Heart';
import { HopePaintings } from './HopePaintings';
import { JusticePaintings } from './JusticePaintings';
import { LovePaintings } from './LovePaintings';
import { PaintingWalls } from './PaintingWalls';
import { UpperBox } from './UpperBox';

export const Environment: React.FC<EnvironmentProps> = (props) => {
  const group = useRef<THREE.Group>();
  const { nodes } = useGLTF('/environment-transformed.glb') as GLTFResult;

  const metalnessMap = useTexture('/metallic-texture.jpg');
  const normalTexture = useTexture('/normal-texture.jpg');
  normalTexture.flipY = false;
  metalnessMap.flipY = false;
  normalTexture.minFilter = THREE.LinearFilter;
  metalnessMap.minFilter = THREE.LinearFilter;

  const color = 0x93887d;
  const material = new THREE.MeshPhongMaterial({
    color,
    normalMap: normalTexture,
    specular: 0x00fff0,
    shininess: 25,
    specularMap: metalnessMap,
    normalScale: new THREE.Vector2(0.75, 0.75),
  });

  return (
    <group ref={group} dispose={null} position={new THREE.Vector3(0, -0.5, 0)}>
      <LaunchArea nodes={nodes} material={material} />
      <Pillars nodes={nodes} material={material} />
      <Screen nodes={nodes} material={material} />
      <VideoScreen nodes={nodes} material={material} />
      <Leaves nodes={nodes} material={material} />
      <Building nodes={nodes} material={material} />
      <Fist nodes={nodes} material={material} />
      <Bridges baseColor={color} nodes={nodes} material={material} />
      <UpperBox nodes={nodes} material={material} />
      <Heart nodes={nodes} material={material} />
      <Dove nodes={nodes} material={material} />
      <HopePaintings nodes={nodes} material={material} />
      <LovePaintings nodes={nodes} material={material} />
      <JusticePaintings nodes={nodes} material={material} />
      <PaintingWalls nodes={nodes} material={material} />
    </group>
  );
};

useGLTF.preload('/environment-transformed.glb');
