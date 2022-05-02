import React, { Suspense, useEffect, useState } from 'react';
import * as styles from './canvas.module.scss';
import classNames from 'classnames';
import { Canvas } from '@react-three/fiber';
import { User } from '../users/user';
import { InstancedUsers } from '../users/instancedUsers';
import { Client, Room } from 'colyseus.js';
import { Physics } from '../../../shared/physics/physics';
import { XRCanvas } from './xrCanvas';
import { Sky } from '@react-three/drei';
import { VRCanvas } from '@react-three/xr';
import { Perf } from 'r3f-perf';
import { useStore } from '../../../store/store';
import { useDeviceCheck } from '../../../hooks/useDeviceCheck';
import { Environment } from '../environment/Environment';
import { BlendFunction } from 'postprocessing';

import {
  EffectComposer,
  Bloom,
  Noise,
  BrightnessContrast,
} from '@react-three/postprocessing';

interface Props {
  client: Client;
  room: Room;
  id: string;
  isWebXrSupported: boolean;
}

const CanvasComponent: React.FC<Props> = (props) => {
  const { hovered } = useStore(({ hovered }) => ({ hovered })); //Maybe refactor this later
  const { isWebXrSupported, room, id } = props;
  const { isInVR, isDesktop } = useDeviceCheck();
  const [physics, setPhysics] = useState<Physics | null>(null);
  const classes = classNames([
    styles.container,
    {
      [styles.grab]: !hovered,
      [styles.pointer]: hovered,
    },
  ]);

  useEffect(() => {
    setPhysics(new Physics());
  }, []);

  return <div className={classes}>{renderCanvas()}</div>;

  function renderCanvas() {
    if (!physics) {
      return null;
    }

    if (isWebXrSupported && isInVR && isDesktop) {
      return (
        <VRCanvas>
          <XRCanvas id={id} room={room} physics={physics} />
          <Perf />
        </VRCanvas>
      );
    }

    return (
      <Canvas camera={{ fov: 70, position: [0, 1.8, 6] }}>
        <Sky
          turbidity={10.2}
          rayleigh={0}
          inclination={0.51}
          mieCoefficient={0.003}
          mieDirectionalG={0.029}
          azimuth={91.5}
        />

        <ambientLight intensity={0.9} />
        <directionalLight color="white" position={[-3, 3, -2]} />
        <User id={id} room={room} physics={physics} />
        <InstancedUsers playerId={id} />
        <Perf />
        <Suspense fallback={null}>
          <Environment />
        </Suspense>
        <EffectComposer>
          <Noise opacity={0.3} premultiply blendFunction={BlendFunction.ADD} />
          <BrightnessContrast brightness={-0.07} contrast={0.1} />
          <Bloom />
        </EffectComposer>
      </Canvas>
    );
  }
};

export default CanvasComponent;
