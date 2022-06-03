import * as THREE from 'three';

const positions = [
  {
    position: new THREE.Vector3(0, 0.5, -12),
    rotation: new THREE.Euler(-Math.PI / 2, 0, 0),
  },
  {
    position: new THREE.Vector3(-12, 0.5, 0),
    rotation: new THREE.Euler(-Math.PI / 2, 0, -Math.PI / 2),
  },
  {
    position: new THREE.Vector3(0, 0.5, 12),
    rotation: new THREE.Euler(-Math.PI / 2, 0, 0),
  },
];

export class InstancedArrows {
  private geometry: THREE.PlaneGeometry;
  private material: THREE.RawShaderMaterial;
  private dummy: THREE.Object3D;
  public mesh: THREE.InstancedMesh;

  constructor(scene: THREE.Scene) {
    this.dummy = new THREE.Object3D();

    this.geometry = new THREE.PlaneGeometry(3, 15, 15, 10);
    this.material = new THREE.RawShaderMaterial({
      uniforms: {
        u_time: { value: 0.0 },
        u_resolution: { value: new THREE.Vector2() },
      },
      vertexShader: `
      attribute vec3 position;
      attribute vec2 uv;
      attribute mat4 instanceMatrix;
      
      uniform mat4 projectionMatrix;
      uniform mat4 modelViewMatrix;
      varying vec2 v_uv;
      void main() {
        vec4 modelPosition = instanceMatrix * vec4(position, 1.0);
        vec4 projectionPosition = modelViewMatrix * modelPosition;
        gl_Position =  projectionMatrix * projectionPosition;
        v_uv = uv;
      }
      `,
      fragmentShader: `
      precision mediump float;

      varying vec2 v_uv;
      uniform float u_time;

      void main() {
        float repeat = v_uv.y + u_time;

        
        float strength = mod(repeat * 10.0, 1.0);
        strength = step(0.5, strength);
        vec3 color = vec3(0.95, 0.56, 0.295);

        gl_FragColor = vec4(color, strength);
      }
      `,
      transparent: true,
    });

    this.mesh = new THREE.InstancedMesh(
      this.geometry,
      this.material,
      positions.length
    );
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    scene.add(this.mesh);

    positions.forEach((dimensions, index) => {
      const { position, rotation } = dimensions;
      this.dummy.position.copy(position);
      this.dummy.rotation.copy(rotation);
      this.dummy.updateMatrix();

      this.mesh.setMatrixAt(index, this.dummy.matrix);
    });

    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
