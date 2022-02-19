import React, { useEffect, useState } from 'react';
import { Debug, Physics } from '@react-three/cannon';
import * as THREE from 'three';
import * as styles from './canvas.module.scss';
import { Canvas, addEffect, addAfterEffect } from '@react-three/fiber';
import { User } from '../user/user';
import { ClientType } from '../../../types/socket';
import { Controls } from '../controls/controls';
import { Floor } from '../floor/floor';
import StatsImpl from 'stats.js';
import { useStore } from '../../../store/store';
import { Keyboard } from '../../../hooks/useKeys';
import { OtherUsers } from '../user/otherUsers';

interface Props {}

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
  return (
    <div className={styles.container}>
      <Canvas camera={{ fov: 70, position: [0, 1.8, 6] }}>
        <color attach="background" args={['#ffffff']} />
        <ambientLight intensity={0.3} />
        <directionalLight color="white" position={[0, 3, 0]} />
        {renderUser()}
        {/* {renderOtherUsers()} */}
        <Floor />
        <Keyboard />
        <Stats />
      </Canvas>
    </div>
  );

  function renderUser() {
    // const user = keys.filter((key) => key === channel.id)[0];

    // if (user && clients) {
    //   const { position, rotation } = (clients as ClientType)[user];

    //   const vector3: THREE.Vector3 = new THREE.Vector3(
    //     position[0],
    //     position[1],
    //     position[2]
    //   );

    //   const euler: THREE.Euler = new THREE.Euler(
    //     rotation[0],
    //     rotation[1],
    //     rotation[2]
    //   );
    //
    // }

    return (
      <User
        position={new THREE.Vector3(0, 1, 0)}
        rotation={new THREE.Euler(0, 0, 0)}
        id={'user'}
      />
    );
  }

  // function renderOtherUsers() {
  //   const users = keys
  //     .filter((key) => key !== channel.id)
  //     .map((clientId) => {
  //       const { position, rotation } = (clients as ClientType)[clientId];

  //       const vector3: THREE.Vector3 = new THREE.Vector3(
  //         position[0],
  //         position[1],
  //         position[2]
  //       );
  //       const euler: THREE.Euler = new THREE.Euler(
  //         rotation[0],
  //         rotation[1],
  //         rotation[2]
  //       );

  //       return (
  //         <OtherUsers
  //           key={clientId}
  //           position={vector3}
  //           rotation={euler}
  //           id={clientId}
  //         />
  //       );
  //     });

  //   return users;
  // }
};

export default CanvasComponent;
