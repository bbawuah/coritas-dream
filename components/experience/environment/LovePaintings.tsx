import { useTexture } from '@react-three/drei';
import React from 'react';
import { ComponentProps } from './types/types';
import * as THREE from 'three';

export const LovePaintings: React.FC<ComponentProps> = (props) => {
  const { nodes } = props;
  const paintings = useTexture([
    './love/83-11.jpg',
    './love/85-06.jpg',
    './love/72-01.jpg',
    './love/69-73.jpg',
    './love/67-30.jpg',
  ]);

  return (
    <>
      {paintings.map((painting, index) => {
        painting.flipY = false;

        if (index === 0) {
          return (
            <mesh
              key={index}
              geometry={nodes['love-painting'].geometry}
              material={new THREE.MeshBasicMaterial({ map: painting })}
            />
          );
        }

        return (
          <mesh
            key={index}
            geometry={
              nodes[`love-painting00${index as 1 | 2 | 3 | 4}`].geometry
            }
            material={new THREE.MeshBasicMaterial({ map: painting })}
          />
        );
      })}
    </>
  );
};
