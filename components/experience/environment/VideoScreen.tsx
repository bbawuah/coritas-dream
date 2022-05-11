import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { ComponentProps } from './types/types';

export const VideoScreen: React.FC<ComponentProps> = (props) => {
  const { nodes } = props;
  const [video] = useState(() =>
    Object.assign(document.createElement('video'), {
      src: './video/video.mp4',
      crossOrigin: 'Anonymous',
      loop: true,
    })
  );

  const videoTexture = new THREE.VideoTexture(video);
  const material = new THREE.MeshBasicMaterial({
    toneMapped: false,
    map: videoTexture,
  });

  // useEffect(() => void video.play(), [video]);

  return <mesh geometry={nodes.screen001.geometry} material={material} />;
};
