import { Sky } from '@react-three/drei';
import { DefaultXRControllers } from '@react-three/xr';
import { Room } from 'colyseus.js';
import { Suspense } from 'react';
import { Physics } from '../../../shared/physics/physics';
import { Floor } from '../floor/floor';
import { InstancedUsers } from '../users/instancedUsers';
import { XRTeleport } from '../vr/teleport';
import { Model } from '../environment/Environment';

interface Props {
  room: Room;
  id: string;
  physics: Physics;
}

export const XRCanvas: React.FC<Props> = (props) => {
  const { room, id, physics } = props;

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
      <XRTeleport room={room} id={id} />
      <color attach="background" args={['#ffffff']} />
      <ambientLight intensity={0.5} />
      <directionalLight color="white" position={[0, 3, 0]} />
      <InstancedUsers playerId={id} />
      <Suspense fallback={null}>
        <Model />
      </Suspense>
    </>
  );
};
