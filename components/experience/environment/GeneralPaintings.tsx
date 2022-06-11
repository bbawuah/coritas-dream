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
      title: 'Yes #3',
      description: `love`,
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
      title: 'there is only one man in the world',
      description: ` 
      There is only one man in the world and his name is all men. There is only one woman in the world and her name is all women. There is only one child in the world and the child's name is all children.
Carl Sandburg

\nCorita.org. (z.d.-a). Corita.org. Geraadpleegd op 19 mei 2022, van https://www.corita.org/

      `,
      isVisibleInMuseum: false,
    },
    {
      src: './general/69-64.jpg',
      title: 'News of the week',
      description: `
      Newsweek APRIL 12, 1965 35 CENTS
Profile of the Viet Cong

LIFE July 2, 1965 35 cents
DEEPER INTO THE VIETNAM WAR
A marine is evacuated during patrol action against the Vietcong
\n
I am the hounded slave, I wince at the bite of dogs, Hell and despair are upon me, crack again and crack the marksman, I clutch the rails of the fence, my gore dribs, thinned with the ooze of my skin. I fall on the weeds and stones, the riders spur their unwilling horses, haul close, taunt my dizzy ears and beat me violently over the head with whip-stocks.
Agonies are one of my changes of garments, I do not ask the wounded person how he feels, I myself become the wounded person, my hurts turn livid upon me as I lean on a can and observe.
Walt Whitman

\nCorita.org. (z.d.-a). Corita.org. Geraadpleegd op 19 mei 2022, van https://www.corita.org/
      `,
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
      title: 'manflowers',
      description: `
      MAN
POW-
ER!
where have all the flowers gone?
      `,
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
                canvasContainerRef.style.cursor = '';
              }
            }}
          />
        );
      })}
    </>
  );
};
