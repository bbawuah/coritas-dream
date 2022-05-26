/* eslint-disable @next/next/no-img-element */
import { useTexture } from '@react-three/drei';
import React from 'react';
import * as THREE from 'three';
import { ComponentProps } from './types/types';
import { useStore } from '../../../store/store';

export const HopePaintings: React.FC<ComponentProps> = (props) => {
  const { nodes } = props;
  const { canvasContainerRef, set } = useStore(
    ({ canvasContainerRef, set }) => ({ canvasContainerRef, set })
  );
  const paintings = [
    {
      src: './hope/70-08.jpg',
      title: 'a small brown bird',
      description: `to believe in god is to know that all the rules are fair and that there will be wonderful surprises
\nCorita.org. (z.d.-a). Corita.org. Geraadpleegd op 19 mei 2022, van https://www.corita.org/
        
        `,
      isVisibleInMuseum: false,
    },
    {
      src: './hope/69-77.jpg',
      title: 'iin daisy',
      description: `Hope is believing that there has to be an "I" in "daisy."
\nCorita.org. (z.d.-a). Corita.org. Geraadpleegd op 19 mei 2022, van https://www.corita.org/
      
      `,
      isVisibleInMuseum: true,
    },
    {
      src: './hope/72-08.jpg',
      title: 'to love is to expect',
      description: `
    Transcribed Text
    We can only speak of hope
\n
My relationship to myself is mediated by the presence of the other person, by what he is for me and what I am for him. To love any body is to expect something from him, something which can neither be defined nor forseen; it is at the same time in someway to make it possible for him to fulfill this expectation Yes, paradoxical as it may seem, to expect is in someway to give: but the opposite is none the less true; no longer to expect is to strike with the sterility the being from whom no more is expected. It is then in some way to deprive him or to take from him in advance what is surely a certain possibility of inventing or creating.
Everything looks as though we can only speak of hope where the interaction exists between him who gives and him who receives.
G. Marcel

\nCorita.org. (z.d.-a). Corita.org. Geraadpleegd op 19 mei 2022, van https://www.corita.org/

    `,
      isVisibleInMuseum: false,
    },
    {
      src: './hope/83-20.jpg',
      title: 'the dark',
      description: 'The dark has its own light',
      isVisibleInMuseum: false,
    },
    {
      src: './hope/69-84.jpg',
      title: 'god is alive (part 1)',
      description: `
    
Transcribed Text
GOD IS ALIVE
MAGIC IS AFO
OT GOD IS AFO
OT MAGIC IS A
LIVE Leonard Cohen
[GOD IS ALIVE MAGIC IS AFOOT GOD IS AFOOT MAGIC IS ALIVE Leonard Cohen]

I resist anything better than my own diversity, breathe the air but leave plenty after me, am not stuck up, and am in my place...

I believe a leaf of grass is no less than the journey-work of the star, and the pisamire is equally perfect, and a grain of sand, and the egg of the wren, and the tree-toad is a chef-d'oeuvre for the highest, and the running blackberry would adorn the parlors of heaven...Whitman

Any sufficiently advanced technology is indistinguishable from magic. Clarke (2001)

After all, we are a people who live on the roof of the world; we are the sons of Father Sun, and with our religion we daily help our father go across the sky. We do this not only for ourselves, but for the whole world. If we were to cease practicing our religion, in ten years the sun would no longer rise. Then it would be night forever...

The ritual acts of man are an answer and reaction to the action of God upon man; and perhaps they are not only that, but are also intended to be "activating," a form of magic coercion. Then man feels capable of formulating valid replies to the overpowering influence of God, and that he can render back something which is essential even to God, induces pride, for it raises the human individual to the dignity of a metaphysical factor.
"God and us"---even if it is only an unconscious sous-entendu---this equation no doubt underlies that enviable serenity of the Pueblo Indian. Such a man is in the fullest sense of the word his proper place.
from Memories, Dreams and Reflections
by C.G. Jung

\nCorita.org. (z.d.-a). Corita.org. Geraadpleegd op 19 mei 2022, van https://www.corita.org/

    `,
      isVisibleInMuseum: false,
    },
    {
      src: './hope/69-85.jpg',
      title: 'god is alive (part 2)',
      description: `
    
Transcribed Text
GOD IS ALIVE
MAGIC IS AFO
OT GOD IS AFO
OT MAGIC IS A
LIVE Leonard Cohen
\n
I resist anything better than my own diversity, breathe the air but leave plenty after me, am not struck up, and am in my place...
I believe a leaf of grass is no less than the journey-work of the star, and the pisamire is equally perfect, and a grain of sand, and the egg of the wren, and the tree-toad is a chef-d'oeuvre for the highest, and the running blackberry would adorn the parlors of heaven...Whitman
\n
Any sufficiently advanced technology is indistinguishable from magic. Clarke (2001)
\n
After all, we are a people who live on the roof of the world; we are the sons of Father Sun, and with our religion we daily help our father go across the sky. We do this not only for ourselves, but for the whole world. If we were to cease practicing our religion, in ten years the sun would no longer rise. Then it would be night forever...
The ritual acts of man are an answer and reaction to the action of God upon man; and perhaps they are not only that, but are also intended to be "activating," a form of magic coercion. Than man feels capable of formulating valid replies to the overpowering influence of God, and that he can render back something which is essential even to God, induces pride, for it raises the human individual to the dignity of a metaphysical factor.
"God and us"---even if it is only an unconscious sous-entendu---this equation no doubt underlies that enviable serenity of the Pueblo Indian. Such a man is in the fullest sense of the word his proper place.
from Memories, Dreams and Reflections
by C.G. Jung

\nCorita.org. (z.d.-a). Corita.org. Geraadpleegd op 19 mei 2022, van https://www.corita.org/

    `,
      isVisibleInMuseum: false,
    },
    {
      src: './hope/69-82.jpg',
      title: 'only you and i (part 1)',
      description: `
Transcribed Text
THE MOMENT IN WHICH LIGHT COMES IS GOD only you and i can help the sun rise each morning, if we don't it may drench itself out in sorrow.
Camus

\nCorita.org. (z.d.-a). Corita.org. Geraadpleegd op 19 mei 2022, van https://www.corita.org/

    `,
      isVisibleInMuseum: false,
    },
    {
      src: './hope/69-83.jpg',
      title: 'only you and i (part 2)',
      description: `
    
Transcribed Text
THE MOMENT IN WHICH LIGHT COMES IS GOD only you and i can help the sun rise each morning, if we don't it may drench itself out in sorrow.
Camus


\nCorita.org. (z.d.-a). Corita.org. Geraadpleegd op 19 mei 2022, van https://www.corita.org/
    `,
      isVisibleInMuseum: false,
    },
  ];
  const textures = useTexture(paintings.map((value) => value.src));

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
              onPointerOver={() => {
                if (typeof window !== 'undefined') {
                  document.body.style.cursor = 'pointer';
                }
              }}
              onPointerLeave={() => {
                if (typeof window !== 'undefined') {
                  document.body.style.cursor = 'grab';
                }
              }}
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
