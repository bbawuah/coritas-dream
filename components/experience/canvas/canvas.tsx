import React, { Suspense, useEffect, useState } from 'react';
import * as styles from './canvas.module.scss';
import classNames from 'classnames';
import { Canvas, extend } from '@react-three/fiber';
import { User } from '../users/user';
import { Client, Room } from 'colyseus.js';
import { Physics } from '../../../shared/physics/physics';
import { XRCanvas } from './xrCanvas';
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
import { Pathfinding } from 'three-pathfinding';
import { SettingsMenu } from '../../core/headers/settingsMenu/settingsMenu';
import { OnboardingManager } from '../../domain/onboardingManager/onBoardingManager';
import { client } from '../../../utils/supabase';
import { InstancedUsers } from '../users/instancedUsers';
import { useRealtime } from 'react-supabase';
import { NonPlayableCharacters } from '../users/NonPlayableCharacters/NonPlayableCharacters';

interface Props {
  client: Client;
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
  const { hovered, playersCount } = useStore(({ hovered, playersCount }) => ({
    hovered,
    playersCount,
  })); //Maybe refactor this late
  const { isWebXrSupported, room, id } = props;
  const { nodes } = useGLTF(
    '/environment-transformed.glb'
  ) as unknown as GLTFResult;
  const { isInVR, isDesktop } = useDeviceCheck();
  const [physics, setPhysics] = useState<Physics | null>(null);
  const classes = classNames([
    styles.container,
    {
      [styles.grab]: !hovered,
      [styles.pointer]: hovered,
    },
  ]);
  const [_, reexecute] = useRealtime('profiles');
  const [userAvatar, setUserAvatar] = useState<string>();

  useEffect(() => {
    getUserModel();
    setPhysics(new Physics());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div className={classes}>{renderCanvas()}</div>;

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
    const ids = Object.keys(players);

    const jsx = ids
      .filter((data) => data !== id)
      .map((id, index) => {
        const player = players[id];

        return (
          <NonPlayableCharacters key={index} playerData={player} room={room} />
        );
      });

    return jsx;
  }
};

export default CanvasComponent;
