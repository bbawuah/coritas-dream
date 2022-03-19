// Based on the repo https://github.com/SamsungInternet/xr-locomotion-starter
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useController, useXR, useXREvent, XREvent } from '@react-three/xr';
import React, { useEffect, useRef } from 'react';
import { NavigationLine } from './navigationLine';
import { HighlightMesh } from './highlightMesh';
import { Room } from 'colyseus.js';
import { getState, IPlayerType } from '../../../store/store';
import { XRTeleportationData } from './types';

interface Props {
  room: Room;
  id: string;
}

export const XRTeleport: React.FC<Props> = (props) => {
  const { room, id } = props;
  const { player } = useXR();
  const { gl, camera, scene } = useThree();
  const players = getState().players;
  const rightController = useController('right');

  const gravity = new THREE.Vector3(0, -9.8, 0); //Gravity
  const tempVector = useRef<THREE.Vector3>(new THREE.Vector3());
  const tempVector1 = useRef<THREE.Vector3>(new THREE.Vector3());
  const tempVectorP = useRef<THREE.Vector3>(new THREE.Vector3());
  const tempVectorV = useRef<THREE.Vector3>(new THREE.Vector3());

  let guidingController = useRef<THREE.Group | null>(null);
  const lineRef = useRef<NavigationLine>(new NavigationLine(scene));
  const highLightPosition = useRef<HighlightMesh>(new HighlightMesh());

  const counter = useRef<number>(0);
  const processedAction = useRef<IPlayerType | null>(null);
  const worldDirection = new THREE.Vector3();

  useXREvent('selectstart', onSelectStart, { handedness: 'right' });
  useXREvent('selectend', onSelectEnd, { handedness: 'right' });

  useEffect(() => {
    // Probeer iets met de gamepad
    const gamepad = rightController?.inputSource.gamepad;

    const startingPosition = new THREE.Vector3(
      players[id].x,
      player.position.y,
      players[id].z
    );

    // Update processed position
    processedAction.current = {
      [id]: {
        id: players[id].id,
        timestamp: players[id].timestamp,
        x: players[id].x,
        y: player.position.y,
        z: players[id].z,
      },
    };

    player.position.add(startingPosition);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame(() => {
    if (guidingController.current && lineRef.current) {
      const vertex = tempVector.current.set(0, 0, 0);

      if (guidingController.current) {
        // Controller start position
        const p = guidingController.current.getWorldPosition(
          tempVectorP.current
        );
        // Set Vector V to the direction of the controller, at 1m/s
        const v = guidingController.current.getWorldDirection(
          tempVectorV.current
        );

        // Scale the initial velocity to 6m/s
        v.multiplyScalar(6);
        const t =
          (-v.y + Math.sqrt(v.y ** 2 - 2 * p.y * gravity.y)) / gravity.y;

        for (let i = 1; i <= lineRef.current.lineSegments; i++) {
          // set vertex to current position of the virtual ball at time t
          positionAtT(
            vertex,
            (i * t) / lineRef.current.lineSegments,
            p,
            v,
            gravity
          );

          guidingController.current.worldToLocal(vertex);
          // Copy it to the Array Buffer
          vertex.toArray(lineRef.current.lineGeometryVertices, i * 3);
        }

        lineRef.current.guideline.geometry.attributes.position.needsUpdate =
          true;

        positionAtT(
          highLightPosition.current.mesh.position,
          t * 0.98,
          p,
          v,
          gravity
        );
      }
    }
  });

  return null;

  function positionAtT(
    inVec: THREE.Vector3,
    t: number,
    p: THREE.Vector3,
    v: THREE.Vector3,
    g: THREE.Vector3
  ) {
    inVec.copy(p);
    inVec.addScaledVector(v, t);
    inVec.addScaledVector(g, 0.5 * t ** 2);
    return inVec;
  }

  function onSelectStart(e: XREvent) {
    // This is e.data is an XRInputSource and if
    // it has a hand and being handled by hand tracking so do nothing
    const { originalEvent, controller } = e;
    if (originalEvent && originalEvent.data && originalEvent.data.hand) {
      return;
    }

    guidingController.current = controller.controller;

    controller.controller.add(lineRef.current.guideline as any as THREE.Line);
    scene.add(highLightPosition.current.mesh);
  }

  function onSelectEnd(e: XREvent) {
    const { controller } = e;
    if (guidingController.current) {
      const feetPos = gl.xr
        .getCamera(camera)
        .getWorldPosition(tempVector.current);

      feetPos.y = 0;

      // cursor position
      // Controller start position
      const p = guidingController.current.getWorldPosition(tempVectorP.current);
      // Set Vector V to the direction of the controller, at 1m/s
      const v = guidingController.current.getWorldDirection(
        tempVectorV.current
      );

      // Scale the initial velocity to 6m/s
      v.multiplyScalar(6);
      const t = (-v.y + Math.sqrt(v.y ** 2 - 2 * p.y * gravity.y)) / gravity.y;
      // Calculate t, this is the above equation written as JS
      const cursorPos = positionAtT(tempVector1.current, t, p, v, gravity);

      // Offset
      const offset = cursorPos.addScaledVector(feetPos, -1);

      // Do the locomotion
      player.position.add(offset);

      const action: XRTeleportationData = {
        azimuthalAngle: worldDirection,
        position: player.position,
      };

      room.send('teleport', action);

      if (counter.current >= 99) {
        counter.current = 0;
      } else {
        counter.current++;
      }

      // Clean up
      guidingController.current = null;
      controller.controller.remove(lineRef.current.guideline);
      scene.remove(highLightPosition.current.mesh);
    }
  }

  //   function handleMove({detail}) {
  //     // Turn left
  //     if (detail.value > 0) {
  //         cameraGroup.rotation.y -= Math.PI/4;
  //     }
  //     // Turn right
  //     if (detail.value < 0) {
  //         cameraGroup.rotation.y += Math.PI/4;
  //     }
  // }
};
