import { Server } from '@colyseus/core';
import express, { Express } from 'express';
import * as http from 'http';
import next, { NextApiHandler } from 'next';
import parse from 'url';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { Gallery } from './room/room';

const port: number = parseInt(process.env.PORT || '3000', 10);
const dev: boolean = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandler: NextApiHandler = nextApp.getRequestHandler();

nextApp.prepare().then(async () => {
  const app: Express = express();

  const server: http.Server = http.createServer(app);

  const wss = new WebSocketTransport();

  app.all('*', (req: any, res: any) => nextHandler(req, res));

  const gameServer = new Server({
    transport: wss,
  });

  gameServer.define('gallery', Gallery);

  gameServer
    .listen(8080)
    .then(() => {
      console.log('game server is running ');
    })
    .catch((e) => {
      console.log(e);
    });

  server.listen(port, () => {
    console.log('app is running');
  });
});
