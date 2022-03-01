import React, { useEffect, useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { getState } from '../../../store/store';
import { Room } from 'colyseus.js';
import { IUserDirection } from '../../../server/physics/types';
import { useKeyboardEvents } from '../../../hooks/useKeys';
import { useSphere } from '@react-three/cannon';
import { IDirection } from '../../../server/player/types';

interface Props {
  room: Room;
  id: string;
}

export const User: React.FC<Props> = (props) => {
  const { id, room } = props;
  const players = getState().players;
  const userRef = useRef<THREE.Mesh>();
  const [ref, api] = useSphere(() => ({
    args: [0.45],
    mass: 1,
    position: [players[id].x, players[id].y, players[id].z],
  }));
  const controlsRef = useRef<any>();
  let userDirection: IUserDirection;
  const direction = useRef<THREE.Vector3>(new THREE.Vector3());
  const frontVector = useRef<THREE.Vector3>(new THREE.Vector3());
  const sideVector = useRef<THREE.Vector3>(new THREE.Vector3());
  const upVector = useRef<THREE.Vector3>(new THREE.Vector3(0, 1, 0));
  const movement = useRef<IDirection>({
    forward: false,
    backward: false,
    right: false,
    left: false,
    idle: false,
  });
  const velocity = useRef([0, 0, 0]);
  const playerSpeed = 10;
  useKeyboardEvents(); //Use keyboard events

  useEffect(() => {
    const unsubscribe = api.velocity.subscribe((v) => (velocity.current = v));

    if (userRef.current && ref.current) {
      const startingPosition = new THREE.Vector3(
        players[id].x,
        players[id].y,
        players[id].z
      );

      // Set starting position on mount
      userRef.current.position.copy(startingPosition);
    }

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state, dt) => {
    userDirection = getState().userDirection;

    if (userRef.current && controlsRef) {
      room.send('move', {
        userDirection,
        azimuthalAngle: controlsRef.current.getAzimuthalAngle(),
      });

      // handleClientSidePrediction();

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

  function handleClientSidePrediction() {
    for (let move in movement.current) {
      const key = move as IUserDirection;
      resetMovement(key, userDirection);
    }

    movement.current[userDirection] = true;

    handleClientSideCalculations(controlsRef.current.getAzimuthalAngle());
  }

  function resetMovement(
    property: IUserDirection,
    userDirection: IUserDirection
  ) {
    if (movement.current[property] === movement.current[userDirection]) {
      movement.current[property] = true;
    }
    movement.current[property] = false;
  }

  function handleClientSideCalculations(angle: number) {
    frontVector.current.setZ(
      Number(movement.current.backward) - Number(movement.current.forward)
    );
    sideVector.current.setX(
      Number(movement.current.left) - Number(movement.current.right)
    );

    direction.current
      .subVectors(frontVector.current, sideVector.current)
      .normalize()
      .multiplyScalar(playerSpeed)
      .applyAxisAngle(upVector.current, angle);

    api.velocity.set(
      direction.current.x,
      velocity.current[1],
      direction.current.z
    );

    // api.position.subscribe((value) => {
    //   userRef.current?.position.fromArray(value);
    // });
  }
};
