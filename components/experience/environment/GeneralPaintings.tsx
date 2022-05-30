/* eslint-disable @next/next/no-img-element */
import { useTexture } from '@react-three/drei';
import React from 'react';
import * as THREE from 'three';
import { ComponentProps } from './types/types';
import { useStore } from '../../../store/store';

export const GeneralPaintings: React.FC<ComponentProps> = (props) => {
  const { nodes } = props;
  const { canvasContainerRef, set } = useStore(
    ({ canvasContainerRef, set }) => ({ canvasContainerRef, set })
  );
  const paintings = [
    {
      src: './general/79-03.jpg',
      title: 'Title',
      description: `text`,
      isVisibleInMuseum: false,
    },
    {
      src: './general/70-01.jpg',
      title: 'Title',
      description: `text `,
      isVisibleInMuseum: false,
    },
    {
      src: './general/67-28.jpg',
      title: 'Title',
      description: `text `,
      isVisibleInMuseum: false,
    },
    {
      src: './general/69-64.jpg',
      title: 'Title',
      description: 'text',
      isVisibleInMuseum: false,
    },
    {
      src: './general/Corita-kent-rules.jpg',
      title: 'text',
      description: `test`,
      isVisibleInMuseum: false,
    },
    {
      src: './general/69-72.jpg',
      title: 'text',
      description: `text`,
      isVisibleInMuseum: false,
    },
  ];
  const textures = useTexture(paintings.map((value) => value.src));

  return (
    <>
      {textures.map((painting, index) => {
        painting.flipY = false;

        return (
          <mesh
            key={index}
            geometry={
              nodes[`general-painting00${(index + 1) as 1 | 2 | 3 | 4 | 5 | 6}`]
                .geometry
            }
            material={new THREE.MeshBasicMaterial({ map: painting })}
            onClick={() =>
              set((state) => ({ ...state, focusImage: paintings[index] }))
            }
            onPointerOver={() => {
              if (canvasContainerRef) {
                canvasContainerRef.style.cursor = 'pointer';
              }
            }}
            onPointerLeave={() => {
              if (canvasContainerRef) {
                canvasContainerRef.style.cursor = 'grab';
              }
            }}
          />
        );
      })}
    </>
  );
};
