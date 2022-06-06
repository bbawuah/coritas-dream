import { DefaultXRControllers, Interactive } from '@react-three/xr';
import { Room } from 'colyseus.js';
import { XRTeleport } from '../vr/teleport';
import { GLTFNodes } from '../environment/types/types';
import { getState, useStore } from '../../../store/store';
import { NonPlayableCharacters } from '../users/NonPlayableCharacters/NonPlayableCharacters';
import { useState } from 'react';
import { SVGButton } from '../svgButton/svgButton';
interface Props {
  room: Room;
  nodes: GLTFNodes;
}

// interface PanelProps extends TitleProps {}
// interface TitleProps {
//   id: string;
//

export const XRCanvas: React.FC<Props> = (props) => {
  const { room, nodes } = props;
  const { playerIds } = useStore(({ playerIds }) => ({
    playerIds,
  }));

  return (
    <>
      <DefaultXRControllers />
      <XRTeleport room={room} navMeshGeometry={nodes['navmesh'].geometry} />
      {renderNonPlayableCharacters()}
    </>
  );

  function renderNonPlayableCharacters() {
    const players = getState().players;

    if (players) {
      const jsx = playerIds
        .filter((data) => data !== room.sessionId)
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
