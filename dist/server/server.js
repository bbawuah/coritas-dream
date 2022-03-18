"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@colyseus/core");
const express_1 = __importDefault(require("express"));
const http = __importStar(require("http"));
const next_1 = __importDefault(require("next"));
const ws_transport_1 = require("@colyseus/ws-transport");
const room_1 = require("./room/room");
const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const nextApp = (0, next_1.default)({ dev });
const nextHandler = nextApp.getRequestHandler();
nextApp.prepare().then(async () => {
    const app = (0, express_1.default)();
    const server = http.createServer(app);
    const wss = new ws_transport_1.WebSocketTransport({
        server,
    });
    app.all('*', (req, res) => nextHandler(req, res));
    const gameServer = new core_1.Server({
        transport: wss,
    });
    gameServer.define('gallery', room_1.Gallery);
    // DEV SETUP in production only one server should run
    gameServer
        .listen(3000)
        .then(() => {
        console.log('game server is running ');
    })
        .catch((e) => {
        console.log(e);
    });
});
