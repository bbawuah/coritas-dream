import { Client, Room } from 'colyseus';
import { Physics } from '../../shared/physics/physics';
import {
  IHandlePhysicsProps,
  IUserDirection,
} from '../../shared/physics/types';
import { Player } from '../player/player';
import { State } from '../state/state';

export class Gallery extends Room {
  public maxClients = 30;
  private physics: Physics;

  constructor() {
    super();
    this.physics = new Physics();
  }

  public onCreate() {
    // initialize empty room state
    this.setState(new State());
    this.setSimulationInterval((deltaTime) => this.update(deltaTime));
  }

  // Called every time a client joins
  public onJoin(client: Client, options: any) {
    console.log('user joined');
    this.state.players.set(client.sessionId, new Player(this.physics)); //Store instance of user in state

    client.send('id', { id: client.sessionId });

    const players = (this.state as State).players; // get player from store

    this.onMessage('test', (client, data: string) => {
      console.log(`${client.sessionId} has sent this message ${data}`);
    });

    if (players) {
      this.broadcast('spawnPlayer', { players }); //Optimize this to only sending the new player
    }
  }

  public update(deltaTime: number) {
    // implement your physics or world updates here!
    // this is a good place to update the room state

    // Called every time this room receives a "move" message
    this.onMessage('move', (client, data) =>
      this.handleMovement(client, data, this.state, this.physics, deltaTime)
    );
  }

  public onLeave(client: Client) {
    this.state.players.delete(client.sessionId);

    const players = (this.state as State).players;

    this.broadcast('messages', `${client.sessionId} left.`);

    if (players) {
      //Optimize this to only sending the player that left
      this.broadcast('removePlayer', {
        players,
      });
    }
  }

  onDispose() {
    console.log('Dispose ChatRoom');
  }

  public handleMovement(
    client: Client,
    data: IHandlePhysicsProps,
    state: State,
    physics: Physics,
    dt: number
  ): void {
    const { userDirection, azimuthalAngle, timestamp } = data;

    // Get the player
    const player = state.players.get(client.sessionId);

    if (player) {
      player.movement[userDirection] = true;
      player.handleUserDirection(azimuthalAngle);
      player.timestamp = timestamp;
      player.movement[userDirection] = false;

      this.broadcast('move', { players: state.players });

      physics.updatePhysics(dt); //Update physics 60 fps
    }
  }
}
