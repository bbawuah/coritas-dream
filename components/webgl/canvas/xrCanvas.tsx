import { Sky } from '@react-three/drei';
import { DefaultXRControllers, useXR } from '@react-three/xr';
import { Room } from 'colyseus.js';
import { useEffect, useState } from 'react';
import { useDeviceCheck } from '../../../hooks/useDeviceCheck';
import { Physics } from '../../../shared/physics/physics';
import { getState } from '../../../store/store';
import { Floor } from '../floor/floor';
import { InstancedUsers } from '../users/instancedUsers';
import { User } from '../users/user';
import { XRTeleport } from '../vr/teleport';

interface Props {
  room: Room;
  id: string;
  physics: Physics;
}

export const XRCanvas: React.FC<Props> = (props) => {
  const { room, id, physics } = props;
  const players = getState().players;
  const { player, isPresenting, controllers } = useXR();
  const [hovered, setHovered] = useState<boolean>(false);
  const [isMobile] = useDeviceCheck();

  useEffect(() => {
    if (isPresenting) {
      console.log('is presenting');
    }
  }, [isPresenting]);
  return (
    <>
      <Sky
        distance={3000}
        turbidity={8}
        rayleigh={6}
        inclination={0.51}
        mieCoefficient={0.0045}
        mieDirectionalG={0.08}
      />
      <DefaultXRControllers />
      {handleTeleport()}
      <color attach="background" args={['#ffffff']} />
      <ambientLight intensity={0.5} />
      <directionalLight color="white" position={[0, 3, 0]} />
      <User id={id} room={room} physics={physics} />
      <InstancedUsers
        playerId={id}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      />
      <Floor />
    </>
  );

  function handleTeleport() {
    if (controllers) {
      controllers.map((controller, index) => {
        return <XRTeleport key={index} controller={controller} />;
      });
    }
  }
};
