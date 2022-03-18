import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useXREvent, XRController, XREvent } from '@react-three/xr';
import React, { useEffect, useRef } from 'react';

interface Props {
  XRController: XRController;
}

export const XRTeleport: React.FC<Props> = (props) => {
  const { XRController } = props;
  const { controller, inputSource } = XRController;
  const lineRef = useRef<any>(null);
  const bufferRef = useRef<THREE.BufferGeometry>();
  const lineSegments = 10;
  const lineGeometryVertices = new Float32Array((lineSegments + 1) * 3);
  lineGeometryVertices.fill(0);
  const lineGeometryColors = new Float32Array((lineSegments + 1) * 3);
  lineGeometryColors.fill(0.5);
  const { gl, camera } = useThree();
  const g = new THREE.Vector3(0, -9.8, 0); //Gravity
  const tempVector = useRef<THREE.Vector3>(new THREE.Vector3());
  const tempVector1 = useRef<THREE.Vector3>(new THREE.Vector3());
  const tempVectorP = useRef<THREE.Vector3>(new THREE.Vector3());
  const tempVectorV = useRef<THREE.Vector3>(new THREE.Vector3());
  let guidingController = useRef<THREE.Group | null>(null);

  useXREvent('selectstart', onSelectStart);
  useXREvent('selectend', onSelectEnd);

  useEffect(() => {
    if (bufferRef.current) {
      bufferRef.current.setAttribute(
        'position',
        new THREE.BufferAttribute(lineGeometryVertices, 3)
      );

      //   bufferRef.current.setAttribute(
      //     'color',
      //     new THREE.BufferAttribute(lineGeometryColors, 3)
      //   );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <line ref={lineRef}>
      <bufferGeometry ref={bufferRef} />
      <lineBasicMaterial color={0x888888} blending={THREE.AdditiveBlending} />
    </line>
  );

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
    if (e.controller.hand) {
      return;
    }

    if (lineRef.current) {
      console.log('startGuide', controller);
      guidingController.current = controller;
      controller.add(lineRef.current);
    }
  }

  function onSelectEnd(e: XREvent) {
    const feetPos = gl.xr
      .getCamera(camera)
      .getWorldPosition(tempVector.current);
    feetPos.y = 0;

    if (guidingController.current) {
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
      //  locomotion(offset);

      // Clean up
      guidingController.current = null;
      lineRef.current.re;
    }
  }
};
