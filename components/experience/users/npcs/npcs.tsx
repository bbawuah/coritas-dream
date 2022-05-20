import { useFrame, useLoader, useThree } from '@react-three/fiber';
import React, { useEffect, useRef } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { getState, useStore } from '../../../../store/store';
import { UserModel } from '../userModel';
import * as THREE from 'three';

interface Props {
  id: string;
  glbUrl: string;
}
export const NonPlayableCharacters: React.FC<Props> = (props) => {
  const { glbUrl, id } = props;
  const gltf = useLoader(GLTFLoader, glbUrl);
  const { players } = useStore(({ players }) => ({ players }));
  const { scene } = useThree();
  const userRef = useRef<UserModel>();
  const lookAt = useRef<THREE.Vector3>(new THREE.Vector3());
  const newPosition = useRef<THREE.Vector3>(new THREE.Vector3());

  useEffect(() => {
    const player = players[id];

    if (userRef.current && !player) {
      console.log('should be removed');
      userRef.current.controlObject.traverse((child) => scene.remove(child));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players, id]);

  useEffect(() => {
    const player = players[id];
    if (userRef.current && userRef.current.actions && player) {
      userRef.current.fadeToAction(players[id].animationState, 0.25);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players[id]?.animationState]);

  useEffect(() => {
    userRef.current = new UserModel({
      gltf,
      scene,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state, dt) => {
    if (userRef.current) {
      const player = getState().players[id];

      if (player) {
        lookAt.current.set(player.rx, player.ry, player.rz);
        newPosition.current.set(player.x, player.y, player.z);
        userRef.current.controlObject.lookAt(lookAt.current);
        userRef.current.controlObject.position.lerp(newPosition.current, 0.1);
      }

      if (userRef.current.mixer) {
        userRef.current.mixer.update(dt);
      }
    }
  });

  return null;
};
