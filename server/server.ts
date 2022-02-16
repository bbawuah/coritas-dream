import express, { Express } from 'express';
import * as http from 'http';
import next, { NextApiHandler } from 'next';
import * as socketio from 'socket.io';
import { ClientType, EmitProps } from '../types/socket';
import * as CANNON from 'cannon-es';
import * as THREE from 'three';

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
      position: [0, 1, 0],
      rotation: [0, 0, 0],
    };

    io.sockets.emit('move', clients);

    socket.on('move', (props: EmitProps) => {
      const { id, rotation, controls, velocity, time } = props;

      const frontVector = new THREE.Vector3(
        0,
        0,
        Number(controls.backward) - Number(controls.forward)
      );
      const sideVector = new THREE.Vector3(
        Number(controls.left) - Number(controls.right),
        0,
        0
      );

      const vector = new THREE.Vector3()
        .subVectors(frontVector, sideVector)
        .normalize()
        .multiplyScalar(2)
        .applyEuler(new THREE.Euler(rotation[0], rotation[1], rotation[2]))
        .toArray();

      clients[id].rotation = rotation;
      clients[id].position = [vector[0], 1, vector[2]];

      io.sockets.emit('move', clients);
    });

    // These events are emitted to all the sockets connected to the same room except the sender.
    socket.on('start_call', (roomId) => {
      console.log(`Broadcasting start_call event to peers in room ${roomId}`);
      socket.broadcast.to(roomId).emit('start_call');
    });
    socket.on('webrtc_offer', (event) => {
      console.log(
        `Broadcasting webrtc_offer event to peers in room ${event.roomId}`
      );
      socket.broadcast.to(event.roomId).emit('webrtc_offer', event.sdp);
    });
    socket.on('webrtc_answer', (event) => {
      console.log(
        `Broadcasting webrtc_answer event to peers in room ${event.roomId}`
      );
      socket.broadcast.to(event.roomId).emit('webrtc_answer', event.sdp);
    });
    socket.on('webrtc_ice_candidate', (event) => {
      console.log(
        `Broadcasting webrtc_ice_candidate event to peers in room ${event.roomId}`
      );
      socket.broadcast.to(event.roomId).emit('webrtc_ice_candidate', event);
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
