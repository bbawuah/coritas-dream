/* eslint-disable @next/next/no-img-element */
import { useTexture } from '@react-three/drei';
import React, { useState } from 'react';
import * as THREE from 'three';
import { Modal } from '../../core/modal/modal';
import Image from 'next/image';
import { ComponentProps } from './types/types';
import { useStore } from '../../../store/store';

export const HopePaintings: React.FC<ComponentProps> = (props) => {
  const { nodes } = props;
  const { set } = useStore(({ set }) => ({ set }));
  const paintings = [
    './hope/70-08.jpg',
    './hope/69-77.jpg',
    './hope/72-08.jpg',
    './hope/83-20.jpg',
    './hope/69-84.jpg',
    './hope/69-85.jpg',
    './hope/69-82.jpg',
    './hope/69-83.jpg',
  ];
  const textures = useTexture(paintings);

  return (
    <>
      {textures.map((painting, index) => {
        painting.flipY = false;

        if (index === 0) {
          return (
            <mesh
              onClick={() =>
                set((state) => ({ ...state, focusImage: paintings[index] }))
              }
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
            onClick={() =>
              set((state) => ({ ...state, focusImage: paintings[index] }))
            }
          />
        );
      })}
    </>
  );
};
