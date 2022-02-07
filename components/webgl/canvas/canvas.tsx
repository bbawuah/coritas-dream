import React from 'react';
import io from 'socket.io-client';
import * as THREE from 'three';
import * as styles from './canvas.module.scss';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Box } from '../box/box';
import { Room } from '../room/room';

interface Props {}

const CanvasComponent: React.FC<Props> = (props) => {
  const socket = io();
  const room: string = 'exhibition';

  socket.on('message', (message) => {
    console.log(message);
  });

  socket.on('roomData', (data) => {
    console.log(data);
  });

  socket.emit('join', room, (error: string | undefined) => {
    if (error) {
      console.log(error);
    }
  });

  socket.on('disconnect', () => {
    console.log('disconnect');
  });

  const randomPosition = new THREE.Vector3(
    Math.random() * 15 - 2,
    Math.random() * 2,
    Math.random() * 15 - 2
  );

  return (
    <div className={styles.container}>
      <Canvas camera={{ fov: 70, position: [0, 1.8, 6] }}>
        <color attach="background" args={['#0000ff']} />
        <Room />
        <ambientLight intensity={0.3} />
        <directionalLight color="red" position={[0, 3, 0]} />
        <Box position={randomPosition} />
        <OrbitControls enablePan={true} enableZoom={true} />
      </Canvas>
    </div>
  );
};

export default CanvasComponent;
