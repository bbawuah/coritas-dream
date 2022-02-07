import express, { Express } from 'express';
import * as http from 'http';
import next, { NextApiHandler } from 'next';
import * as socketio from 'socket.io';
import { ClientType } from '../types/socket';

const port: number = parseInt(process.env.PORT || '3000', 10);
const dev: boolean = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandler: NextApiHandler = nextApp.getRequestHandler();

const clients: ClientType = {};

nextApp.prepare().then(async () => {
  const app: Express = express();
  const server: http.Server = http.createServer(app);
  const io: socketio.Server = new socketio.Server();

  io.attach(server);

  io.on('connection', (socket: socketio.Socket) => {
    const clientsCount = io.engine.clientsCount;

    console.log(`There are currently ${clientsCount} connected`);

    clients[socket.id] = {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
    };

    io.sockets.emit('move', clients);

    socket.on('move', ({ id, rotation, position }) => {
      clients[id].position = position;
      clients[id].rotation = rotation;

      io.sockets.emit('move', clients);
    });

    socket.on('disconnect', () => {
      console.log(
        `User ${socket.id} disconnected, there are currently ${clientsCount} users connected`
      );

      delete clients[socket.id];

      io.sockets.emit('move', clients);
    });
  });

  app.all('*', (req: any, res: any) => nextHandler(req, res));

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
