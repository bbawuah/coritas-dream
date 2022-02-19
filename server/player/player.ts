import { Schema, type } from '@colyseus/schema';

export class Player extends Schema {
  @type('number') x: number = 0;
  @type('number') y: number = 0;
  @type('number') z: number = 0;

  constructor() {
    super();
    this.x = Math.floor(Math.random() * 6) + 1;
    this.y = 0.5;
    this.z = Math.floor(Math.random() * 6) + 1;
  }
}
