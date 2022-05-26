import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import styles from './canvas.module.scss';
import * as THREE from 'three';

interface CaptionProps {
  titleElement: HTMLHeadingElement;
}

interface Props {
  titleElement: HTMLHeadingElement;
}

const ImageMesh: React.FC<CaptionProps> = (props) => {
  const { titleElement } = props;
  const scale = useRef<THREE.Vector3>(new THREE.Vector3(1, 1, 1));
  const imageTexture = useTexture('./corita.png');
  const { viewport, camera } = useThree();
  const mouseRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const offset = useRef<THREE.Vector3>(new THREE.Vector3());
  const imagePlane = useRef<THREE.Mesh>();
  const [isMouseOver, setIsMouseOver] = useState<boolean>(false);

  const uniforms = useRef<{
    [uniform: string]: THREE.IUniform<any>;
  }>({
    uTexture: {
      //texture data
      value: imageTexture,
    },
    uOffset: {
      //distortion strength
      value: new THREE.Vector2(0.0, 0.0),
    },
    uAlpha: {
      //opacity
      value: 0,
    },
  });

  const vertexShader = `
  uniform vec2 uOffset;
  varying vec2 vUv;

  #define M_PI 3.1415926535897932384626433832795

  vec3 deformationCurve(vec3 position, vec2 uv, vec2 offset) {
    position.x = position.x + (sin(uv.y * 3.14) * offset.x);
    position.y = position.y + (sin(uv.x * 3.14) * offset.y);
    return position;
  }

  void main() {
    vUv = uv;
    vec3 newPosition = deformationCurve(position, uv, uOffset);
    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
  }
  `;

  const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uAlpha;
  varying vec2 vUv;

  void main() {
    vec3 color = texture2D(uTexture,vUv).rgb;
    gl_FragColor = vec4(color,uAlpha);
  }
  `;

  useEffect(() => {
    let imageRatio = 650 / 341;
    scale.current.set(imageRatio, 1, 1);

    if (imagePlane.current) {
      imagePlane.current.scale.copy(scale.current);
    }

    titleElement.addEventListener('mousemove', (ev: MouseEvent) => {
      onMouseMove(ev);
    });

    titleElement.addEventListener('mouseleave', onMouseLeave);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame(() => {
    if (imagePlane.current) {
      imagePlane.current.position.set(
        mouseRef.current.x,
        mouseRef.current.y,
        0
      );

      uniforms.current.uAlpha.value = lerp(
        uniforms.current.uAlpha.value,
        isMouseOver ? 1 : 0,
        0.1
      );
    }
  });

  return (
    <mesh ref={imagePlane}>
      <planeBufferGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
        transparent={true}
      />
    </mesh>
  );

  function lerp(v0: number, v1: number, t: number) {
    return v0 * (1 - t) + v1 * t;
  }

  function onMouseMove(ev: MouseEvent) {
    // get normalized mouse position on viewport
    setIsMouseOver(true);
    mouseRef.current.x = (ev.clientX / window.innerWidth) * 2 - 1;
    mouseRef.current.y = -(ev.clientY / window.innerWidth) * 2 + 1;

    if (imagePlane.current)
      offset.current = imagePlane.current.position
        .clone()
        .sub(mouseRef.current)
        .multiplyScalar(-0.7);

    uniforms.current.uOffset.value = offset.current;
  }

  function onMouseLeave(ev: MouseEvent) {
    setIsMouseOver(false);
  }
};

const Background: React.FC = () => {
  return (
    <mesh scale={100} position={[1.25, 1.25, -6]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color={new THREE.Color(0xffdede)} />
    </mesh>
  );
};

const CanvasComponent: React.FC<Props> = (props) => {
  const { titleElement } = props;
  return (
    <div className={styles.container}>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 10], fov: 22 }}>
        <Background />
        <group>
          <ImageMesh titleElement={titleElement} />
        </group>
      </Canvas>
    </div>
  );
};

export default CanvasComponent;
