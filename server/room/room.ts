import { Client, Room } from 'colyseus';
import { Physics } from '../physics/physics';
import { IHandlePhysicsProps, IUserDirection } from '../physics/types';
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
      this.handleMovement(client, data, this.state)
    );

    this.physics.updatePhysics(deltaTime); //Update physics 60 fps
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
    state: State
  ): void {
    const { userDirection, azimuthalAngle } = data;

    // Get the player
    const player = state.players.get(client.sessionId);

    if (player) {
      for (let movement in player.movement) {
        const key = movement as IUserDirection;
        this.resetMovement(key, player, userDirection);
      }

      player.movement[userDirection] = true;
      player.handleUserDirection(azimuthalAngle);

      this.broadcast('move', { players: state.players });
    }
  }

  public resetMovement(
    property: IUserDirection,
    player: Player,
    userDirection: IUserDirection
  ): void {
    if (player.movement[property] === player.movement[userDirection]) {
      player.movement[property] = true;
    }
    player.movement[property] = false;
  }
}
