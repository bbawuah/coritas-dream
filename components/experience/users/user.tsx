import React, { Suspense, useEffect, useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import {
  getState,
  IPlayerNetworkData,
  IPlayerType,
  useStore,
} from '../../../store/store';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Room } from 'colyseus.js';
import { IMoveProps, IUserDirection } from '../../../shared/physics/types';
import { useKeyboardEvents } from '../../../hooks/useKeys';
import { IDirection } from '../../../server/player/types';
import { Physics } from '../../../shared/physics/physics';
import CannonDebugRenderer from '../../../shared/physics/cannonDebugger';
import { UserModel } from './userModel';

interface Props {
  room: Room;
  physics: Physics;
  glbUrl: string;
}

export type Animations = 'idle' | 'walking';

type BaseActions = Record<Animations, { weight: number }>;

export const User: React.FC<Props> = (props) => {
  const { room, physics, glbUrl } = props;
  const players = getState().players;
  const { scene } = useThree();
  const { animationName } = useStore(({ animationName }) => ({
    animationName,
  })); //Maybe refactor this late
  const controlsRef = useRef<any>();
  const processedAction = useRef<IPlayerType | null>(null);
  const currentAction = useRef<IMoveProps | null>(null);
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
  const playerSpeed = 10;
  const frameTime = useRef<number>(0.0);
  const gltf = useLoader(GLTFLoader, glbUrl);
  const userRef = useRef<UserModel>(
    new UserModel({
      gltf,
    })
  );
  const userLookAt = useRef<THREE.Vector3>(new THREE.Vector3());
  // const textRef = useRef<THREE.Mesh>();
  // const textPosition = useRef<THREE.Vector3>(new THREE.Vector3());

  // const cannonDebugRenderer = useRef(
  //   new CannonDebugRenderer(scene, physics.physicsWorld)
  // );

  const [getDirection] = useKeyboardEvents({
    keyDownEvent,
    keyUpEvent,
  }); //Use keyboard events

  useEffect(() => {
    if (userRef.current && players) {
      // Create physics
      physicalBody.current = physics.createPlayerPhysics<IPlayerNetworkData>(
        players[room.sessionId]
      ); // Create phyisical represenatation of player
      physics.physicsWorld.addBody(physicalBody.current); //Add to physics world

      // Create vector3
      const startingPosition = new THREE.Vector3(
        players[room.sessionId].x,
        players[room.sessionId].y,
        players[room.sessionId].z
      );

      // textPosition.current.set(
      //   players[id].x,
      //   players[id].y + 3.5,
      //   players[id].z - 7
      // );
      // textRef.current.position.copy(textPosition.current);

      // Update processed position
      processedAction.current = {
        [room.sessionId]: {
          id: players[room.sessionId].id,
          timestamp: players[room.sessionId].timestamp,
          animationState: players[room.sessionId].animationState,
          uuid: players[room.sessionId].uuid,
          x: players[room.sessionId].x,
          y: players[room.sessionId].y,
          z: players[room.sessionId].z,
          rx: players[room.sessionId].rx,
          ry: players[room.sessionId].ry,
          rz: players[room.sessionId].rz,
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

      // console.log(userRef.current.controlObject.position);

      handleUserDirection();

      state.camera.position.sub(controlsRef.current.target);
      controlsRef.current.target.copy(userRef.current.controlObject.position);
      state.camera.position.add(userRef.current.controlObject.position);

      physics.updatePhysics(dt); //Update physics 60 fps

      // cannonDebugRenderer.current.update();
    }
  });

  return (
    <Suspense fallback={null}>
      {/* <Text
        color={'#000'}
        fontSize={0.9}
        letterSpacing={0.03}
        lineHeight={1}
        textAlign={'center'}
        ref={textRef}
        font={'./fonts/NeutralFace-Bold.woff'}
      >
        {"Corita's Dream"}
      </Text> */}
      <primitive object={userRef.current?.controlObject} />
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        maxDistance={5}
        enableZoom={false}
        maxPolarAngle={Math.PI / 2}
      />
    </Suspense>
  );

  function keyDownEvent(direction: IUserDirection) {
    movement.current[direction] = true;
  }

  function keyUpEvent(direction: IUserDirection) {
    movement.current[direction] = false;

    userRef.current?.controlObject.position.lerp(processedVector.current, 0.01);
    physicalBody.current?.sleep();
  }

  function handleUserDirection() {
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

    // If action is not equal to processedAction, preif (action.timestamp !== processedTimeStamp) {
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
  }

  function handleSendPosition(direction: IUserDirection) {
    currentAction.current = {
      x: userRef.current.controlObject.position.x,
      y: userRef.current.controlObject.position.y,
      z: userRef.current.controlObject.position.z,
      rx: userLookAt.current.x,
      ry: userLookAt.current.y,
      rz: userLookAt.current.z,
      azimuthalAngle: controlsRef.current.getAzimuthalAngle(),
    };

    room.send('move', currentAction.current);
  }
};
