import { useTexture } from '@react-three/drei';
import React from 'react';
import * as THREE from 'three';
import { ComponentProps } from './types/types';

export const HopePaintings: React.FC<ComponentProps> = (props) => {
  const { nodes } = props;
  const paintings = useTexture([
    './hope/70-08.jpg',
    './hope/69-77.jpg',
    './hope/72-08.jpg',
    './hope/83-20.jpg',
    './hope/69-84.jpg',
    './hope/69-85.jpg',
    './hope/69-82.jpg',
    './hope/69-83.jpg',
  ]);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

  return (
    <>
      {paintings.map((painting, index) => {
        painting.flipY = false;

        if (index === 0) {
          return (
            <mesh
              key={index}
              geometry={nodes['hope-painting'].geometry}
              material={new THREE.MeshBasicMaterial({ map: painting })}
            />
          );
        }

        return (
          <mesh
            key={index}
            geometry={
              nodes[`hope-painting00${index as 1 | 2 | 3 | 4 | 5 | 6 | 7}`]
                .geometry
            }
            material={new THREE.MeshBasicMaterial({ map: painting })}
          />
        );
      })}
    </>
  );
};
