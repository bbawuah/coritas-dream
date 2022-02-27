import React, { useEffect, useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { getState } from '../../../store/store';
import { Room } from 'colyseus.js';
import { IUserDirection } from '../../../server/physics/types';
import { useKeyboardEvents } from '../../../hooks/useKeys';

interface Props {
  room: Room;
  id: string;
}

export const User: React.FC<Props> = (props) => {
  const { id, room } = props;
  const userRef = useRef<THREE.Mesh>();
  const controlsRef = useRef<any>();
  useKeyboardEvents(); //Use keyboard events
  let userDirection: IUserDirection;

  useEffect(() => {
    if (userRef.current) {
      const players = getState().players;
      const startingPosition = new THREE.Vector3(
        players[id].x,
        players[id].y,
        players[id].z
      );

      // Set starting position on mount
      userRef.current.position.copy(startingPosition);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state, dt) => {
    userDirection = getState().userDirection;

    if (userRef.current && controlsRef) {
      room.send('move', {
        userDirection,
        azimuthalAngle: controlsRef.current.getAzimuthalAngle(),
      });

      room.onMessage('move', (data) => {
        const { players } = data;
        const ids = Object.keys(players);

        const playerId = ids.filter((playerId) => playerId === id)[0];

        userRef.current?.position.set(
          players[playerId].x,
          players[playerId].y,
          players[playerId].z
        );
      });

      state.camera.position.sub(controlsRef.current.target);
      controlsRef.current.target.copy(userRef.current.position);
      state.camera.position.add(userRef.current.position);
    }
  });

  return (
    <>
      <mesh
        ref={userRef}
        geometry={new RoundedBoxGeometry(1.0, 2.0, 1.0, 10, 0.5)}
        castShadow={true}
        receiveShadow={true}
      >
        <meshStandardMaterial shadowSide={2} />
      </mesh>
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={false}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
};
