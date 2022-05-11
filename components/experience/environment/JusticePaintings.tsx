import { useTexture } from '@react-three/drei';
import React from 'react';
import * as THREE from 'three';
import { ComponentProps } from './types/types';

export const JusticePaintings: React.FC<ComponentProps> = (props) => {
  const { nodes } = props;
  const paintings = useTexture([
    './justice/69-70.jpg',
    './justice/67-29.jpg',
    './justice/69-76.jpg',
    './justice/69-65.jpg',
    './justice/69-66.jpg',
    './justice/69-59.jpg',
    './justice/69-60.jpg',
    './justice/69-62.jpg',
  ]);

  return (
    <>
      {paintings.map((painting, index) => {
        painting.flipY = false;

        if (index === 0) {
          return (
            <mesh
              key={index}
              geometry={nodes['justice-painting'].geometry}
              material={new THREE.MeshBasicMaterial({ map: painting })}
            />
          );
        }

        return (
          <mesh
            key={index}
            geometry={
              nodes[`justice-painting00${index as 1 | 2 | 3 | 4 | 5 | 6 | 7}`]
                .geometry
            }
            material={new THREE.MeshBasicMaterial({ map: painting })}
          />
        );
      })}
    </>
  );
};
