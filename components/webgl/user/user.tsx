import React, { useEffect, useRef, useState } from 'react';
import { OrbitControls, Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Socket } from 'socket.io-client';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { Controls, getState, useStore } from '../../../store/store';
import { INTERSECTED, NOT_INTERSECTED } from 'three-mesh-bvh';
import { useCustomVariables } from '../../../hooks/useCustomVariables';

interface Props {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  id: string;
  socket: Socket;
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
const clock = new THREE.Clock();
const physicsSteps = 5;
let playerIsOnGround = false;
// let tempVector2 = new THREE.Vector3();
// let tempBox = new THREE.Box3();
// let tempMat = new THREE.Matrix4();
// let tempSegment = new THREE.Line3();

export const User: React.FC<Props> = (props) => {
  const { position, rotation, id, socket } = props;
  const userRef = useRef<THREE.Mesh>();
  const controlsRef = useRef<any>();
  const { get, set } = useStore(({ get, set }) => ({ get, set }));
  const state = useThree();
  const {
    velocity,
    upVector,
    tempVector,
    tempVector2,
    tempBox,
    tempMat,
    tempSegment,
  } = useCustomVariables();
  const { collider, test } = get();
  let controls: Controls;

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

    if (collider) {
      for (let i = 0; i < physicsSteps; i++) {
        updatePlayer(dt / physicsSteps);
      }
    }
  });

  return (
    <>
      <mesh
        ref={userRef}
        position={position}
        rotation={rotation}
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

    const angle = controlsRef?.current?.getAzimuthalAngle();

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

          // const distance = triangle.closestPointToSegment(
          //   tempSegment,
          //   triPoint,
          //   capsulePoint
          // );

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

      // get the adjusted position of the capsule collider in world space after checking
      // triangle collisions and moving it. capsuleInfo.segment.start is assumed to be
      // the origin of the player model.
      const newPosition = tempVector;
      newPosition.current
        .copy(tempSegment.current.start)
        .applyMatrix4(collider.matrixWorld);

      // check how much the collider was moved
      const deltaVector = tempVector2.current;
      deltaVector.subVectors(newPosition.current, userRef.current.position);

      // if the player was primarily adjusted vertically we assume it's on something we should consider ground
      playerIsOnGround =
        deltaVector.y > Math.abs(dt * velocity.current.y * 0.25);

      const offset = Math.max(0.0, deltaVector.length() - 1e-5);
      deltaVector.normalize().multiplyScalar(offset);

      // adjust the player model
      userRef.current.position.add(deltaVector);

      if (!playerIsOnGround) {
        deltaVector.normalize();
        velocity.current.addScaledVector(
          deltaVector,
          -deltaVector.dot(velocity.current)
        );
      } else {
        velocity.current.set(0, 0, 0);
      }

      state.camera.position.sub(controlsRef.current.target);
      controlsRef.current.target.copy(userRef.current.position);
      state.camera.position.add(userRef.current.position);
    }
  }

  function movePlayer(angle: number, dt: number) {
    if (controls.forward) {
      tempVector.current.set(0, 0, -1).applyAxisAngle(upVector.current, angle);
      userRef?.current?.position.addScaledVector(
        tempVector.current,
        playerSpeed * dt
      );
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
