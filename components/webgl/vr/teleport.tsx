import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import {
  useXR,
  useXREvent,
  useXRFrame,
  XRController,
  XREvent,
} from '@react-three/xr';
import React, { useEffect, useRef, useState } from 'react';
import { NavigationLine } from './navigationLine';

interface Props {}

export const XRTeleport: React.FC<Props> = (props) => {
  const { player } = useXR();
  const bufferRef = useRef<THREE.BufferGeometry>();
  const { gl, camera, scene } = useThree();
  const g = new THREE.Vector3(0, -9.8, 0); //Gravity
  const tempVector = useRef<THREE.Vector3>(new THREE.Vector3());
  const tempVector1 = useRef<THREE.Vector3>(new THREE.Vector3());
  const tempVectorP = useRef<THREE.Vector3>(new THREE.Vector3());
  const tempVectorV = useRef<THREE.Vector3>(new THREE.Vector3());

  const [isPressed, setIsPressed] = useState<boolean>(false);
  let guidingController = useRef<THREE.Group | null>(null);
  const lineRef = useRef<NavigationLine>(new NavigationLine(scene));

  useXREvent('selectstart', onSelectStart, { handedness: 'right' });
  useXREvent('selectend', onSelectEnd, { handedness: 'right' });

  useEffect(() => {
    if (isPressed) {
      console.log(lineRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPressed]);

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
        const t = (-v.y + Math.sqrt(v.y ** 2 - 2 * p.y * g.y)) / g.y;

        for (let i = 1; i <= lineRef.current.lineSegments; i++) {
          // set vertex to current position of the virtual ball at time t
          positionAtT(vertex, (i * t) / lineRef.current.lineSegments, p, v, g);

          guidingController.current.worldToLocal(vertex);
          // Copy it to the Array Buffer
          vertex.toArray(lineRef.current.lineGeometryVertices, i * 3);
        }

        if (lineRef.current) {
          lineRef.current.guideline.geometry.attributes.position.needsUpdate =
            true;
        }
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

    setIsPressed(true);
    guidingController.current = controller.controller;

    if (lineRef.current) {
      controller.controller.add(lineRef.current.guideline as any as THREE.Line);
    }
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
      const t = (-v.y + Math.sqrt(v.y ** 2 - 2 * p.y * g.y)) / g.y;
      // Calculate t, this is the above equation written as JS
      const cursorPos = positionAtT(tempVector1.current, t, p, v, g);

      // Offset
      const offset = cursorPos.addScaledVector(feetPos, -1);

      // Do the locomotion
      player.position.copy(offset);

      // Clean up
      guidingController.current = null;
      controller.controller.remove(lineRef.current.guideline);
    }
  }
};
