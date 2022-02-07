import React, { useRef } from 'react';
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry';
import * as THREE from 'three';

interface Props {}

export const Room: React.FC<Props> = (props) => {
  const ref = useRef();

  if (ref.current) {
    (ref.current as THREE.LineSegments).geometry.translate(0, 1.5, 0);
  }

  return (
    <lineSegments
      ref={ref}
      geometry={new BoxLineGeometry(15, 9, 15, 10, 10, 10)}
      material={new THREE.LineBasicMaterial({ color: 0x808080 })}
    />
  );
};
