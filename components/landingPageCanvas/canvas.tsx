import React from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import styles from './canvas.module.scss';
import * as THREE from 'three';

interface CaptionProps {
  text: string;
  position: [number, number, number];
}
const CaptionText: React.FC<CaptionProps> = (props) => {
  const { text, position } = props;
  const { width } = useThree((state) => state.viewport);

  return (
    <Text
      position={position}
      lineHeight={0.8}
      font="/fonts/NeutralFace.ttf"
      fontSize={width / 8}
      color={new THREE.Color(0x000000)}
      material-toneMapped={false}
      anchorX="left"
      anchorY="middle"
      outlineOffsetX={'10%'}
      outlineOffsetY={'10%'}
      outlineBlur={'25%'}
      outlineOpacity={0.15}
      outlineColor="#000000"
    >
      {text}
    </Text>
  );
};

const Background: React.FC = () => {
  return (
    <mesh scale={100} position={[1.25, 1.25, -6]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color={new THREE.Color(0xffdede)} />
    </mesh>
  );
};

const CanvasComponent: React.FC = () => {
  return (
    <div className={styles.container}>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 10], fov: 22 }}>
        <Background />
        <group>
          <CaptionText text="Justice" position={[1.25, 1.25, -5]} />
          <CaptionText text="Love" position={[2, 0.6, -5]} />
          <CaptionText text="Hope" position={[2.5, -0.05, -5]} />
        </group>
      </Canvas>
    </div>
  );
};

export default CanvasComponent;
