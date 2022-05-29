import { Sky } from '@react-three/drei';
import { DefaultXRControllers, Interactive } from '@react-three/xr';
import { Room } from 'colyseus.js';
import { Physics } from '../../../shared/physics/physics';
import { XRTeleport } from '../vr/teleport';
import { Environment } from '../environment/Environment';
import { GLTFNodes } from '../environment/types/types';
import { getState, useStore } from '../../../store/store';
import { NonPlayableCharacters } from '../users/NonPlayableCharacters/NonPlayableCharacters';
import { useThree } from '@react-three/fiber';

interface Props {
  room: Room;
  id: string;
  physics: Physics;
  nodes: GLTFNodes;
}

// interface PanelProps extends TitleProps {}
// interface TitleProps {
//   id: string;
// }

export const XRCanvas: React.FC<Props> = (props) => {
  const { room, id, physics, nodes } = props;
  const { scene } = useThree();
  const { playerIds } = useStore(({ playerIds }) => ({
    playerIds,
  }));

  return (
    <>
      <DefaultXRControllers />
      <XRTeleport
        room={room}
        id={id}
        navMeshGeometry={nodes['navmesh'].geometry}
      />
      {renderNonPlayableCharacters()}
      {/* <MakeTextPanel scene={scene} /> */}
      <Environment physics={physics} nodes={nodes} />
    </>
  );

  function renderNonPlayableCharacters() {
    const players = getState().players;

    if (players) {
      const jsx = playerIds
        .filter((data) => data !== id)
        .map((playerId, index) => {
          const player = players[playerId];

          return (
            <Interactive key={index}>
              <NonPlayableCharacters
                playerData={player}
                onClick={() => console.log('osme')}
                room={room}
              />
            </Interactive>
          );
        });

      return jsx;
    }
  }
};
