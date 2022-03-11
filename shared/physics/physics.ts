import * as CANNON from 'cannon-es';
import { BufferGeometry } from 'three';
import { IPositionType } from './types';

export class Physics {
  private planeBody: CANNON.Body;
  public physicsWorld: CANNON.World;
  public GROUP1: number = 1;
  public GROUP2: number = 2;

  constructor() {
    this.physicsWorld = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0),
    });

    this.physicsWorld.broadphase = new CANNON.SAPBroadphase(this.physicsWorld);
    (this.physicsWorld.solver as CANNON.GSSolver).iterations = 10;

    this.planeBody = new CANNON.Body({
      position: new CANNON.Vec3(0, 0, 0),
      shape: new CANNON.Plane(),
      collisionFilterGroup: this.GROUP2,
      collisionFilterMask: this.GROUP1,
    });
    this.planeBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(1, 0, 0),
      -Math.PI / 2
    );

    this.physicsWorld.addBody(this.planeBody);
  }

  public createPhysics<T extends IPositionType>(
    geometry: BufferGeometry,
    object: T,
    hasMass: boolean
  ): CANNON.Body {
    const shape = this.createTrimesh(geometry);

    const body = new CANNON.Body({
      mass: hasMass ? 1 : 0,
      shape: shape,
    });

    body.position.x = object.x;
    body.position.y = object.y;
    body.position.z = object.z;

    return body;
  }

  public createPlayerPhysics<T extends IPositionType>(object: T) {
    const body = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(object.x, object.y, object.z),
      shape: new CANNON.Sphere(0.45),
      collisionFilterGroup: this.GROUP1,
      collisionFilterMask: this.GROUP2,
    });

    return body;
  }

  private createTrimesh(geometry: THREE.BufferGeometry): CANNON.Trimesh {
    const vertices = this.getVertices(geometry);

    const indices = Object.keys(vertices).map(Number);
    return new CANNON.Trimesh(vertices as unknown as number[], indices);
  }

  private getVertices(geometry: THREE.BufferGeometry): Float32Array {
    const position = geometry.attributes.position;
    const vertices = new Float32Array(position.count * 3);
    for (let i = 0; i < position.count; i += 3) {
      vertices[i] = position.getX(i);
      vertices[i + 1] = position.getY(i);
      vertices[i + 2] = position.getZ(i);
    }
    return vertices;
  }

  public updatePhysics(dt: number): void {
    this.physicsWorld.step(1 / 60, dt, 2);
  }
}
