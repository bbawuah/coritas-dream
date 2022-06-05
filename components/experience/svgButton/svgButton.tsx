import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { useController, useInteraction, useXR } from '@react-three/xr';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';

interface Props {
  url: string;
  isPressed: boolean;
  isHovered: boolean;
}

export const SVGButton: React.FC<Props> = (props) => {
  const { url, isHovered } = props;
  const ref = useRef<THREE.Group>();
  const { scene, camera } = useThree();
  const rightController = useController('right');
  const { player } = useXR();
  const { paths } = useLoader(SVGLoader, url);
  const svgMesh = useRef<THREE.Mesh>();
  const plane = useRef<THREE.Mesh>();
  const buttonBackgroundRef = useRef<THREE.Mesh>();
  const [isPressed, setIsPressed] = useState<boolean>(false);
  const labelsRef = useRef<THREE.Mesh>();
  const unmuteColor = useRef(new THREE.Color(0xffffff));
  const muteColor = useRef(new THREE.Color(0xff0000));
  const temporaryWorldDirection = useRef<THREE.Vector3>(new THREE.Vector3());

  useInteraction(buttonBackgroundRef, 'onSelect', () => {
    setIsPressed(!isPressed);
  });

  useEffect(() => {
    if (
      rightController?.controller &&
      labelsRef.current &&
      buttonBackgroundRef.current
    ) {
      rightController?.controller.add(labelsRef.current);
      rightController?.controller.add(buttonBackgroundRef.current);
      labelsRef.current.position.y = 0.12;
      labelsRef.current.position.x = 0.03;
      labelsRef.current.position.z = -0.15;

      buttonBackgroundRef.current.position.y = 0.15;
      buttonBackgroundRef.current.position.x = 0.02;
      buttonBackgroundRef.current.position.z = -0.2;

      buttonBackgroundRef.current.visible = false;
    }

    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];

      const material = new THREE.MeshBasicMaterial({
        color: isPressed
          ? new THREE.Color(0xffffff)
          : new THREE.Color(0xff0000),
        side: THREE.DoubleSide,
        depthWrite: true,
      });

      const shapes = SVGLoader.createShapes(path);

      for (let j = 0; j < shapes.length; j++) {
        const shape = shapes[j];
        const geometry = new THREE.ShapeGeometry(shape);
        svgMesh.current = new THREE.Mesh(geometry, material);

        svgMesh.current.rotateZ(Math.PI);
        svgMesh.current.position.y = 0.2;
        svgMesh.current.position.x = 0.05;
        svgMesh.current.position.z = -0.15;

        svgMesh.current.scale.set(0.005, 0.005, 0.005);

        if (ref.current) {
          ref.current.add(svgMesh.current);

          scene.add(svgMesh.current);
          rightController?.controller?.add(svgMesh.current);
        }
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rightController?.controller]);

  useFrame((state) => {
    if (svgMesh.current) {
      (svgMesh.current.material as THREE.MeshBasicMaterial).color = isPressed
        ? unmuteColor.current
        : muteColor.current;
    }

    if (ref.current) {
      const direction = state.gl.xr
        .getCamera(camera)
        .getWorldDirection(temporaryWorldDirection.current);

      ref.current.position.set(
        camera.position.x,
        camera.position.x,
        camera.position.z - 5
      );
    }
  });

  return (
    <group ref={ref}>
      <mesh ref={buttonBackgroundRef}>
        <planeGeometry args={[0.1, 0.1, 1, 1]} />
        <meshBasicMaterial color={new THREE.Color(0x00ff00)} />
      </mesh>
      <Text
        ref={labelsRef}
        color={'#000'}
        fontSize={0.03}
        letterSpacing={0.03}
        lineHeight={1}
      >
        {isPressed ? 'Unmute' : 'Mute'}
      </Text>
    </group>
  );
};
