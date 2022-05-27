/* eslint-disable @next/next/no-img-element */
import React, { Suspense, useEffect, useRef, useState } from 'react';
import * as styles from './canvas.module.scss';
import classNames from 'classnames';
import { Canvas } from '@react-three/fiber';
import { User } from '../users/user';
import { Physics } from '../../../shared/physics/physics';
import { Sky, useGLTF } from '@react-three/drei';
import { VRCanvas } from '@react-three/xr';
import { Perf } from 'r3f-perf';
import { getState, useStore } from '../../../store/store';
import { useDeviceCheck } from '../../../hooks/useDeviceCheck';
import { Environment } from '../environment/Environment';
import { BlendFunction } from 'postprocessing';
import {
  EffectComposer,
  Bloom,
  Noise,
  BrightnessContrast,
} from '@react-three/postprocessing';
import { GLTFResult } from '../environment/types/types';
import { SettingsMenu } from '../../core/headers/settingsMenu/settingsMenu';
import { OnboardingManager } from '../../domain/onboardingManager/onBoardingManager';
import { client } from '../../../utils/supabase';
import { useRealtime } from 'react-supabase';
import { NonPlayableCharacters } from '../users/NonPlayableCharacters/NonPlayableCharacters';
import { VoiceCallManager } from '../../domain/voiceCallManager/voiceCallManager';
import { Modal } from '../../core/modal/modal';
import { Icon } from '../../core/icon/Icon';
import { IconType } from '../../../utils/icons/types';
import { XRCanvas } from './xrCanvas';
import { Room } from 'colyseus.js';

interface Props {
  room: Room;
  id: string;
  isWebXrSupported: boolean;
}

interface ProfileData {
  avatar: string;
  updated_at: string;
  id: string;
  username: string | null;
}

const CanvasComponent: React.FC<Props> = (props) => {
  const { isWebXrSupported, room, id } = props;
  const { nodes } = useGLTF(
    '/environment-transformed.glb'
  ) as unknown as GLTFResult;
  const { isInVR, isDesktop } = useDeviceCheck();
  const [physics, setPhysics] = useState<Physics | null>(null);
  const [_, reexecute] = useRealtime('profiles');
  const [userAvatar, setUserAvatar] = useState<string>();
  const userAudio = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [clickedPlayers, setClickedPlayers] = useState<{ id: string }[]>([]);
  const classes = classNames([styles.container]);
  const [shouldRenderInstructions, setShouldRenderInstructions] =
    useState<boolean>(false);
  const { playerIds, focusImage, set } = useStore(
    ({ playerIds, focusImage, set }) => ({
      playerIds,
      focusImage,
      set,
    })
  );

  useEffect(() => {
    getUserModel();
    setPhysics(new Physics());

    if (containerRef.current) {
      set((state) => ({ ...state, canvasContainerRef: containerRef.current }));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={containerRef} className={classes}>
      {renderCanvas()}
    </div>
  );

  function renderCanvas() {
    if (!physics) {
      return null;
    }

    if (isWebXrSupported && isInVR && isDesktop) {
      return (
        <VRCanvas>
          <Suspense fallback={null}>
            <XRCanvas id={id} room={room} physics={physics} nodes={nodes} />
          </Suspense>
          {renderNpcs()}
          {/* <Perf /> */}
        </VRCanvas>
      );
    }

    return (
      <>
        <SettingsMenu room={room} />
        <OnboardingManager />
        <VoiceCallManager room={room} clickedPlayers={clickedPlayers} id={id} />
        {renderFocusImage()}
        <Canvas camera={{ fov: 70, position: [0, 1.8, 6] }}>
          <Sky
            turbidity={10.2}
            rayleigh={0}
            inclination={0.51}
            mieCoefficient={0.003}
            mieDirectionalG={0.029}
            azimuth={91.5}
          />
          {/* <Perf /> */}
          <ambientLight intensity={1.2} />
          <directionalLight color="white" position={[-3, 3, -2]} />
          {renderUser()}
          {renderNpcs()}
          <Environment nodes={nodes} physics={physics} />
          <EffectComposer>
            <Noise
              opacity={0.3}
              premultiply
              blendFunction={BlendFunction.ADD}
            />
            <BrightnessContrast brightness={-0.07} contrast={0.1} />
            <Bloom />
          </EffectComposer>
        </Canvas>
        <div
          className={styles.instructionsIconContainer}
          onClick={() => setShouldRenderInstructions(true)}
        >
          <Icon
            icon={IconType.instruction}
            className={styles.instructionsIcon}
          />
        </div>
        {renderInstructions()}
        <audio className={styles.audio} playsInline ref={userAudio} autoPlay />
      </>
    );
  }

  function renderUser() {
    if (userAvatar && physics) {
      return <User id={id} room={room} physics={physics} glbUrl={userAvatar} />;
    }
  }

  async function getUserModel() {
    const user = client.auth.user();
    const data = await reexecute();

    if (data && data.data && user) {
      const profile = data.data.filter(
        (data: ProfileData) => data.id === user.id
      );

      if (profile?.length) {
        const { avatar } = profile[0];
        setUserAvatar(avatar as string);
      }
    }
  }

  function renderNpcs() {
    const players = getState().players;

    if (players) {
      const jsx = playerIds
        .filter((data) => data !== id)
        .map((playerId, index) => {
          const player = players[playerId];

          return (
            <NonPlayableCharacters
              key={index}
              playerData={player}
              onClick={() => setClickedPlayers((v) => [{ id: player.id }])}
              onPointerOver={() => {
                if (containerRef?.current)
                  containerRef.current.style.cursor = 'pointer';
              }}
              onPointerLeave={() => {
                if (containerRef?.current)
                  containerRef.current.style.cursor = 'grab';
              }}
              room={room}
            />
          );
        });

      return jsx;
    }
  }

  function renderFocusImage() {
    if (focusImage) {
      return (
        <Modal>
          <div className={styles.modalContainer}>
            <img
              className={styles.image}
              alt="focus"
              src={focusImage.src}
            ></img>
            <div className={styles.contentContainer}>
              <div className={styles.headingContainer}>
                <h3>{focusImage.title}</h3>
                <div
                  className={styles.iconContainer}
                  onClick={() => {
                    set((state) => ({ ...state, focusImage: undefined }));
                  }}
                >
                  <Icon icon={IconType.close} className={styles.icon} />
                </div>
              </div>
              <div className={styles.paragraphContainer}>
                {focusImage.isVisibleInMuseum ? (
                  <p className={styles.inStedelijk}>
                    Artwork now visible in the Stedelijk museum
                  </p>
                ) : (
                  <p className={styles.notInStedelijk}>
                    Artwork is not visible in the Stedelijk museum
                  </p>
                )}
                <p className={styles.paragraph}>{focusImage.description}</p>
              </div>
            </div>
          </div>
        </Modal>
      );
    }
  }

  function renderInstructions() {
    if (shouldRenderInstructions) {
      return (
        <Modal>
          <div className={styles.instructionsContainer}>
            <div className={styles.instructionsHeadingContainer}>
              <div
                className={styles.instructionsCloseIconContainer}
                onClick={() => setShouldRenderInstructions(false)}
              >
                <Icon icon={IconType.close} />
              </div>
              <h3>Controls</h3>
            </div>
            <div className={styles.instructionsRowsContainer}>
              <div className={styles.instructionsRow}>
                <div className={styles.item}>
                  <h4 className={styles.itemTitle}>Move</h4>
                  <p>Use these keys to navigate</p>
                  <div className={styles.itemColumn}>
                    <img src={'./controls/keys-1.png'} alt={'keys'}></img>
                    <p>or</p>
                    <img src={'./controls/keys-2.png'} alt={'keys'}></img>
                  </div>
                </div>
                <div className={styles.item}>
                  <h4 className={styles.itemTitle}>Orbit Camera</h4>
                  <p>Drag the screen to look around.</p>
                  <img src={'./controls/orbit.png'} alt={'keys'}></img>
                </div>
              </div>
              <div className={styles.instructionsRow}>
                <div className={styles.item}>
                  <h4 className={styles.itemTitle}>Voice call</h4>
                  <p>Click on a player to start a voice call.</p>
                  <img src={'./controls/player.png'} alt={'keys'}></img>
                </div>
                <div className={styles.item}>
                  <h4 className={styles.itemTitle}>paintings</h4>
                  <p>Click on painting to get more information.</p>
                  <img src={'./controls/mini-painting.png'} alt={'keys'}></img>
                </div>
              </div>
              <div className={styles.instructionsRow}>
                <h4 className={styles.itemTitle}>Animations</h4>
                <div className={styles.animationsContainer}>
                  <div>
                    <p>Pray</p>
                    <img src={'./controls/1.png'} alt={'controls'}></img>
                  </div>
                  <div>
                    <p>Fist</p>

                    <img src={'./controls/2.png'} alt={'controls'}></img>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      );
    }
  }
};

export default CanvasComponent;
