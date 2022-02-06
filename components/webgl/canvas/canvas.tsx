import React, { useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry';
import * as styles from './canvas.module.scss';

interface Props {}

const Room: React.FC = () => {
  const ref = useRef();

  if (ref.current) {
    (ref.current as THREE.LineSegments).geometry.translate(0, 1.5, 0);
  }

  return (
    <lineSegments
      ref={ref}
      geometry={new BoxLineGeometry(10, 6, 6, 10, 10, 10)}
      material={new THREE.LineBasicMaterial({ color: 0x808080 })}
    />
  );
};

const Box: React.FC = () => {
  const ref = useRef();

  if (ref.current) {
  }

  useFrame((state, delta) => {
    if (ref.current) {
      (ref.current as any).rotation.x = (ref.current as any).rotation.z +=
        delta;
    }
  });

  return (
    <mesh ref={ref} position={[0, 1, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial />
    </mesh>
  );
};

const CanvasComponent: React.FC<Props> = (props) => {
  return (
    <div className={styles.container}>
      <Canvas camera={{ fov: 80, position: [0, 1.6, 3] }}>
        <color attach="background" args={['#505050']} />
        <Room />
        <ambientLight intensity={0.1} />
        <directionalLight color="red" position={[0, 0, 7]} />
        <Box />
      </Canvas>
    </div>
  );
};

export default CanvasComponent;
