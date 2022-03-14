import { useXR, VRCanvas } from '@react-three/xr';
import { Client, Room } from 'colyseus.js';
import { useState } from 'react';
import { useDeviceCheck } from '../../../hooks/useDeviceCheck';
import { Physics } from '../../../shared/physics/physics';
import { Floor } from '../floor/floor';
import { InstancedUsers } from '../users/instancedUsers';
import { User } from '../users/user';

interface Props {
  room: Room;
  id: string;
  physics: Physics;
}

export const XRCanvas: React.FC<Props> = (props) => {
  const { room, id, physics } = props;
  const { player } = useXR();
  const [hovered, setHovered] = useState<boolean>(false);
  const [isMobile] = useDeviceCheck();

  return (
    <VRCanvas>
      <color attach="background" args={['#ffffff']} />
      <ambientLight intensity={0.5} />
      <directionalLight color="white" position={[0, 3, 0]} />
      <User id={id} room={room} physics={physics} />
      <InstancedUsers
        playerId={id}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      />
      <Floor />=
    </VRCanvas>
  );
};
