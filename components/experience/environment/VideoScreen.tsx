import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { useStore } from '../../../store/store';
import { ComponentProps } from './types/types';
import { Text } from '@react-three/drei';

export const VideoScreen: React.FC<ComponentProps> = (props) => {
  const position = new THREE.Vector3(23, 7.3, 0.2);
  const rotation = new THREE.Euler(0, -Math.PI / 2, 0);
  const { nodes } = props;
  const { canvasContainerRef, set } = useStore(
    ({ canvasContainerRef, set }) => ({ canvasContainerRef, set })
  );
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
    <>
      <Text
        color={'#000'}
        fontSize={0.7}
        letterSpacing={0.03}
        lineHeight={1}
        textAlign={'center'}
        position={position}
        rotation={rotation}
        font={'./fonts/NeutralFace-Bold.woff'}
      >
        {'Click to play the video'}
      </Text>
      <mesh
        geometry={nodes.screen001.geometry}
        material={material}
        onPointerOver={() => {
          if (canvasContainerRef) {
            canvasContainerRef.style.cursor = 'pointer';
          }
        }}
        onPointerLeave={() => {
          if (canvasContainerRef) {
            canvasContainerRef.style.cursor = 'grab';
          }
        }}
        onClick={handlePlayVideo}
      />
    </>
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
