"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gallery = void 0;
const colyseus_1 = require("colyseus");
const player_1 = require("../player/player");
const state_1 = require("../state/state");
class Gallery extends colyseus_1.Room {
    constructor() {
        super(...arguments);
        this.maxClients = 10;
    }
    onCreate() {
        // initialize empty room state
        this.setState(new state_1.State());
        console.log('test');
        // Called every time this room receives a "move" message
        this.onMessage('move', (client, data) => {
            const player = this.state.players.get(client.sessionId);
            if (player) {
                player.x += data.x;
                player.y += data.y;
                player.z += data.z;
                console.log(client.sessionId + ' at, x: ' + player.x, 'y: ' + player.y + 'z: ' + player.z);
            }
        });
    }
    // Called every time a client joins
    onJoin(client, options) {
        this.state.players.set(client.sessionId, new player_1.Player());
    }
    update(deltaTim) {
        // implement your physics or world updates here!
        // this is a good place to update the room state
    }
    onLeave(client) {
        this.broadcast('messages', `${client.sessionId} left.`);
    }
    onDispose() {
        console.log('Dispose ChatRoom');
    }
}
exports.Gallery = Gallery;
