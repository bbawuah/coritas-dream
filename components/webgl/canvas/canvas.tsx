import React, { useEffect, useState } from 'react';
import { Debug, Physics } from '@react-three/cannon';
import * as THREE from 'three';
import * as styles from './canvas.module.scss';
import { Canvas, addEffect, addAfterEffect } from '@react-three/fiber';
import { User } from '../user/user';
import { Floor } from '../floor/floor';
import StatsImpl from 'stats.js';
import { useStore } from '../../../store/store';
import { Keyboard } from '../../../hooks/useKeys';
import { OtherUsers } from '../user/otherUsers';
import { Client, Room } from 'colyseus.js';
import { IPlayers } from '../../../hooks/useColyseus';

interface Props {
  client: Client;
  room?: Room;
  players: IPlayers[];
  id: string | undefined;
}

interface StatsProps {
  showPanel?: number;
  className?: string;
}

function Stats(props: StatsProps) {
  const { showPanel = 0, className } = props;
  const [stats] = useState(() => new StatsImpl());
  useEffect(() => {
    const node = document.body;

    stats.showPanel(showPanel);
    node.appendChild(stats.dom);

    if (className) stats.dom.classList.add(className);

    const begin = addEffect(() => stats.begin());
    const end = addAfterEffect(() => stats.end());

    return () => {
      node.removeChild(stats.dom);
      begin();
      end();
    };
  }, [parent]);
  return null;
}

const CanvasComponent: React.FC<Props> = (props) => {
  const { client, room, players, id } = props;

  console.log(id);

  return (
    <div className={styles.container}>
      <Canvas camera={{ fov: 70, position: [0, 1.8, 6] }}>
        <color attach="background" args={['#ffffff']} />
        <ambientLight intensity={0.3} />
        <directionalLight color="white" position={[0, 3, 0]} />
        {renderUser()}
        {renderOtherUsers()}
        <Floor />
        <Keyboard />
        <Stats />
      </Canvas>
    </div>
  );

  function renderUser() {
    return (
      <User
        position={new THREE.Vector3(0, 1, 0)}
        rotation={new THREE.Euler(0, 0, 0)}
        id={'user'}
      />
    );
  }

  function renderOtherUsers() {
    const jsx = players.map((player) => {
      return (
        <OtherUsers
          key={player.id}
          position={player.position}
          rotation={new THREE.Euler(0, 0, 0)}
          id={player.id}
        />
      );
    });

    return jsx;
  }
};

export default CanvasComponent;
