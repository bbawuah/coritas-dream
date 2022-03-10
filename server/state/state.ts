import { MapSchema, Schema, type } from '@colyseus/schema';
import { Player } from '../player/player';

// Our custom game state, an ArraySchema of type Player only at the moment
export class State extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
}
