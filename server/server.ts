import { Server } from 'colyseus';
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

  app.all('*', (req: any, res: any) => nextHandler(req, res));

  const gameServer = new Server({
    transport: new WebSocketTransport({
      server,
    }),
  });

  gameServer.define('gallery', Gallery);

  gameServer.listen(3000);
});
