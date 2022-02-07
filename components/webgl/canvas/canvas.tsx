import React from 'react';
import io, { Socket } from 'socket.io-client';
import * as THREE from 'three';
import * as styles from './canvas.module.scss';
import { Canvas } from '@react-three/fiber';
import { UserWrapper } from '../userWrapper/userWrapper';
import { Room } from '../room/room';
import { ClientType } from '../../../types/socket';
import { ControlsWrapper } from '../controlsWrapper/controlsWrapper';

interface Props {
  clients: ClientType;
  socket: Socket;
}

const CanvasComponent: React.FC<Props> = (props) => {
  const { clients, socket } = props;

  return (
    <div className={styles.container}>
      <Canvas camera={{ fov: 70, position: [0, 1.8, 6] }}>
        <color attach="background" args={['#0000ff']} />
        <ambientLight intensity={0.3} />
        <directionalLight color="red" position={[0, 3, 0]} />
        <Room />
        <ControlsWrapper socket={socket} />
        {renderUsers()}
      </Canvas>
    </div>
  );

  function renderUsers() {
    const keys = Object.keys(clients);
    const users = keys
      .filter((clientKey) => clientKey !== socket.id)
      .map((client) => {
        const { position, rotation } = clients[client];

        const vector3: THREE.Vector3 = new THREE.Vector3(
          position[0],
          position[1],
          position[2]
        );
        const euler: THREE.Euler = new THREE.Euler(
          rotation[0],
          rotation[1],
          rotation[2]
        );

        return (
          <UserWrapper
            key={client}
            position={vector3}
            rotation={euler}
            id={client}
          />
        );
      });

    return users;
  }
};

export default CanvasComponent;
