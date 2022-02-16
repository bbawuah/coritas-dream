import React, { useRef } from 'react';
import * as THREE from 'three';

export const useCustomVariables = () => {
  const velocity = useRef<THREE.Vector3>(new THREE.Vector3());
  const upVector = useRef<THREE.Vector3>(new THREE.Vector3(0, 1, 0));
  const tempVector = useRef<THREE.Vector3>(new THREE.Vector3());
  const tempVector2 = useRef<THREE.Vector3>(new THREE.Vector3());
  const tempBox = useRef<THREE.Box3>(new THREE.Box3());
  const tempMat = useRef<THREE.Matrix4>(new THREE.Matrix4());
  const tempSegment = useRef<THREE.Line3>(new THREE.Line3());

  return {
    velocity,
    upVector,
    tempVector,
    tempVector2,
    tempBox,
    tempMat,
    tempSegment,
  };
};
