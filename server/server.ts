import { Server } from '@colyseus/core';
import express, { Express } from 'express';
import * as http from 'http';
import next, { NextApiHandler } from 'next';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { Gallery } from './room/room';

const port: number = parseInt(process.env.PORT || '3000', 10);
const dev: boolean = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandler: NextApiHandler = nextApp.getRequestHandler();

nextApp.prepare().then(async () => {
  const app: Express = express();

  const server: http.Server = http.createServer(app);

  const wss = new WebSocketTransport({
    server: !dev ? server : undefined,
  });

  app.all('*', (req: any, res: any) => nextHandler(req, res));

  const gameServer = new Server({
    transport: wss,
  });

  gameServer.define('gallery', Gallery);

  if (dev) {
    // DEV SETUP
    gameServer
      .listen(8080)
      .then(() => {
        console.log('game server is running ');
      })
      .catch((e) => {
        console.log(e);
      });

    gameServer.simulateLatency(200); // simulate 200ms latency between server and client.

    server.listen(port, () => {
      console.log('app is running');
    });
  } else {
    gameServer
      .listen(port)
      .then(() => {
        console.log('game server is running ');
      })
      .catch((e) => {
        console.log(e);
      });
  }
});
