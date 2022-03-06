import React, { useEffect, useRef, useState } from 'react';
import * as styles from './canvas.module.scss';
import { Canvas, addEffect, addAfterEffect } from '@react-three/fiber';
import { User } from '../users/user';
import { Floor } from '../floor/floor';
import StatsImpl from 'stats.js';
import { InstancedUsers } from '../users/instancedUsers';
import { Client, Room } from 'colyseus.js';
import { Physics } from '../../../shared/physics/physics';

interface Props {
  client: Client;
  room: Room;
  id: string;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parent]);
  return null;
}

const CanvasComponent: React.FC<Props> = (props) => {
  // TODO: Add grabbing cursor
  const { room, id } = props;
  const [physics, setPhysics] = useState<Physics | null>(null);

  useEffect(() => {
    setPhysics(new Physics());
  }, []);

  return <div className={styles.container}>{renderCanvas()}</div>;

  function renderCanvas() {
    if (!physics) {
      return null;
    }

    return (
      <Canvas camera={{ fov: 70, position: [0, 1.8, 6] }}>
        <color attach="background" args={['#ffffff']} />
        <ambientLight intensity={0.5} />
        <directionalLight color="white" position={[0, 3, 0]} />
        <User id={id} room={room} physics={physics} />
        <InstancedUsers playerId={id} room={room} />
        <Floor />
        <Stats />
      </Canvas>
    );
  }
};

export default CanvasComponent;
