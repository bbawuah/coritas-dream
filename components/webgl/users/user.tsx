import React, { useEffect, useRef, useState, useCallback } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { Controls, getState, useStore } from '../../../store/store';
import { INTERSECTED, NOT_INTERSECTED } from 'three-mesh-bvh';
import { useCustomVariables } from '../../../hooks/useCustomVariables';
import { Room } from 'colyseus.js';
import {
  IHandlePhysicsProps,
  IUserDirection,
} from '../../../server/physics/types';
import { useKeys } from '../../../hooks/useKeys';

interface Props {
  position: THREE.Vector3;
  room: Room;
}

interface PlayerInfo extends THREE.Mesh {
  capsuleInfo?: {
    radius: number;
    segment: THREE.Line3;
  };
}

interface Keys {
  [x: string]: string;
}

const keys: Keys = {
  w: 'forward',
  s: 'backward',
  a: 'left',
  d: 'right',
};

const gravity = -30;
const playerSpeed = 10;
const physicsSteps = 5;
let playerIsOnGround = false;

export const User: React.FC<Props> = (props) => {
  const { position, room } = props;
  const userRef = useRef<THREE.Mesh>();
  const controlsRef = useRef<any>();
  const { get, set } = useStore(({ get, set }) => ({ get, set }));
  const {
    velocity,
    upVector,
    tempVector,
    tempVector2,
    tempBox,
    tempMat,
    tempSegment,
  } = useCustomVariables();

  useKeys();
  const { collider } = get();
  let controls: Controls;
  let userDirection: IUserDirection;

  useEffect(() => {
    if (userRef.current) {
      (userRef.current as PlayerInfo).capsuleInfo = {
        radius: 0.5,
        segment: new THREE.Line3(
          new THREE.Vector3(),
          new THREE.Vector3(0, 1.0, 0.0)
        ),
      };
    }
  }, []);

  useFrame((state, dt) => {
    controls = getState().controls;
    userDirection = getState().userDirection;

    if (collider) {
      collider.visible = true;
      for (let i = 0; i < physicsSteps; i++) {
        updatePlayer(dt / physicsSteps);
      }
    }

    if (userRef.current && controlsRef) {
      room.send('move', {
        userDirection,
        azimuthalAngle: controlsRef.current.getAzimuthalAngle(),
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
        position={position}
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

  function updatePlayer(dt: number) {
    // Add gravity to player position
    // velocity.current.y += playerIsOnGround ? 0 : dt * gravity;
    userRef.current?.position.addScaledVector(velocity.current, dt);

    const angle = controlsRef?.current.getAzimuthalAngle();

    movePlayer(angle, dt);

    const capsuleInfo = (userRef.current as PlayerInfo)?.capsuleInfo;
    tempBox.current.makeEmpty();
    tempMat.current.copy(collider.matrixWorld).invert();

    if (capsuleInfo && userRef.current) {
      tempSegment.current.copy(capsuleInfo.segment);

      // get the position of the capsule in the local space of the collider
      tempSegment.current.start
        .applyMatrix4(userRef.current.matrixWorld)
        .applyMatrix4(tempMat.current);
      tempSegment.current.end
        .applyMatrix4(userRef.current.matrixWorld)
        .applyMatrix4(tempMat.current);

      // get the axis aligned bounding box of the capsule
      tempBox.current.expandByPoint(tempSegment.current.start);
      tempBox.current.expandByPoint(tempSegment.current.end);

      tempBox.current.min.addScalar(-capsuleInfo.radius);
      tempBox.current.max.addScalar(capsuleInfo.radius);

      collider.geometry.boundsTree?.shapecast({
        intersectsBounds: (box) => {
          if (box.intersectsBox(tempBox.current)) {
            return INTERSECTED;
          }
          return NOT_INTERSECTED;
        },
        intersectsTriangle: (triangle) => {
          // check if the triangle is intersecting the capsule and adjust the
          // capsule position if it is.
          // console.log(triangle);
          const triPoint = tempVector.current;
          const capsulePoint = tempVector2.current;

          const distance = triangle.closestPointToPoint(triPoint, capsulePoint);

          // console.log(distance);

          // if (distance.are < capsuleInfo.radius) {
          //   const depth = capsuleInfo.radius - distance;
          //   const direction = capsulePoint.sub(triPoint).normalize();

          //   tempSegment.current.start.addScaledVector(direction, depth);
          //   tempSegment.current.end.addScaledVector(direction, depth);

          //   return true;
          // }

          return false;
        },
      });
    }
  }

  function movePlayer(angle: number, dt: number) {
    if (controls.forward) {
      // tempVector.current.set(0, 0, -1).applyAxisAngle(upVector.current, angle);
      // userRef?.current?.position.addScaledVector(
      //   tempVector.current,
      //   playerSpeed * dt
      // );

      const data: IHandlePhysicsProps = {
        azimuthalAngle: angle,
        userDirection: 'forward',
      };

      room.send('move', data);
    }

    if (controls.backward) {
      tempVector.current.set(0, 0, 1).applyAxisAngle(upVector.current, angle);
      userRef?.current?.position.addScaledVector(
        tempVector.current,
        playerSpeed * dt
      );
    }

    if (controls.left) {
      tempVector.current.set(-1, 0, 0).applyAxisAngle(upVector.current, angle);
      userRef?.current?.position.addScaledVector(
        tempVector.current,
        playerSpeed * dt
      );
    }

    if (controls.right) {
      tempVector.current.set(1, 0, 0).applyAxisAngle(upVector.current, angle);
      userRef?.current?.position.addScaledVector(
        tempVector.current,
        playerSpeed * dt
      );
    }

    userRef.current?.updateMatrixWorld();
  }
};
