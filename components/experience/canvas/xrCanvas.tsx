import { Sky } from '@react-three/drei';
import { DefaultXRControllers } from '@react-three/xr';
import { Room } from 'colyseus.js';
import { Suspense } from 'react';
import { Physics } from '../../../shared/physics/physics';
import { InstancedUsers } from '../users/instancedUsers';
import { XRTeleport } from '../vr/teleport';
import { Environment } from '../environment/Environment';
import { GLTFNodes } from '../environment/types/types';

interface Props {
  room: Room;
  id: string;
  physics: Physics;
  nodes: GLTFNodes;
}

export const XRCanvas: React.FC<Props> = (props) => {
  const { room, id, physics, nodes } = props;

  return (
    <>
      <Sky
        turbidity={10.2}
        rayleigh={0}
        inclination={0.51}
        mieCoefficient={0.003}
        mieDirectionalG={0.029}
        azimuth={91.5}
      />
      <DefaultXRControllers />
      <XRTeleport
        room={room}
        id={id}
        navMeshGeometry={nodes['pathfinding-navmesh'].geometry}
      />
      <color attach="background" args={['#ffffff']} />
      <ambientLight intensity={0.5} />
      <directionalLight color="white" position={[0, 3, 0]} />
      <InstancedUsers playerId={id} />
      <Environment physics={physics} nodes={nodes} />
    </>
  );
};
