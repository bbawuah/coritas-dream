import * as THREE from 'three';

export class HighlightMesh {
  private geometry: THREE.CylinderGeometry;
  private material: THREE.RawShaderMaterial;
  public mesh: THREE.Mesh;

  constructor() {
    this.geometry = new THREE.CylinderGeometry(0.4, 0.4, 0.6, 20, 5, true);
    this.material = new THREE.RawShaderMaterial({
      uniforms: {
        u_color: { value: new THREE.Color(0xfefefe) },
      },
      vertexShader: `
        attribute vec3 position;
        attribute vec2 uv;
        
        uniform mat4 projectionMatrix;
        uniform mat4 modelViewMatrix;
        varying vec2 v_uv;
        void main() {
          vec4 modelPosition = vec4(position, 1.0);
          vec4 projectionPosition = modelViewMatrix * modelPosition;
          gl_Position =  projectionMatrix * projectionPosition;
          v_uv = uv;
        }
        `,
      fragmentShader: `
        precision mediump float;
        uniform vec3 u_color;
        varying vec2 v_uv;
        void main() {
          float strength = 1.0 - v_uv.y;
          vec3 color = u_color;
          gl_FragColor = vec4(color, strength);
        }
        `,
      transparent: true,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }
}
