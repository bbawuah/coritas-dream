import * as THREE from 'three';

class FloorMaterial extends THREE.RawShaderMaterial {
  constructor() {
    super({
      vertexShader: `
      attribute vec2 uv;
      attribute vec3 position;
      attribute vec3 normal;

      uniform mat4 projectionMatrix;
      uniform mat4 modelViewMatrix;

      varying vec2 vUv;

      void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
          vUv = uv;
        }
    `,
      fragmentShader: `
      precision mediump float;
      varying vec2 vUv;

      void main() {
        float strengthY = mod(vUv.y * 10.0, 1.);
        strengthY = step(0.08, strengthY);

        float strengthX = mod(vUv.x * 10.0, 1.);
        strengthX = step(0.08, strengthX);

        vec3 color = vec3(strengthY * strengthX);
        gl_FragColor = vec4(color, 1.);
      }
      `,
    });
  }
}

export { FloorMaterial };
