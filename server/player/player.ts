import { Schema, type } from '@colyseus/schema';
import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { Physics } from '../../shared/physics/physics';
import { ActionNames } from '../../store/store';
import { IDirection } from './types';

export class Player extends Schema {
  @type('number') x: number = 0;
  @type('number') y: number = 0;
  @type('number') z: number = 0;
  @type('number') rx: number = 0;
  @type('number') ry: number = 0;
  @type('number') rz: number = 0;
  @type('string') id: string = '';
  @type('string') uuid: string = '';
  @type('string') animationState: ActionNames = 'idle';

  public playerSpeed: number = 10;
  public physicalBody: CANNON.Body;

  public direction: THREE.Vector3 = new THREE.Vector3();
  public frontVector: THREE.Vector3 = new THREE.Vector3();
  public sideVector: THREE.Vector3 = new THREE.Vector3();
  public upVector: THREE.Vector3 = new THREE.Vector3(0, 1, 0);
  public userLookAt: THREE.Vector3 = new THREE.Vector3();

  public movement: IDirection = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    idle: false,
  };

  constructor(id: string, uuid: string, physics: Physics) {
    super();
    this.x = Math.floor(Math.random() * 6) + 1;
    this.y = 0.5;
    this.z = Math.floor(Math.random() * 6) + 1;
    this.id = id;
    this.uuid = uuid;

    this.physicalBody = physics.createPlayerPhysics<Player>(this); // Create phyisical represenatation of player

    physics.physicsWorld.addBody(this.physicalBody);
  }

  public handleUserDirection(angle: number): void {
    this.frontVector.setZ(
      Number(this.movement.backward) - Number(this.movement.forward)
    );
    this.sideVector.setX(
      Number(this.movement.left) - Number(this.movement.right)
    );

    this.direction
      .subVectors(this.frontVector, this.sideVector)
      .normalize()
      .multiplyScalar(this.playerSpeed)
      .applyAxisAngle(this.upVector, angle);

    //Store lookAt
    if (
      this.movement.backward ||
      this.movement.forward ||
      this.movement.left ||
      this.movement.right
    ) {
      this.userLookAt.copy(this.direction);
      this.userLookAt.multiplyScalar(100);
    }

    this.physicalBody.velocity.set(
      this.direction.x,
      this.physicalBody.velocity.y,
      this.direction.z
    );

    // Misschien position in een array pushen?
    this.rx = this.userLookAt.x;
    this.ry = this.userLookAt.y;
    this.rz = this.userLookAt.z;
    this.x = this.physicalBody.position.x;
    this.y = this.physicalBody.position.y;
    this.z = this.physicalBody.position.z;
  }
}
