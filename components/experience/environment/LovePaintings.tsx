import { useTexture } from '@react-three/drei';
import React from 'react';
import { ComponentProps } from './types/types';
import * as THREE from 'three';
import { PaintingMetaData, useStore } from '../../../store/store';

export const LovePaintings: React.FC<ComponentProps> = (props) => {
  const { nodes } = props;
  const { set } = useStore(({ set }) => ({ set }));

  const paintings: PaintingMetaData[] = [
    {
      src: './love/83-11.jpg',
      title: "valentine '83",
      description: `
Transcribed Text
i love you very

\nCorita.org. (z.d.-a). Corita.org. Geraadpleegd op 19 mei 2022, van https://www.corita.org/
  `,
      isVisibleInMuseum: false,
    },
    {
      src: './love/85-06.jpg',
      title: 'love is hard work',
      description: `
      Transcribed Text
      love is hard work

\nCorita.org. (z.d.-a). Corita.org. Geraadpleegd op 19 mei 2022, van https://www.corita.org/
      `,
      isVisibleInMuseum: false,
    },
    {
      src: './love/72-01.jpg',
      title: 'within us',
      description: `      
Transcribed Text
We carry within us the wonders we seek without us
Sir Thomas Browne

\nCorita.org. (z.d.-a). Corita.org. Geraadpleegd op 19 mei 2022, van https://www.corita.org/
      `,
      isVisibleInMuseum: false,
    },
    {
      src: './love/69-73.jpg',
      title: 'love at the end',
      description: `      
Transcribed Text
Hey there, how about this one? --Dan
LOVE, love at the end
Paul's "Development of Peoples"
[article reprinted on serigraph by Dan Berrigan]
Paupers Semper: a non-encyclical

\nCorita.org. (z.d.-a). Corita.org. Geraadpleegd op 19 mei 2022, van https://www.corita.org/
            `,
      isVisibleInMuseum: false,
    },
    {
      src: './love/67-30.jpg',
      title: 'that man loves',
      description: `
Transcribed Text
that man loves When God enters the world, he sets men in movement. 
Or rather, let us say, he gets with a movement already underway. 
He becomes a brother on the journey, so truly one of us as to know at bone and heart and marrow all the the perplexity and pain,
that darkness and setbacks and fits and starts of the human march. Later, much later, (and then only for a time), 
comes the single big word to burden our faith: resurrection. The world is perhaps too large for men today to cope with. 
We say "yes" to it as best we can and turn again in our unrisen flesh and minds, to the unfinished business of living. 
D. Berriganour personal life is as full of grief and private torment as a clown's is always said to be.

\nCorita.org. (z.d.-a). Corita.org. Geraadpleegd op 19 mei 2022, van https://www.corita.org/
      `,
      isVisibleInMuseum: true,
    },
  ];

  const textures = useTexture(paintings.map((v) => v.src));

  return (
    <>
      {textures.map((painting, index) => {
        painting.flipY = false;

        if (index === 0) {
          return (
            <mesh
              key={index}
              onClick={() =>
                set((state) => ({ ...state, focusImage: paintings[index] }))
              }
              geometry={nodes['love-painting'].geometry}
              material={new THREE.MeshBasicMaterial({ map: painting })}
            />
          );
        }

        return (
          <mesh
            key={index}
            onClick={() =>
              set((state) => ({ ...state, focusImage: paintings[index] }))
            }
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
