import { useTexture } from '@react-three/drei';
import React from 'react';
import * as THREE from 'three';
import { PaintingMetaData, useStore } from '../../../store/store';
import { ComponentProps } from './types/types';

export const JusticePaintings: React.FC<ComponentProps> = (props) => {
  const { nodes } = props;
  const { canvasContainerRef, set } = useStore(
    ({ canvasContainerRef, set }) => ({ canvasContainerRef, set })
  );
  const paintings: PaintingMetaData[] = [
    {
      src: './justice/69-70.jpg',
      title: "king's dream",
      description: `
Transcribed Text
I may get me crucified I may even die but I want it said that he died to make men free-Martin Luther King

Divine order radiating from Kings and Gods

...A madman has put an end to his life, for I can only call him mad who did it and yet there has been enough of poison spread in this country during the past years and months and this poison has had effect on people's minds. We must face this poison, we must root out this poison, and we must face all the perils that encompass us and face them not madly or badly but rather in the way that our beloved teacher taught us to face them. The first thing to remember now is that no one of us dare misbehave because we are angry. We have to behave like strong and determined people, determined to face all the perils that surround us, determined to carry out the mandate that our great teacher and our great leader has given us, remembering always that if ,as I believe, his spirit looks upon us and sees us, nothing would displease his soul as much as to see that we have indulged in any small behavior or any violence --Nehru in a speech given extemporaneously by radio to the people of India on the death by assassination of Gandhi -- Jan. 30, 1948

I have a dream that my four little children will one day live in a nation where they will not be judged by the color of their skin but by the content of their character.With this faith we will be able to transform the jangling discords of our nation into a beautiful symphony of brotherhood. With this faith we will be able to work together, to pray together, to go to jail together, to stand up for freedom together, knowing that we will be free one day.

\nCorita.org. (z.d.-a). Corita.org. Geraadpleegd op 19 mei 2022, van https://www.corita.org/
`,
      isVisibleInMuseum: false,
    },
    {
      src: './justice/67-29.jpg',
      title: 'stop the bombing',
      description: `
Transcribed Text
I am in Vietnam--who will console me?
I am terrified of bombs, of cold wet leaves and bamboo splinters in my feet, of a bullet cracking through the trees, across the world, killing me--there is a bullet in my brain, behind my eyes, so that all I see is pain I am in vietnam--who will console me? from the sixoclock news, from the headlines lurking on the street, between the angry love songs on the radio, from the frightened hawks and angry doves I meet a war I will not fight is killing me--I am in vietnam, who will console me?

Stop the Bombing

\nCorita.org. (z.d.-a). Corita.org. Geraadpleegd op 19 mei 2022, van https://www.corita.org/
`,
      isVisibleInMuseum: false,
    },
    {
      src: './justice/69-76.jpg',
      title: 'if i',
      isVisibleInMuseum: false,
      description: `
Transcribed Text
Black is beautiful
"I challenge you today to see that his spirit never dies...and that we go forward from this time, which to me represents
CRUCIFIFIXIION on to a
REDEMPTION and a
RESURRECTION OF
THE SPIRIT
Mrs. Martin Luther King

He learns that the "yes" or "on" elements of energy cannot be experienced without contrast with the "no" or "off, " and therefore that darkness and death are by no means the mere absence of light and life but rather their origin. In this way the fear of death and nothingness is entirely overcome. Because of this startling discovery, so alien to the normal common sense, he worhsips the divinity under its female form rather than its male form---for the female is symbolically representative of the negative, dark, and hollow aspect of the world, without which the masculine, positive, light, and solid aspect cannot be manifested or seen...
he discovers that existence is basically a kind of dancing or music---an immensly complex energy pattern which needs no explanation other than itself---just as we do not ask what is the meaning of fugues...Energy itself, as William Blake said, is eternal delight and all life is to be lived in the spirit of rapt absorption in an arabesque of rhythms.
...In Western Civilization we over accentuate the positive, think of the negative as "bad," and thus live in a frantic terror of death and extinction which renders us incapable of "playing" life with a noble and joyous detachment. Failing to understand the musical gravity of nature, which fullfills itself in an eternal present, we live for a tomorrow which never comes...But through understanding the creative power of the female, of the negative, of empty space, and of death, we may at last become completely alive in the present.
Alan Watts

\nCorita.org. (z.d.-a). Corita.org. Geraadpleegd op 19 mei 2022, van https://www.corita.org/
  `,
    },
    {
      src: './justice/69-65.jpg',
      title: 'american sampler',
      isVisibleInMuseum: false,
      description: `
Transcribed Text
ASSASSINATION
AMERICANICAN
VIETMANIAMIA
VIOLENCEIVIOLA
VIETNAMIMVIET
ASSASSINATION
AMERICANICAN
WHYWHYNOTVV
  `,
    },
    {
      src: './justice/69-66.jpg',
      title: 'love your brother',
      isVisibleInMuseum: false,
      description: `
Transcribed Text
The King is dead. Love your Brother.Dr. King stares through the rain-spattered window of a police car after his arrest in Birmingham."are trampled over every day, don't ever let anyone pull you so low as to hate them. We must use the weapon of love. We must have compassion and understanding for those who hate. "

\nCorita.org. (z.d.-a). Corita.org. Geraadpleegd op 19 mei 2022, van https://www.corita.org/
      `,
    },
    {
      src: './justice/69-59.jpg',
      title: 'pieta 1969',
      isVisibleInMuseum: false,
      description: `
      
Transcribed Text
We shall know him not with useless mourning and vain regrets for the past, but with the firm and indomitable resolutions for the future: acting now to relieve the starvation of people in this country, working now to aid the disadvantaged and those helpless, inarticulate masses for whom he worked long hours, night as well as day.
Rose Kennedy

...It's me again. I've learned a really great thing. It's something you told me before but I couldn't really feel that way then. But tonight I was listening to Sen. Kennedy's mother on TV and she was talking about her son's love of living but it was in such a great human way, so unpretentious that it helped me see that one of the great qualities of the Kennedy's was that they were so reachable. In the middle of destruction was this great creative force always there and always an honest statement of a really human responsive entity who wasn't hiding behind a bureaucracy or a static position. Then I started thinking about how many times I walk around and people talk to me but I am not there. I'm not honestly responding. I want to try to develop some of the Kennedy quality. It is so easy to fall apart when surrounded by destruction. Now I can see what you meant when you said we have to create. It's the only thing we can do. I read a book, The Spinster by Sylvia Baton Warner. You're probably familiar with it. What impressed me so much about it was that Sylvia helped the children find channels to express their aggressions in a creative rather than a destructive way. That's what we have to do. We have to revolutionize the dead lump called the present educational system from Dick & Jane into an alive process not a product...And help other people learn to be creative rather than destructive. With this we could change the world. One person can do a lot. Two people can do even more. Since I listened to Mrs. Kennedy I have faith. This is the first time for many years that I really do have faith. Now when I consider and feel what have been mere words that once seemed idiotically ideal and illusory---faith, hope and charity---these words become my essence. They become the whole. When life is so absurd you have to make a choice about living---Yes or no---and if it's no then end your life but if it is yes throw yourself right into it and say yes to every second and yes to any one second is yes to the whole of existence. This is what you and Mrs. Kennedy have helped me learn. Love, (a student)

\nCorita.org. (z.d.-a). Corita.org. Geraadpleegd op 19 mei 2022, van https://www.corita.org/
      `,
    },
    {
      src: './justice/69-60.jpg',
      title: "i'm glad i can feel pain",
      isVisibleInMuseum: false,
      description: `
Transcribed Text
...Kennedy is dead. Fabrics can be torn & shredded and fall apart. Social fabrics are the only thing that hold us together. This is a time to be strong. The national tendency under such devastating displays of violence is to collapse. I am afraid that a collapse would engender relapse, relapse into violence triggered by despair. I'm trying to be strong. I'm trying to direct all my energies to positive things. Kennedy believed in our people. We have to trust ourselves. We are living, therefore we have to give ourselves to life. So many living people are dead. So many people have commited mental suicide. People are so afraid. I don't believe we were born to be afraid. This is something man has created by and for himself, probably unconsciously. Maybe this is the problem, man hasn't been facing choices and consciously making a choice---really choosing, but instead he has been letting other forces outside of himself control him and he isn't even aware that the he in him is dead perhaps murdered. When someone as influential as Kennedy is killed it makes people every where face the reality that it takes guts and courage to be human and to be what you are and believe what you are. Kennedy was a leader who could help people do this. He was helping the establishment understand minority groups. He was helping us understand what it means to be human and that each individual is an intergral part of the social fabric. Now his voice has been silenced but not really just physically. We all have to find our voice and the medium through which we can make it be heard...We all have a voice and we all have to listen. I'm very upset but I'm glad I can feel pain.Love, (a student)
    `,
    },
    {
      src: './justice/69-62.jpg',
      title: 'the cry that will be heard',
      isVisibleInMuseum: false,
      description: `
Transcribed Text
LIFE THE NEGRO AND THE CITIESThe Cry That Will Be Heard March 8, 1968 35 WHY NOT GIVE A DAMN ABOUT YOUR FELLOW MAN GIVE A DAMN Put your girl to sleep some time with rats instead of nursery rhymes with hunger and your other children by her side And wonder if you'll share your bed with something else that must be fed for fear may lie beside you or it may sleep down the hall and it might begin to teach you how to give a damn about your fellow man and it might begin to teach you how to give a damn about your fellow man. Come and see how well despair is seasoned by the stiffling air see a ghetto in the good old sizzling summertime suppose as the streets were all on fire the flames like tempers leaping higher suppose you lived there all you life do you think that you would mind and it might begin to reach you why we give a damn about our fellow man and it might begin to teach you how to give a damn about your fellow man and it might begin to reach you why we give a damn. If you'd take the train with me uptown through the misery of ghetto streets in morning light there's always night.Take a window seat put down your times you can read between the lines just meet the faces that you meet beyond the window's pane and it might begin to teach you how to give a damn about your fellow man and it might begin to teach you how to give a damn about your fellow man and it might begin to teach you how to give a damn about your fellow man. FOR (W.E.L.) (As recorded by Spanky & Our Gang/ Mercury) SCHARF

\nCorita.org. (z.d.-a). Corita.org. Geraadpleegd op 19 mei 2022, van https://www.corita.org/
      `,
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
              geometry={nodes['justice-painting'].geometry}
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
              nodes[`justice-painting00${index as 1 | 2 | 3 | 4 | 5 | 6 | 7}`]
                .geometry
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
            material={new THREE.MeshBasicMaterial({ map: painting })}
          />
        );
      })}
    </>
  );
};
