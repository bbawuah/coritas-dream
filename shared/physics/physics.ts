import * as CANNON from 'cannon-es';
import { BufferGeometry } from 'three';
import { IPositionType } from './types';

export class Physics {
  private planeBody: CANNON.Body;
  private heartArea: CANNON.Body;
  private justiceArea: CANNON.Body;
  private playerBody?: CANNON.Body;
  private hopeArea: CANNON.Body;
  public physicsWorld: CANNON.World;
  public GROUP1: number = 1;
  public GROUP2: number = 2;
  private collissions: CANNON.Body[];

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

    this.heartArea = new CANNON.Body({
      position: new CANNON.Vec3(0.2820654964713161, 1, -60),
      shape: new CANNON.Box(new CANNON.Vec3(10, 0.2, 10)),
      isTrigger: true,
      collisionFilterGroup: this.GROUP2,
      collisionFilterMask: this.GROUP1,
    });

    this.justiceArea = new CANNON.Body({
      position: new CANNON.Vec3(0.3936636535006794, 1, 67.53993205220814),
      shape: new CANNON.Box(new CANNON.Vec3(10, 0.2, 10)),
      isTrigger: true,
      collisionFilterGroup: this.GROUP2,
      collisionFilterMask: this.GROUP1,
    });

    this.hopeArea = new CANNON.Body({
      position: new CANNON.Vec3(-67.53993205220814, 1, 0.12513912650489073),
      shape: new CANNON.Box(new CANNON.Vec3(10, 0.2, 10)),
      isTrigger: true,
      collisionFilterGroup: this.GROUP2,
      collisionFilterMask: this.GROUP1,
    });

    this.collissions = [this.hopeArea, this.justiceArea, this.heartArea];

    this.physicsWorld.addBody(this.heartArea);
    this.physicsWorld.addBody(this.justiceArea);
    this.physicsWorld.addBody(this.hopeArea);
    this.physicsWorld.addBody(this.planeBody);

    this.hopeArea.addEventListener('collide', () => {
      console.log('collided with hope area collided');
    });

    this.justiceArea.addEventListener('collide', () => {
      console.log('collided with justice area collider');
    });

    this.heartArea.addEventListener('collide', () => {
      console.log('collided with love area collided');
    });

    this.physicsWorld.addEventListener('endContact', (event: any) => {
      if (
        (event.bodyA === this.playerBody &&
          this.collissions.includes(event.bodyB)) ||
        (event.bodyB === this.playerBody &&
          this.collissions.includes(event.bodyA))
      ) {
        console.log('collission ended');
      }
    });
  }

  public createPhysics<T extends THREE.Mesh>(
    geometry: BufferGeometry,
    object: T | undefined,
    hasMass: boolean
  ): CANNON.Body {
    const shape = this.createTrimesh(geometry);

    const body = new CANNON.Body({
      mass: hasMass ? 1 : 0,
      shape: shape,
      collisionFilterGroup: this.GROUP2,
      collisionFilterMask: this.GROUP1,
    });

    if (object) {
      body.position.x = object.position.x;
      body.position.y = object.position.y;
      body.position.z = object.position.z;
    }

    return body;
  }

  public createPlayerPhysics<T extends IPositionType>(object: T) {
    const body = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(object.x, object.y, object.z),
      shape: new CANNON.Sphere(0.5),
      collisionFilterGroup: this.GROUP1,
      collisionFilterMask: this.GROUP2,
    });

    this.playerBody = body;

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
