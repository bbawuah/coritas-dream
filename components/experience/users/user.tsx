import React, { useEffect, useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import {
  getState,
  IPlayerNetworkData,
  IPlayerType,
  useStore,
} from '../../../store/store';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Room } from 'colyseus.js';
import {
  IHandlePhysicsProps,
  IUserDirection,
} from '../../../shared/physics/types';
import { useKeyboardEvents } from '../../../hooks/useKeys';
import { IDirection } from '../../../server/player/types';
import { Physics } from '../../../shared/physics/physics';
import { OnMoveProps } from './types';
import CannonDebugRenderer from '../../../shared/physics/cannonDebugger';
import { UserModel } from './userModel';

interface Props {
  room: Room;
  id: string;
  physics: Physics;
  glbUrl: string;
}

export type Animations = 'idle' | 'walking';

type BaseActions = Record<Animations, { weight: number }>;

export const User: React.FC<Props> = (props) => {
  const { id, room, physics, glbUrl } = props;
  const players = getState().players;
  const { scene } = useThree();
  const { animationName } = useStore(({ animationName }) => ({
    animationName,
  })); //Maybe refactor this late
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
  const gltf = useLoader(GLTFLoader, glbUrl);
  const userRef = useRef<UserModel>();
  const userLookAt = useRef<THREE.Vector3>(new THREE.Vector3());

  // const cannonDebugRenderer = useRef(
  //   new CannonDebugRenderer(scene, physics.physicsWorld)
  // );

  const [getDirection] = useKeyboardEvents({
    keyDownEvent,
    keyUpEvent,
  }); //Use keyboard events

  useEffect(() => {
    userRef.current = new UserModel({
      gltf,
      scene,
    });

    if (userRef.current) {
      // Create physics
      physicalBody.current = physics.createPlayerPhysics<IPlayerNetworkData>(
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
          animationState: players[id].animationState,
          uuid: players[id].uuid,
          x: players[id].x,
          y: players[id].y,
          z: players[id].z,
          rx: players[id].rx,
          ry: players[id].ry,
          rz: players[id].rz,
        },
      };

      // Set starting position on mount
      userRef.current.controlObject.position.add(startingPosition);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlsRef]);

  useEffect(() => {
    if (userRef.current && userRef.current.actions) {
      userRef.current.fadeToAction(animationName.animationName, 0.25);
      room.send('animationState', animationName.animationName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animationName.animationName]);

  useFrame((state, dt) => {
    frameTime.current += state.clock.getElapsedTime();
    if (userRef.current && controlsRef) {
      const userDirection = getDirection();

      if (userDirection !== 'idle') {
        handleSendPosition(userDirection);
      }

      if (userRef.current.mixer) {
        userRef.current.mixer.update(dt);
      }

      if (currentAction.current) {
        // Handle client prediction
        handleUserDirection(currentAction.current);
      }

      room.onMessage('move', handleOnMessageMove);

      state.camera.position.sub(controlsRef.current.target);
      controlsRef.current.target.copy(userRef.current.controlObject.position);
      state.camera.position.add(userRef.current.controlObject.position);

      physics.updatePhysics(dt); //Update physics 60 fps

      // cannonDebugRenderer.current.update();
    }
  });

  return (
    <>
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

    userRef.current?.controlObject.position.lerp(processedVector.current, 0.01);
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

    //Store current lookAt
    if (
      movement.current.backward ||
      movement.current.forward ||
      movement.current.left ||
      movement.current.right
    ) {
      userLookAt.current.copy(direction.current);
      userLookAt.current.multiplyScalar(100);
    }

    // If action is not equal to processedAction, predict position
    if (action.timestamp !== processedTimeStamp) {
      if (physicalBody?.current) {
        physicalBody.current?.wakeUp();
        physicalBody.current.velocity.set(
          direction.current.x,
          physicalBody.current.velocity.y,
          direction.current.z
        );

        userRef.current?.controlObject.position.set(
          physicalBody.current.position.x,
          physicalBody.current.position.y,
          physicalBody.current.position.z
        );

        userRef.current?.controlObject.lookAt(userLookAt.current);
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

      userRef.current?.controlObject.position.lerp(
        processedVector.current,
        0.1
      );
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
          animationState: players[id].animationState,
          uuid: players[id].uuid,
          x: player.x,
          y: player.y,
          z: player.z,
          rx: players[id].rx,
          ry: players[id].ry,
          rz: players[id].rz,
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
