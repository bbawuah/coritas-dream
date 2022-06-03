import React from 'react';
import { Text, Sky } from '@react-three/drei';
import { Physics } from '../../../shared/physics/physics';
import * as THREE from 'three';
import { GLTFNodes } from '../environment/types/types';
import { Environment } from '../environment/Environment';

interface SceneProps {
  nodes: GLTFNodes;
  physics: Physics;
}

export const BaseScene: React.FC<SceneProps> = (props) => {
  const { nodes, physics } = props;

  return (
    <>
      <Sky
        turbidity={0.2}
        rayleigh={3}
        inclination={0.91}
        mieCoefficient={0.003}
        mieDirectionalG={0.029}
        azimuth={180.5}
      />
      {/* <Perf /> */}

      <ambientLight color="white" intensity={1.7} />
      <directionalLight color="#FF5C00" position={[-3, 3, -2]} />
      <Text
        color={'#FFE3B8'}
        fontSize={8.9}
        letterSpacing={0.03}
        lineHeight={1}
        textAlign={'center'}
        position={new THREE.Vector3(47.75157312030056, 2.5, -74)}
        rotation={new THREE.Euler(0, 6, 0)}
        font={'./fonts/NeutralFace-Bold.woff'}
      >
        {'Love'}
      </Text>
      <Text
        color={'#FFE3B8'}
        fontSize={8.9}
        letterSpacing={0.03}
        lineHeight={1}
        textAlign={'center'}
        position={new THREE.Vector3(-53, 2.5, 74)}
        rotation={new THREE.Euler(0, -4, 0)}
        font={'./fonts/NeutralFace-Bold.woff'}
      >
        {'Justice'}
      </Text>
      <Text
        color={'#FFE3B8'}
        fontSize={8.9}
        letterSpacing={0.03}
        lineHeight={1}
        textAlign={'center'}
        position={new THREE.Vector3(-73, 2.5, -53)}
        rotation={new THREE.Euler(0, 1, 0)}
        font={'./fonts/NeutralFace-Bold.woff'}
      >
        {'Hope'}
      </Text>
      <Environment nodes={nodes} physics={physics} />
    </>
  );
};
