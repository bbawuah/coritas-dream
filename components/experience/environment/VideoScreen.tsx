import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { useStore } from '../../../store/store';
import { ComponentProps } from './types/types';

export const VideoScreen: React.FC<ComponentProps> = (props) => {
  const { nodes } = props;
  const { set } = useStore(({ set }) => ({
    set,
  }));
  const [video] = useState(() =>
    Object.assign(document.createElement('video'), {
      src: './video/video.mp4',
      crossOrigin: 'Anonymous',
    })
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const videoTexture = new THREE.VideoTexture(video);
  const material = new THREE.MeshBasicMaterial({
    toneMapped: false,
    map: videoTexture,
  });

  // useEffect(() => void video.play(), [video]);

  return (
    <mesh
      geometry={nodes.screen001.geometry}
      material={material}
      onPointerOver={() => {
        set((state) => ({ ...state, hovered: true }));
      }}
      onPointerOut={() => set((state) => ({ ...state, hovered: false }))}
      onClick={handlePlayVideo}
    />
  );

  function handlePlayVideo() {
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      return;
    }

    video.play();
    setIsPlaying(true);
  }
};
