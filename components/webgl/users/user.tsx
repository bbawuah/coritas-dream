import React, { useEffect, useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
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

interface Props {
  room: Room;
  id: string;
  physics: Physics;
}

/*
User component should contain an variable where the last action processed by the server get stored.
Every time the server sends a new processed action to client, we update this variable with this value.

The server sends actions from the late past. The client is the actual presence. 
To compensate this we predict actions on the client.
Inside of the renderloop, we should check if the already processed action is equal to the latest action send by the client.
If the server did not process it, we use clientside prediction to determine where the users action.
*/

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

  const velocity = useRef([0, 0, 0]);
  const playerSpeed = 10;

  const [userDirection] = useKeyboardEvents({
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
    if (userRef.current && controlsRef) {
      if (userDirection) {
        if (userDirection !== 'idle') {
          currentAction.current = {
            timestamp: Date.now(),
            userDirection,
            azimuthalAngle: controlsRef.current.getAzimuthalAngle(),
          };

          room.send('move', currentAction.current);
        }

        if (currentAction.current) {
          // Handle client prediction
          handleUserDirection(currentAction.current, dt);
        }

        room.onMessage('move', (data) => {
          const { players } = data;
          const ids = Object.keys(players);

          const playerId = ids.filter((playerId) => playerId === id)[0];

          processedAction.current = {
            [id]: {
              timestamp: players[id].timestamp,
              x: players[id].x,
              y: players[id].y,
              z: players[id].z,
            },
          };

          userRef.current?.position.set(
            players[playerId].x,
            players[playerId].y,
            players[playerId].z
          );
        });
      }

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

  function keyDownEvent(direction: IUserDirection) {
    movement.current[direction] = true;
  }

  function keyUpEvent(direction: IUserDirection) {
    movement.current[direction] = false;
  }

  function handleUserDirection(action: IHandlePhysicsProps, dt: number) {
    if (processedAction.current) {
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

      if (action.timestamp !== processedAction.current[id].timestamp) {
        physicalBody?.current?.velocity.set(
          direction.current.x,
          physicalBody.current.velocity.y,
          direction.current.z
        );

        physics.updatePhysics(dt); //Update physics 60 fps
      } else {
        userRef.current?.position.set(
          processedAction.current[id].x,
          processedAction.current[id].y,
          processedAction.current[id].z
        );
      }
    }
  }
};
