import React, { useEffect, useRef } from 'react';
import { OrbitControls, useHelper } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {
  getState,
  IPlayerCoordinations,
  IPlayerType,
} from '../../../store/store';
import { Room } from 'colyseus.js';
import {
  IHandlePhysicsProps,
  IUserDirection,
} from '../../../shared/physics/types';
import { useKeyboardEvents } from '../../../hooks/useKeys';
import { IDirection } from '../../../server/player/types';
import { Physics } from '../../../shared/physics/physics';
import { OnMoveProps } from './types';

interface Props {
  room: Room;
  id: string;
  physics: Physics;
}

export const User: React.FC<Props> = (props) => {
  const { id, room, physics } = props;
  const players = getState().players;
  const userRef = useRef<THREE.Mesh>();
  const controlsRef = useRef<any>();
  const processedAction = useRef<IPlayerType | null>(null);
  const currentAction = useRef<IHandlePhysicsProps | null>(null);
  const physicalBody = useRef<CANNON.Body | null>(null);
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
  const processedVector = useRef<THREE.Vector3>(new THREE.Vector3());
  const physicalBodyVector = useRef<CANNON.Vec3>(new CANNON.Vec3());
  const counter = useRef<number>(0);
  const playerSpeed = 10;
  const frameTime = useRef<number>(0.0);
  const idealOffset = useRef<THREE.Vector3>(new THREE.Vector3(-15, 20, -30));

  const [getDirection] = useKeyboardEvents({
    keyDownEvent,
    keyUpEvent,
  }); //Use keyboard events

  useEffect(() => {
    if (userRef.current) {
      // Create physics
      physicalBody.current = physics.createPlayerPhysics<IPlayerCoordinations>(
        players[id]
      ); // Create phyisical represenatation of player
      physics.physicsWorld.addBody(physicalBody.current); //Add to physics world

      // Create vector3
      const startingPosition = new THREE.Vector3(
        players[id].x,
        players[id].y,
        players[id].z
      );

      // Update processed position
      processedAction.current = {
        [id]: {
          id: players[id].id,
          timestamp: players[id].timestamp,
          x: players[id].x,
          y: players[id].y,
          z: players[id].z,
        },
      };

      // Set starting position on mount
      userRef.current.position.copy(startingPosition);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state, dt) => {
    frameTime.current += state.clock.getElapsedTime();
    if (userRef.current && controlsRef) {
      const direction = getDirection();

      if (direction !== 'idle') {
        handleSendPosition(direction);
      }

      if (currentAction.current) {
        // Handle client prediction
        handleUserDirection(currentAction.current);
      }

      room.onMessage('move', handleOnMessageMove);

      state.camera.position.sub(controlsRef.current.target);
      controlsRef.current.target.copy(userRef.current.position);
      state.camera.position.add(userRef.current.position);

      physics.updatePhysics(dt); //Update physics 60 fps
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

  function keyDownEvent(direction: IUserDirection) {
    movement.current[direction] = true;
  }

  function keyUpEvent(direction: IUserDirection) {
    movement.current[direction] = false;

    room.send('idle');

    userRef.current?.position.lerp(processedVector.current, 0.01);
    physicalBody.current?.sleep();
  }

  function handleUserDirection(action: IHandlePhysicsProps) {
    const processedTimeStamp = processedAction.current
      ? processedAction.current[id].timestamp
      : -1;

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
      .applyAxisAngle(
        upVector.current,
        controlsRef.current.getAzimuthalAngle()
      );

    // If action is not equal to processedAction, predict position
    if (action.timestamp !== processedTimeStamp) {
      if (physicalBody?.current) {
        physicalBody.current?.wakeUp();
        physicalBody.current.velocity.set(
          direction.current.x,
          physicalBody.current.velocity.y,
          direction.current.z
        );

        userRef.current?.position.set(
          physicalBody.current.position.x,
          physicalBody.current.position.y,
          physicalBody.current.position.z
        );
      }
    } else {
      handleServerReconsiliation();
    }
  }

  function handleServerReconsiliation() {
    // Reconsile with server
    if (processedAction.current) {
      // Processed vector
      processedVector.current.set(
        processedAction.current[id].x,
        processedAction.current[id].y,
        processedAction.current[id].z
      );

      physicalBodyVector.current.set(
        processedAction.current[id].x,
        processedAction.current[id].y,
        processedAction.current[id].z
      );

      userRef.current?.position.lerp(processedVector.current, 0.1);
      physicalBody.current?.position.copy(physicalBodyVector.current);
    }
  }

  function handleOnMessageMove(data: OnMoveProps) {
    const { player } = data;

    if (player.id === id) {
      processedAction.current = {
        [player.id]: {
          id: players[id].id,
          timestamp: player.timestamp,
          x: player.x,
          y: player.y,
          z: player.z,
        },
      };
    }
  }

  function handleSendPosition(direction: IUserDirection) {
    currentAction.current = {
      timestamp: counter.current,
      userDirection: direction,
      azimuthalAngle: controlsRef.current.getAzimuthalAngle(),
    };

    room.send('move', currentAction.current);

    if (counter.current >= 99) {
      counter.current = 0;
    } else {
      counter.current++;
    }
  }
};
