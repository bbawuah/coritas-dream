import { Client, Room } from 'colyseus';
import { XRTeleportationData } from '../../components/experience/vr/types';
import { Physics } from '../../shared/physics/physics';
import {
  IHandlePhysicsProps,
  IUserDirection,
} from '../../shared/physics/types';
import { ActionNames } from '../../store/store';
import { Player } from '../player/player';
import { State } from '../state/state';

export class Gallery extends Room<State> {
  public maxClients = 30; //Might need to change this amount.
  private physics: Physics;
  public patchRate = 100;

  constructor() {
    super();
    this.physics = new Physics();
  }

  public onCreate() {
    // initialize empty room state
    this.setState(new State());
    this.setSimulationInterval((deltaTime) => this.update(deltaTime));

    // Called every time this room receives a "move" message
    this.onMessage('move', (client, data: IHandlePhysicsProps) => {
      const player = this.state.players.get(client.sessionId);
      this.handleMovement(player, data);

      // Loopen door nieuwe array en voor elke positie

      this.broadcast(
        'move',
        { player },
        {
          afterNextPatch: true,
        }
      );
    });

    this.onMessage('idle', (client, data) => {
      const player = this.state.players.get(client.sessionId);

      if (player) {
        for (let movement in player.movement) {
          const key = movement as IUserDirection;
          player.movement[key] = false;
        }

        player.physicalBody.velocity.setZero();
        player.physicalBody.initVelocity.setZero();
        player.physicalBody.angularVelocity.setZero();
        player.physicalBody.initAngularVelocity.setZero();
      }
    });

    this.onMessage('teleport', (client, data: XRTeleportationData) => {
      const player = this.state.players.get(client.sessionId);
      const { position } = data;

      if (player) {
        player.x = position.x;
        player.y = position.y;
        player.z = position.z;
      }

      this.broadcast(
        'move',
        { player },
        {
          afterNextPatch: true,
        }
      );
    });

    this.onMessage('animationState', (client, data: ActionNames) => {
      const player = this.state.players.get(client.sessionId);

      if (player) {
        player.animationState = data;
      }

      this.broadcast(
        'animationState',
        { player },
        {
          afterNextPatch: true,
        }
      );
    });
  }

  // Called every time a client joins
  public onJoin(client: Client, options: { id: string }) {
    console.log('user joined');
    const { id } = options;

    const player = new Player(client.sessionId, id, this.physics);

    this.state.players.set(client.sessionId, player); //Store instance of user in state

    // Should do something here

    client.send('id', { id: client.sessionId });

    this.onMessage('test', (client, data: string) => {
      console.log(`${client.sessionId} has sent this message ${data}`);
    });

    if ((this.state as State).players.get(client.sessionId)) {
      this.broadcast('spawnPlayer', {
        player: (this.state as State).players.get(client.sessionId),
      }); //Optimize this to only sending the new player
    }
  }

  public update(deltaTime: number) {
    // implement your physics or world updates here!
    // this is a good place to update the room state

    this.physics.updatePhysics(deltaTime / 1000);
  }

  public onLeave(client: Client) {
    this.state.players.delete(client.sessionId);

    const players = this.state.players;

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
    player: Player | undefined,
    data: IHandlePhysicsProps
  ): void {
    const { userDirection, azimuthalAngle, timestamp } = data;
    // Get the player
    if (player) {
      player.movement[userDirection] = true;
      player.handleUserDirection(azimuthalAngle);
      player.timestamp = timestamp;
      player.movement[userDirection] = false;
    }
  }
}
