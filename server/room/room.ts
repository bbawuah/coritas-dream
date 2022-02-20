import { Client, Room } from 'colyseus';
import { Player } from '../player/player';
import { State } from '../state/state';

export class Gallery extends Room {
  maxClients = 30;
  onCreate() {
    // initialize empty room state
    this.setState(new State());

    // Called every time this room receives a "move" message
    this.onMessage('move', (client, data) => {
      const player = (this.state as State).players.get(client.sessionId);

      if (player) {
        player.x += data.x;
        player.y += data.y;
        player.z += data.z;
        console.log(
          client.sessionId + ' at, x: ' + player.x,
          'y: ' + player.y + 'z: ' + player.z
        );
      }
    });
  }

  // Called every time a client joins
  onJoin(client: Client, options: any) {
    console.log('user joined');
    this.state.players.set(client.sessionId, new Player()); //Store instance of user in state

    client.send('id', { id: client.sessionId });

    const players = (this.state as State).players; // get player from store

    if (players) {
      this.broadcast('spawnPlayer', { players });
    }
  }

  update(deltaTim: number) {
    // implement your physics or world updates here!
    // this is a good place to update the room state
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);

    const players = (this.state as State).players;

    this.broadcast('messages', `${client.sessionId} left.`);

    if (players) {
      this.broadcast('removePlayer', {
        players,
      });
    }
  }

  onDispose() {
    console.log('Dispose ChatRoom');
  }
}
