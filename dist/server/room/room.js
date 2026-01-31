"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gallery = void 0;
const colyseus_1 = require("colyseus");
const physics_1 = require("../../shared/physics/physics");
const player_1 = require("../player/player");
const state_1 = require("../state/state");
class Gallery extends colyseus_1.Room {
    constructor() {
        super();
        this.maxClients = 30; //Might need to change this amount.
        this.patchRate = 100;
        this.clients = [];
        this.physics = new physics_1.Physics();
    }
    onCreate() {
        // initialize empty room state
        this.setState(new state_1.State());
        // this.setSimulationInterval((deltaTime) => this.update(deltaTime));
        // Called every time this room receives a "move" message
        this.onMessage('move', (client, data) => {
            const { x, y, z, rx, ry, rz } = data;
            const player = this.state.players.get(client.sessionId);
            // Get the player
            if (player) {
                player.x = x;
                player.y = y;
                player.z = z;
                player.rx = rx;
                player.ry = ry;
                player.rz = rz;
            }
            // Loopen door nieuwe array en voor elke positie
            this.broadcast('move', { player }, {
                afterNextPatch: true,
            });
        });
        this.onMessage('teleport', (client, data) => {
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
            }
            this.broadcast('move', { player }, {
                afterNextPatch: true,
            });
        });
        this.onMessage('animationState', (client, data) => {
            const player = this.state.players.get(client.sessionId);
            if (player) {
                player.animationState = data;
            }
            this.broadcast('animationState', { player }, {
                afterNextPatch: true,
            });
        });
        this.onMessage('sending private message', (client, data) => {
            const { to, signal } = data;
            const receiver = this.clients.find((v) => v.sessionId === to);
            if (receiver) {
                receiver.send('sending private message', {
                    signal,
                    senderId: client.sessionId,
                });
            }
        });
        this.onMessage('answerCall', (client, data) => {
            const { signal, to } = data;
            const receiver = this.clients.find((v) => v.sessionId === to);
            if (receiver) {
                receiver.send('callAccepted', { signal, id: client.sessionId });
            }
        });
    }
    // Called every time a client joins
    onJoin(client) {
        console.log('user joined');
        this.state.players.set(client.sessionId, new player_1.Player(client.sessionId, this.physics)); //Store instance of user in state
        this.clients.push(client);
        const players = this.state.players; // get players from state
        if (players) {
            this.broadcast('spawnPlayer', { players }); //Optimize this to only sending the new player
        }
        this.onMessage('join-call', (client, data) => {
            const { id } = data;
            console.log(id);
            this.broadcast('user-connected', { id });
        });
        this.onMessage('sending signal', (client, payload) => {
            const receiver = this.clients.find((v) => v.sessionId === payload.userToSignal);
            if (receiver) {
                console.log('running from sending signal');
                receiver.send('user joined', {
                    signal: payload.signal,
                    callerID: client.sessionId,
                });
            }
        });
        this.onMessage('returning signal', (client, payload) => {
            const receiver = this.clients.find((v) => v.sessionId === payload.callerID);
            if (receiver) {
                receiver.send('receiving returned signal', {
                    signal: payload.signal,
                    id: client.sessionId,
                });
            }
        });
        this.onMessage('mute', (client, data) => {
            const { isUnMuted } = data;
            const player = this.state.players.get(client.sessionId);
            if (player) {
                player.isUnMuted = isUnMuted;
            }
            const players = this.state.players;
            this.broadcast('mute state', { players });
        });
        this.onMessage('unmute request', (client, data) => {
            const { userToUnmute } = data;
            const receiver = this.clients.find((v) => v.sessionId === userToUnmute);
            if (receiver) {
                receiver.send('unmute player', {
                    id: client.sessionId,
                });
            }
        });
        this.onMessage('mute request', (client, data) => {
            const { userToMute } = data;
            const receiver = this.clients.find((v) => v.sessionId === userToMute);
            if (receiver) {
                receiver.send('mute player', {
                    id: client.sessionId,
                });
            }
        });
    }
    onLeave(client) {
        this.state.players.delete(client.sessionId);
        const newClientList = this.clients.filter((user) => user.sessionId !== client.sessionId);
        this.clients = newClientList;
        const players = this.state.players;
        if (players) {
            //Optimize this to only sending the player that left
            client.send('leave', { message: 'you left' });
            this.broadcast('user-disconnected', { id: client.sessionId });
            this.broadcast('removePlayer', {
                players,
            });
        }
    }
    onDispose() {
        console.log('Dispose ChatRoom');
    }
}
exports.Gallery = Gallery;
