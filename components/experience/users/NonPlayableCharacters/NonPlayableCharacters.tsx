import { useFrame, useLoader, useThree } from '@react-three/fiber';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import {
  getState,
  IPlayerNetworkData,
  useStore,
} from '../../../../store/store';
import { UserModel } from '../userModel';
import * as THREE from 'three';
import { Room } from 'colyseus.js';
import { client } from '../../../../utils/supabase';

interface Props {
  playerData: IPlayerNetworkData;
  room: Room;
}

interface ProfileData {
  avatar: string;
  updated_at: string;
  id: string;
  username: string | null;
}

// Hier moet je eigenlijk async call hebben naar 3D model

export const NonPlayableCharacters: React.FC<Props> = (props) => {
  const { playerData, room } = props;
  const { scene } = useThree();
  const userRef = useRef<UserModel>();
  const [isSsr, setIsSsr] = useState<boolean>(true);
  // const [isModelLoaded, setIsModelLoaded] = useState<boolean>(false);
  const gltfLoader = useRef<GLTFLoader>(new GLTFLoader());
  const dracoLoader = useRef<DRACOLoader>(new DRACOLoader());
  dracoLoader.current.setDecoderPath('draco/');
  gltfLoader.current.setDRACOLoader(dracoLoader.current);

  const lookAt = useRef<THREE.Vector3>(new THREE.Vector3());
  const newPosition = useRef<THREE.Vector3>(new THREE.Vector3());

  const { players } = useStore(({ players }) => ({ players }));

  useEffect(() => {
    setIsSsr(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSsr]);

  useEffect(() => {
    const player = players[playerData.id];

    if (userRef.current && userRef.current.actions && player) {
      userRef.current.fadeToAction(players[playerData.id].animationState, 0.25);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players[playerData.id]?.animationState]);

  useEffect(() => {
    (async () => {
      await getPlayer();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state, dt) => {
    if (userRef.current) {
      const player = getState().players[playerData.id];

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

  return (
    <Suspense fallback={null}>
      {userRef.current?.controlObject && (
        <primitive object={userRef.current?.controlObject} />
      )}
    </Suspense>
  );

  async function getPlayer() {
    try {
      const { data, error, status } = await client
        .from('profiles')
        .select(`id, avatar`);

      if (error) {
        throw error;
      }

      if (data) {
        const playerObject = data.filter((value: ProfileData) => {
          return value.id === playerData.uuid;
        })[0];

        gltfLoader.current.load(playerObject.avatar, (gltf) => {
          userRef.current = new UserModel({
            gltf,
          });
        });
      }
    } catch (e) {
      return e;
    }
  }
};
