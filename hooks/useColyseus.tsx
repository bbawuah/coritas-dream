import React, { useEffect, useState } from 'react';
import { Client, Room } from 'colyseus.js';
import * as THREE from 'three';

export interface IPlayers {
  id: string;
  position: THREE.Vector3;
}

export const useColyseus = () => {
  const [client, setClient] = useState<Client>();
  const [players, setPlayers] = useState<IPlayers[]>([]);
  const [id, setId] = useState<string>();

  useEffect(() => {
    setClient(new Client('ws://localhost:8080'));
  }, []);

  useEffect(() => {
    if (client) {
      getRoom();
    }
  }, [client]);

  return { client, players, id };

  async function getRoom() {
    if (client) {
      try {
        const room = await client.joinOrCreate('gallery');

        getSpawnedPlayer(room);
        getPlayerId(room);
      } catch (e) {
        console.log(e);
      }
    }
  }

  function getPlayerId(room: Room) {
    room.onMessage('id', (data) => {
      setId(data.id);
    });
  }

  function getSpawnedPlayer(room: Room) {
    room.onMessage('spawnPlayer', (data) => {
      const position = new THREE.Vector3(data.x, data.y, data.z);
      const id: string = data.id;

      setPlayers((players) => [
        ...players,
        {
          id,
          position,
        },
      ]);
    });
  }
};
