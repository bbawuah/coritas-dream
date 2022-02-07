import express, { Express, Request, Response } from 'express';
import * as http from 'http';
import next, { NextApiHandler } from 'next';
import * as socketio from 'socket.io';
import { users } from './users/users';

const port: number = parseInt(process.env.PORT || '3000', 10);
const dev: boolean = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandler: NextApiHandler = nextApp.getRequestHandler();

nextApp.prepare().then(async () => {
  const app: Express = express();
  const server: http.Server = http.createServer(app);
  const io: socketio.Server = new socketio.Server();
  io.attach(server);

  io.on('connection', (socket: socketio.Socket) => {
    socket.emit('status', `Hello from user ${socket.id}`);

    socket.on('join', (room, callback) => {
      const { error } = users.addUser(socket.id, room);

      socket.join(room);

      socket.emit('message', `Welcome to the exhibtion ${socket.id}!`);

      socket.broadcast
        .to(room)
        .emit('message', `User ${socket.id} has joined the exhibition!`);

      io.to(room).emit('roomData', {
        room,
        users: users.getUsersInRoom(room),
      });

      callback();
    });

    socket.on('disconnect', () => {
      console.log('client disconnected');
    });
  });

  app.all('*', (req: any, res: any) => nextHandler(req, res));

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
