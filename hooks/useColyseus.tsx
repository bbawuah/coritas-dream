import { useEffect, useState, useRef, useCallback } from 'react';
import { Client, Room } from 'colyseus.js';
import { getState, useStore } from '../store/store';
import { OnMoveProps } from '../components/experience/users/types';
import { State } from '../server/state/state';

const dev: boolean = process.env.NODE_ENV !== 'production';
const developmentPort: string = dev ? '8080' : '3000';
const port: number = parseInt(process.env.PORT || developmentPort, 10);

const endpoint = dev ? `ws://localhost:${port}` : undefined;

export const useColyseus = () => {
  const { set } = useStore(({ set }) => ({ set }));
  const [client, setClient] = useState<Client>();
  const [room, setRoom] = useState<Room<State>>();
  const roomRef = useRef<Room<State>>();

  // Create client on mount
  useEffect(() => {
    const newClient = new Client(endpoint);
    setClient(newClient);
  }, []);

  // Join room when client is ready
  useEffect(() => {
    if (!client) return;

    let mounted = true;

    const joinRoom = async () => {
      try {
        const newRoom = (await client.joinOrCreate('gallery')) as Room<State>;

        if (!mounted) {
          // Component unmounted before room joined
          newRoom.leave();
          return;
        }

        roomRef.current = newRoom;
        setRoom(newRoom);

        // Register message handlers
        setupMessageHandlers(newRoom);
      } catch (e) {
        console.error('Failed to join room:', e);
      }
    };

    joinRoom();

    // Cleanup on unmount
    return () => {
      mounted = false;
      if (roomRef.current) {
        roomRef.current.leave();
        roomRef.current = undefined;
      }
    };
  }, [client, set]);

  const setupMessageHandlers = useCallback((room: Room<State>) => {
    room.onMessage('spawnPlayer', (data) => {
      const { players } = data;
      if (players) {
        set((state) => ({
          ...state,
          players,
          playerIds: Object.keys(players),
          playersCount: Object.keys(players).length,
        }));
      }
    });

    room.onMessage('move', (data: OnMoveProps) => {
      const { player } = data;
      if (!player) return;

      const players = getState().players;
      const updatedPlayers = { ...players, [player.id]: player };

      set((state) => ({
        ...state,
        players: updatedPlayers,
      }));
    });

    room.onMessage('animationState', (data: OnMoveProps) => {
      const { player } = data;
      if (!player) return;

      const players = getState().players;
      const updatedPlayers = { ...players, [player.id]: player };

      set((state) => ({
        ...state,
        players: updatedPlayers,
      }));
    });

    room.onMessage('removePlayer', (data) => {
      const { players } = data;
      if (players) {
        set((state) => ({
          ...state,
          players,
          playerIds: Object.keys(players),
          playersCount: Object.keys(players).length,
        }));
      }
    });

    room.onMessage('mute state', (data) => {
      const { players } = data;
      if (players) {
        set((state) => ({
          ...state,
          players,
        }));
      }
    });
  }, [set]);

  return { client, room };
};
