// Based on the xr-locomotion-starter https://github.com/SamsungInternet/xr-locomotion-starter
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useXR, useXREvent } from '@react-three/xr';
import React, { useEffect, useRef } from 'react';
import { NavigationLine } from './navigationLine';
import { HighlightMesh } from './highlightMesh';
import { Room } from 'colyseus.js';
import { getState } from '../../../store/store';
import { XRTeleportationData } from './types';

// Type for XR event data
interface XREventData {
  type: string;
  data: XRInputSource;
}

interface Props {
  room: Room;
  navMeshGeometry: THREE.BufferGeometry;
}

export const XRTeleport: React.FC<Props> = (props) => {
  const { room, navMeshGeometry } = props;
  const origin = useXR((state) => state.origin);
  const { gl, camera, scene } = useThree();
  const players = getState().players;
  const canTeleport = useRef<boolean>(true);
  const originRef = useRef<THREE.Object3D | null>(null);

  // Keep ref synced with origin
  useEffect(() => {
    originRef.current = origin ?? null;
  }, [origin]);

  const gravity = new THREE.Vector3(0, -9.8, 0); //Gravity
  const tempVector = useRef<THREE.Vector3>(new THREE.Vector3());
  const tempVector1 = useRef<THREE.Vector3>(new THREE.Vector3());
  const tempVectorP = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const tempVectorV = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  let guidingController = useRef<THREE.Group | null>(null);
  const lineRef = useRef<NavigationLine>(new NavigationLine(scene, 0x888888));
  const highLightMesh = useRef<HighlightMesh>(new HighlightMesh());

  const counter = useRef<number>(0);
  const worldDirection = useRef<XRViewerPose | undefined>();
  const temporaryWorldDirection = useRef<THREE.Vector3>(new THREE.Vector3());
  const green = new THREE.Color(0x00ff00);
  const red = new THREE.Color(0xff0000);
  const rotationMatrix = useRef<THREE.Matrix4>(new THREE.Matrix4());
  const raycaster = useRef<THREE.Raycaster>(new THREE.Raycaster());
  raycaster.current.params.Line = {
    threshold: 3,
  };

  const navMesh = useRef<THREE.Mesh>(
    new THREE.Mesh(
      navMeshGeometry,
      new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        opacity: 0.3,
        transparent: true,
      })
    )
  );

  navMesh.current.position.set(0, 0, 0);
  navMesh.current.visible = false;

  useXREvent('selectstart', onSelectStart, { handedness: 'right' }); //Handedness Should come from option menu
  useXREvent('selectend', onSelectEnd, { handedness: 'right' }); //Handedness Should come from option menu

  // Add navMesh to scene and clean up on unmount
  useEffect(() => {
    const currentNavMesh = navMesh.current;
    const currentLine = lineRef.current;
    const currentHighlight = highLightMesh.current;

    scene.add(currentNavMesh);

    return () => {
      // Remove navMesh from scene
      scene.remove(currentNavMesh);
      if (currentNavMesh.geometry) currentNavMesh.geometry.dispose();
      if (currentNavMesh.material) {
        (currentNavMesh.material as THREE.Material).dispose();
      }

      // Clean up NavigationLine
      if (currentLine.guideline) {
        scene.remove(currentLine.guideline);
        if (currentLine.guideline.geometry) currentLine.guideline.geometry.dispose();
        if (currentLine.guideline.material) {
          (currentLine.guideline.material as THREE.Material).dispose();
        }
      }

      // Clean up HighlightMesh
      if (currentHighlight.mesh) {
        scene.remove(currentHighlight.mesh);
        if (currentHighlight.mesh.geometry) currentHighlight.mesh.geometry.dispose();
        if (currentHighlight.mesh.material) {
          (currentHighlight.mesh.material as THREE.Material).dispose();
        }
      }
    };
  }, [scene]);

  // Set player starting position
  useEffect(() => {
    const playerData = players?.[room.sessionId];
    if (playerData && originRef.current) {
      const startingPosition = new THREE.Vector3(
        playerData.x,
        originRef.current.position.y + 0.5,
        playerData.z
      );

      originRef.current.position.add(startingPosition);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state, dt) => {
    if (guidingController.current && lineRef.current) {
      const vertex = tempVector.current.set(0, 0, 0);
      const referenceSpace = gl.xr.getReferenceSpace();
      const frame = (state.gl.xr as any).getFrame() as XRFrame;
      if (referenceSpace && frame)
        worldDirection.current = frame.getViewerPose(referenceSpace);
      if (guidingController.current) {
        // Controller start position
        rotationMatrix.current.extractRotation(
          guidingController.current.matrixWorld
        );

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
          highLightMesh.current.mesh.position,
          t * 0.98,
          p,
          v,
          gravity
        );

        highLightMesh.current.mesh.position.y =
          highLightMesh.current.mesh.position.y + 0.5;

        raycaster.current.ray.origin.set(p.x, p.y, p.z);
        raycaster.current.ray.direction
          .set(vertex.x, vertex.y, vertex.z)
          .normalize()
          .applyMatrix4(rotationMatrix.current);

        const intersects = raycaster.current.intersectObject(navMesh.current);

        if (intersects.length) {
          (
            highLightMesh.current.mesh.material as THREE.RawShaderMaterial
          ).uniforms.u_color.value = green;
          canTeleport.current = true;
        } else {
          (
            highLightMesh.current.mesh.material as THREE.RawShaderMaterial
          ).uniforms.u_color.value = red;
          canTeleport.current = false;
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

  function onSelectStart(e: XREventData) {
    // This is e.data is an XRInputSource and if
    // it has a hand and being handled by hand tracking so do nothing
    const data = e.data as XRInputSource & { hand?: unknown };
    if (data && data.hand) {
      return;
    }

    // Get controller from the scene - in XR v6 the event structure has changed
    // For now, we'll use a simplified approach
    const controllers = gl.xr.getController(0);
    guidingController.current = controllers;

    controllers.add(lineRef.current.guideline as any as THREE.Line);
    scene.add(highLightMesh.current.mesh);
  }

  function onSelectEnd(e: XREventData) {
    const controller = gl.xr.getController(0);
    if (!canTeleport.current) {
      return;
    }

    if (guidingController.current) {
      const feetPos = gl.xr
        .getCamera()
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

      // Offset (New position)
      const offset = cursorPos.addScaledVector(feetPos, -1);

      // Do the locomotion
      if (originRef.current) {
        originRef.current.position.add(offset);

        const direction = gl.xr
          .getCamera()
          .getWorldDirection(temporaryWorldDirection.current);

        const action: XRTeleportationData = {
          worldDirection: direction.multiplyScalar(100),
          position: originRef.current.position,
          animationState: 'walking',
        };

        room.send('teleport', action);

        setTimeout(() => {
          if (originRef.current) {
            const action: XRTeleportationData = {
              worldDirection: direction.multiplyScalar(100),
              position: originRef.current.position,
              animationState: 'idle',
            };
            room.send('teleport', action);
          }
        }, 500);
      }

      if (counter.current >= 99) {
        counter.current = 0;
      } else {
        counter.current++;
      }

      // Clean up
      guidingController.current = null;
      controller.remove(lineRef.current.guideline);
      scene.remove(highLightMesh.current.mesh);
    }
  }

  //   function handleMove({detail}) {
  //     // Turn left
  //     if (detail.value > 0) {
  //         player.rotation.y -= Math.PI/4;
  //     }
  //     // Turn right
  //     if (detail.value < 0) {
  //         player.rotation.y += Math.PI/4;
  //     }
  // }
};
