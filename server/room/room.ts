import { Client, Room } from 'colyseus';
import { XRTeleportationData } from '../../components/experience/vr/types';
import { Physics } from '../../shared/physics/physics';
import { IMoveProps } from '../../shared/physics/types';
import { ActionNames } from '../../store/store';
import { Player } from '../player/player';
import { State } from '../state/state';

export class Gallery extends Room<State> {
  public maxClients = 30;
  private physics: Physics;
  public patchRate = 100;

  constructor() {
    super();
    this.physics = new Physics();
  }

  public onCreate() {
    this.setState(new State());

    // === Movement Messages ===
    this.onMessage('move', (client, data: IMoveProps) => {
      const { x, y, z, rx, ry, rz } = data;
      const player = this.state.players.get(client.sessionId);

      if (player) {
        player.x = x;
        player.y = y;
        player.z = z;
        player.rx = rx;
        player.ry = ry;
        player.rz = rz;

        this.broadcast('move', { player }, { afterNextPatch: true });
      }
    });

    this.onMessage('teleport', (client, data: XRTeleportationData) => {
      const player = this.state.players.get(client.sessionId);
      const { position, worldDirection, animationState } = data;

      if (player) {
        player.x = position.x;
        player.y = position.y;
        player.z = position.z;
        player.rx = worldDirection.x;
        player.ry = worldDirection.y;
        player.rz = worldDirection.z;
        player.animationState = animationState;

        this.broadcast('move', { player }, { afterNextPatch: true });
      }
    });

    this.onMessage('animationState', (client, data: ActionNames) => {
      const player = this.state.players.get(client.sessionId);

      if (player) {
        player.animationState = data;
        this.broadcast('animationState', { player }, { afterNextPatch: true });
      }
    });

    // === Voice Chat Messages ===
    this.onMessage('join-call', (client, data: { id: string }) => {
      const { id } = data;
      this.broadcast('user-connected', { id });
    });

    this.onMessage('sending signal', (client, payload: { userToSignal: string; signal: unknown }) => {
      const receiver = this.clients.find((v) => v.sessionId === payload.userToSignal);

      if (receiver) {
        receiver.send('user joined', {
          signal: payload.signal,
          callerID: client.sessionId,
        });
      }
    });

    this.onMessage('returning signal', (client, payload: { callerID: string; signal: unknown }) => {
      const receiver = this.clients.find((v) => v.sessionId === payload.callerID);

      if (receiver) {
        receiver.send('receiving returned signal', {
          signal: payload.signal,
          id: client.sessionId,
        });
      }
    });

    this.onMessage('sending private message', (client, data: { to: string; signal: unknown }) => {
      const { to, signal } = data;
      const receiver = this.clients.find((v) => v.sessionId === to);

      if (receiver) {
        receiver.send('sending private message', {
          signal,
          senderId: client.sessionId,
        });
      }
    });

    this.onMessage('answerCall', (client, data: { signal: unknown; to: string }) => {
      const { signal, to } = data;
      const receiver = this.clients.find((v) => v.sessionId === to);

      if (receiver) {
        receiver.send('callAccepted', { signal, id: client.sessionId });
      }
    });

    // === Mute Messages ===
    this.onMessage('mute', (client, data: { isUnMuted: boolean }) => {
      const { isUnMuted } = data;
      const player = this.state.players.get(client.sessionId);

      if (player) {
        player.isUnMuted = isUnMuted;
        this.broadcast('mute state', { players: this.state.players });
      }
    });

    this.onMessage('unmute request', (client, data: { userToUnmute: string }) => {
      const { userToUnmute } = data;
      const receiver = this.clients.find((v) => v.sessionId === userToUnmute);

      if (receiver) {
        receiver.send('unmute player', { id: client.sessionId });
      }
    });

    this.onMessage('mute request', (client, data: { userToMute: string }) => {
      const { userToMute } = data;
      const receiver = this.clients.find((v) => v.sessionId === userToMute);

      if (receiver) {
        receiver.send('mute player', { id: client.sessionId });
      }
    });
  }

  public onJoin(client: Client) {
    console.log('User joined:', client.sessionId);

    // Create player and add to state
    this.state.players.set(
      client.sessionId,
      new Player(client.sessionId, this.physics)
    );

    // Broadcast updated players to all clients
    this.broadcast('spawnPlayer', { players: this.state.players });
  }

  public onLeave(client: Client) {
    console.log('User left:', client.sessionId);

    // Broadcast disconnection before removing player
    this.broadcast('user-disconnected', { id: client.sessionId });

    // Remove player from state
    this.state.players.delete(client.sessionId);

    // Broadcast updated players list
    this.broadcast('removePlayer', { players: this.state.players });
  }

  onDispose() {
    console.log('Dispose Gallery Room');
  }
}
