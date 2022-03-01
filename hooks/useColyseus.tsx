import React, { useEffect, useState } from 'react';
import { Client, Room } from 'colyseus.js';
import * as THREE from 'three';
import { useStore } from '../store/store';

export interface IPlayers {
  id: string;
  position: THREE.Vector3;
}

export const useColyseus = () => {
  const { set } = useStore(({ set }) => ({ set }));
  const [client, setClient] = useState<Client>();
  const [room, setRoom] = useState<Room>();
  const [id, setId] = useState<string>();

  useEffect(() => {
    setClient(new Client('ws://localhost:8080'));
  }, []);

  useEffect(() => {
    if (client) {
      getRoom();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  return { client, id, room };

  async function getRoom() {
    if (client) {
      try {
        const room = await client.joinOrCreate('gallery');

        getPlayerId(room);
        setRoom(room);
        onSpawnPlayer(room);
        onRemovePlayer(room);
        onMessage(room);
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

  function onSpawnPlayer(room: Room) {
    room.onMessage('spawnPlayer', (data) => {
      const { players } = data;
      console.log('new player joined');

      set((state) => ({
        ...state,
        players,
        playersCount: Object.keys(players).length,
      }));
    });
  }

  // TODO: Should remove later
  function onMessage(room: Room) {
    room.onMessage('messages', (data) => {
      console.log(data);
    });
  }

  function onRemovePlayer(room: Room) {
    room.onMessage('removePlayer', (data) => {
      const { players } = data;

      console.log('a player left');

      set((state) => ({
        ...state,
        players,
        playersCount: Object.keys(players).length,
      }));
    });
  }
};
