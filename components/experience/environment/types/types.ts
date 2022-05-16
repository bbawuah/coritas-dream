import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Physics } from '../../../../shared/physics/physics';

export interface ComponentProps {
  nodes: GLTFNodes;
  material?: THREE.MeshPhongMaterial;
  baseColor?: THREE.ColorRepresentation;
}

export interface EnvironmentProps {
  nodes: GLTFNodes;
  physics: Physics;
}

export type GLTFResult = GLTF & {
  nodes: GLTFNodes;
  materials: {};
};

export type GLTFNodes = {
  screen001: THREE.Mesh;
  mountains: THREE.Mesh;
  environment: THREE.Mesh;
  ['hope-painting']: THREE.Mesh;
  ['hope-painting001']: THREE.Mesh;
  ['hope-painting002']: THREE.Mesh;
  ['hope-painting003']: THREE.Mesh;
  ['hope-painting004']: THREE.Mesh;
  ['hope-painting005']: THREE.Mesh;
  ['hope-painting006']: THREE.Mesh;
  ['hope-painting007']: THREE.Mesh;
  ['justice-painting']: THREE.Mesh;
  ['justice-painting001']: THREE.Mesh;
  ['justice-painting002']: THREE.Mesh;
  ['justice-painting003']: THREE.Mesh;
  ['justice-painting004']: THREE.Mesh;
  ['justice-painting005']: THREE.Mesh;
  ['justice-painting006']: THREE.Mesh;
  ['justice-painting007']: THREE.Mesh;
  ['love-painting']: THREE.Mesh;
  ['love-painting001']: THREE.Mesh;
  ['love-painting002']: THREE.Mesh;
  ['love-painting003']: THREE.Mesh;
  ['love-painting004']: THREE.Mesh;
  navmesh: THREE.Mesh;
  ['pathfinding-navmesh']: THREE.Mesh;
};
