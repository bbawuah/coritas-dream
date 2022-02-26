import { Schema, type } from '@colyseus/schema';
import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { Physics } from '../physics/physics';
import { IDirection } from './types';
import { IUserDirection } from '../physics/types';

export class Player extends Schema {
  @type('number') x: number = 0;
  @type('number') y: number = 0;
  @type('number') z: number = 0;

  public playerSpeed: number = 10;
  public mesh: THREE.Mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1, 1),
    new THREE.MeshStandardMaterial()
  ); //Might be nice to look for a cleaner way to get geometry
  public physicalBody: CANNON.Body;

  public direction: THREE.Vector3 = new THREE.Vector3();
  public frontVector: THREE.Vector3 = new THREE.Vector3();
  public sideVector: THREE.Vector3 = new THREE.Vector3();
  public upVector: THREE.Vector3 = new THREE.Vector3(0, 1, 0);
  public temporaryVector: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

  public movement: IDirection = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    idle: false,
  };

  constructor(physics: Physics) {
    super();
    this.x = Math.floor(Math.random() * 6) + 1;
    this.y = 1;
    this.z = Math.floor(Math.random() * 6) + 1;

    this.physicalBody = physics.createPhysics<Player>(this.mesh.geometry, this); // Create phyisical represenatation of player

    physics.physicsWorld.addBody(this.physicalBody);
  }

  public handleUserDirection(angle: number): void {
    this.frontVector = new THREE.Vector3(
      0,
      0,
      Number(this.movement.backward) - Number(this.movement.forward)
    );

    this.sideVector = new THREE.Vector3(
      Number(this.movement.left) - Number(this.movement.right),
      0,
      0
    );

    this.direction
      .subVectors(this.frontVector, this.sideVector)
      .normalize()
      .multiplyScalar(this.playerSpeed)
      .applyAxisAngle(this.upVector, angle);

    this.physicalBody.velocity.set(
      this.direction.x,
      this.physicalBody.velocity.y,
      this.direction.z
    );

    // For some reason, the position is not updating..

    this.x = this.physicalBody.position.x;
    this.y = this.physicalBody.position.y;
    this.z = this.physicalBody.position.z;
  }
}
