import { useFrame, useThree } from '@react-three/fiber';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import {
  ActionNames,
  getState,
  IPlayerNetworkData,
  IPlayerType,
  useStore,
} from '../../../../store/store';
import { UserModel } from '../userModel';
import * as THREE from 'three';
import { client } from '../../../../utils/supabase';
import { Text } from '@react-three/drei';
import { Room } from 'colyseus.js';

interface Props {
  playerData?: IPlayerNetworkData;
  onClick?: () => void;
  onPointerOver: () => void;
  onPointerLeave: () => void;
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
  const { playerData, onClick, onPointerOver, onPointerLeave, room } = props;
  const userRef = useRef<UserModel>();
  const [isSsr, setIsSsr] = useState<boolean>(true);
  // const [isModelLoaded, setIsModelLoaded] = useState<boolean>(false);
  const gltfLoader = useRef<GLTFLoader>(new GLTFLoader());
  const dracoLoader = useRef<DRACOLoader>(new DRACOLoader());
  dracoLoader.current.setDecoderPath('draco/');
  gltfLoader.current.setDRACOLoader(dracoLoader.current);
  const labelsRef = useRef<any>();
  const newPositionLabel = useRef<THREE.Vector3>(new THREE.Vector3());
  const lerpAlpha = 0.1;
  const { camera } = useThree();

  const lookAt = useRef<THREE.Vector3>(new THREE.Vector3());
  const newPosition = useRef<THREE.Vector3>(new THREE.Vector3());
  const [animationState, setAnimationState] = useState<ActionNames>();
  const { players } = useStore(({ players }) => ({ players }));

  useEffect(() => {
    const state = getState().players;
    if (players && playerData && state) {
      const playersList = state[playerData.id];
      if (playersList) {
        setAnimationState((v) => {
          if (v !== playersList.animationState) {
            return playersList.animationState;
          }

          return v;
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players]);

  useEffect(() => {
    setIsSsr(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSsr]);

  useEffect(() => {
    const state = getState().players;

    if (playerData && animationState && state) {
      const player = state[playerData.id];

      if (userRef.current && userRef.current.actions && player) {
        userRef.current.fadeToAction(animationState, 0.25);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animationState]);

  useEffect(() => {
    getPlayer();
    getRemovedPlayer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerData]);

  useFrame((state, dt) => {
    const playersList = getState().players;

    if (userRef.current && playerData && playersList) {
      const player = playersList[playerData.id];

      if (player) {
        lookAt.current.set(player.rx, player.ry, player.rz);
        newPosition.current.set(player.x, player.y, player.z);
        userRef.current.controlObject.lookAt(lookAt.current);
        userRef.current.controlObject.position.lerp(newPosition.current, 0.1);

        newPositionLabel.current.set(player.x, player.y + 2, player.z);

        if (labelsRef.current) {
          labelsRef.current.position.lerp(newPositionLabel.current, lerpAlpha);
          newPositionLabel.current.set(0, 0, 0);
          labelsRef.current.quaternion.copy(camera.quaternion);
        }
      }

      if (userRef.current.mixer) {
        userRef.current.mixer.update(dt);
      }
    }
  });

  return renderPlayer();

  function renderPlayer() {
    if (!userRef?.current?.controlObject) {
      return null;
    }

    return (
      <Suspense fallback={null}>
        <primitive
          object={userRef.current.controlObject}
          onClick={() => onClick?.()}
          onPointerOver={() => onPointerOver()}
          onPointerLeave={() => onPointerLeave()}
        />

        <Text
          ref={labelsRef}
          color={'#000'}
          fontSize={0.25}
          letterSpacing={0.03}
          lineHeight={1}
        >
          {playerData?.id}
        </Text>
      </Suspense>
    );
  }

  function getRemovedPlayer() {
    room.onMessage('removePlayer', (data) => {
      const { players } = data;
      const newIds = Object.keys(players);
      const didPlayerLeave = newIds.filter((v) => v === playerData?.id);

      if (didPlayerLeave.length === 0) {
        userRef.current = undefined;
      }
    });
  }

  async function getPlayer() {
    try {
      const { data, error, status } = await client
        .from('profiles')
        .select(`id, avatar`);

      if (error) {
        throw error;
      }

      if (data && playerData) {
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
