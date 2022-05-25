import { useEffect, useState } from 'react';
import { Client, Room } from 'colyseus.js';
import { getState, useStore } from '../store/store';
import { OnMoveProps } from '../components/experience/users/types';
import { State } from '../server/state/state';
import { useAuth } from './useAuth';

const dev: boolean = process.env.NODE_ENV !== 'production';
const developmentPort: string = dev ? '8080' : '3000';
const port: number = parseInt(process.env.PORT || developmentPort, 10);

const endpoint = dev ? `ws://localhost:${port}` : undefined;

export const useColyseus = () => {
  const { set } = useStore(({ set }) => ({ set }));
  const [client, setClient] = useState<Client>();
  const [room, setRoom] = useState<Room>();
  const [id, setId] = useState<string>();
  const { user } = useAuth();

  useEffect(() => {
    setClient(new Client(endpoint));
  }, []);

  useEffect(() => {
    if (client) {
      getRoom();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  return { client, id, room };

  async function getRoom() {
    if (client && user) {
      try {
        const room = (await client.joinOrCreate('gallery', {
          id: user.id,
        })) as Room<State>;

        getPlayerId(room);
        setRoom(room);
        onAnimation(room);
        onSpawnPlayer(room);
        onRemovePlayer(room);
        onMove(room);
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
        playerIds: Object.keys(players),
        playersCount: Object.keys(players).length,
      }));
    });
  }

  function onMove(room: Room) {
    room.onMessage('move', (data: OnMoveProps) => {
      const { player } = data;
      const players = getState().players;

      const obj = { ...players, [player.id]: player };

      set((state) => ({
        ...state,
        players: obj,
      }));
    });
  }

  function onAnimation(room: Room<State>) {
    room.onMessage('animationState', (data: OnMoveProps) => {
      const { player } = data;
      const players = getState().players;

      const obj = { ...players, [player.id]: player };

      set((state) => ({
        ...state,
        players: obj,
      }));
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
