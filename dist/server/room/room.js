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
        this.maxClients = 30;
        this.patchRate = 100;
        this.physics = new physics_1.Physics();
    }
    onCreate() {
        // initialize empty room state
        this.setState(new state_1.State());
        this.setSimulationInterval((deltaTime) => this.update(deltaTime));
        // Called every time this room receives a "move" message
        this.onMessage('move', (client, data) => {
            const player = this.state.players.get(client.sessionId);
            this.handleMovement(player, data);
            // Loopen door nieuwe array en voor elke positie
            this.broadcast('move', { player }, {
                afterNextPatch: true,
            });
        });
        this.onMessage('idle', (client, data) => {
            const player = this.state.players.get(client.sessionId);
            if (player) {
                for (let movement in player.movement) {
                    const key = movement;
                    player.movement[key] = false;
                }
                player.physicalBody.velocity.setZero();
                player.physicalBody.initVelocity.setZero();
                player.physicalBody.angularVelocity.setZero();
                player.physicalBody.initAngularVelocity.setZero();
            }
        });
    }
    // Called every time a client joins
    onJoin(client, options) {
        console.log('user joined');
        this.state.players.set(client.sessionId, new player_1.Player(client.sessionId, this.physics)); //Store instance of user in state
        client.send('id', { id: client.sessionId });
        const players = this.state.players; // get player from store
        this.onMessage('test', (client, data) => {
            console.log(`${client.sessionId} has sent this message ${data}`);
        });
        if (players) {
            this.broadcast('spawnPlayer', { players }); //Optimize this to only sending the new player
        }
    }
    update(deltaTime) {
        // implement your physics or world updates here!
        // this is a good place to update the room state
        this.physics.updatePhysics(deltaTime / 1000);
    }
    onLeave(client) {
        this.state.players.delete(client.sessionId);
        const players = this.state.players;
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
    handleMovement(player, data) {
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
exports.Gallery = Gallery;
