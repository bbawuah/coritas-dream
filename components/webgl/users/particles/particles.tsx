import * as THREE from 'three';
import { ReactThreeFiber, useFrame, extend } from '@react-three/fiber';
import React, { Suspense, useRef } from 'react';
import { MeshLine, MeshLineMaterial } from '../../../../utils/THREE.MeshLine';

extend({ MeshLine, MeshLineMaterial });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      meshLine: ReactThreeFiber.Object3DNode<MeshLine, typeof MeshLine>;
      meshLineMaterial: ReactThreeFiber.Object3DNode<
        MeshLineMaterial,
        typeof MeshLineMaterial
      >;
    }
  }
}

interface Props {
  curve: THREE.Vector3[];
  width: number;
  speed: number;
  color: string;
}

export const Particles: React.FC<Props> = (props) => {
  const { curve, width, speed, color } = props;
  const material = useRef<THREE.ShaderMaterial>();

  useFrame(() => {
    if (material.current) {
      material.current.uniforms.dashOffset.value -= speed;
    }
  });

  return (
    <Suspense fallback={null}>
      <mesh>
        <meshLine attach="geometry" points={curve} />
        <meshLineMaterial
          ref={material}
          depthTest={false}
          color={color}
          lineWidth={width}
          dashArray={0.1}
          dashRatio={0.95}
          transparent={true}
        />
      </mesh>
    </Suspense>
  );
};
