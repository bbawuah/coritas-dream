/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useRef, useState } from 'react';
import * as styles from './canvas.module.scss';
import classNames from 'classnames';
import { Canvas } from '@react-three/fiber';
import { User } from '../users/user';
import { Client, Room } from 'colyseus.js';
import { Physics } from '../../../shared/physics/physics';
import { XRCanvas } from './xrCanvas';
import { Sky, useGLTF } from '@react-three/drei';
import { VRCanvas } from '@react-three/xr';
import { Perf } from 'r3f-perf';
import { getState, IPlayerType, useStore } from '../../../store/store';
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
  const [players, setPlayers] = useState<IPlayerType>();
  const [physics, setPhysics] = useState<Physics | null>(null);
  const [_, reexecute] = useRealtime('profiles');
  const [userAvatar, setUserAvatar] = useState<string>();
  const userAudio = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [clickedPlayers, setClickedPlayers] = useState<{ id: string }[]>([]);
  const classes = classNames([styles.container]);
  const { playerIds, focusImage } = useStore(({ playerIds, focusImage }) => ({
    playerIds,
    focusImage,
  }));

  useEffect(() => {
    getUserModel();
    setPhysics(new Physics());

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
          <XRCanvas id={id} room={room} physics={physics} nodes={nodes} />
          {renderNpcs()}
          <Perf />
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
            <img className={styles.image} alt="focus" src={focusImage}></img>
            <div className={styles.contentContainer}>
              <div className={styles.headingContainer}>
                <h3>Some Title</h3>
              </div>
              <p className={styles.paragraph}>
                Some wiedjishcchdhcsdhjcschcskhcshcjscscdk
              </p>
            </div>
          </div>
        </Modal>
      );
    }
  }
};

export default CanvasComponent;
