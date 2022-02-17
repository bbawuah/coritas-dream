import { Schema, type } from '@colyseus/schema';

export class Player extends Schema {
  @type('number') x: number = 0.11;
  @type('number') y: number = 2.22;
  @type('number') z: number = 2.22;
}
