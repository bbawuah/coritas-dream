import React, { useEffect, useRef, useState } from 'react';
import { Client, Room } from 'colyseus.js';
import {
  getState,
  IPlayerNetworkData,
  IPlayerType,
  useStore,
} from '../store/store';
import { OnMoveProps } from '../components/experience/users/types';
import { client as supabaseClient } from '../utils/supabase';
import { State } from '../server/state/state';
import { useAuth } from './useAuth';
import Peer from 'simple-peer';

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
  const peersRef = useRef<{ peerID: string; peer: Peer.Instance }[]>([]);
  const [peers, setPeers] = useState<Peer.Instance[]>();
  const [players, setPlayers] = useState<IPlayerType>();

  useEffect(() => {
    setClient(new Client(endpoint));
  }, []);

  useEffect(() => {
    if (client) {
      getRoom();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  return { client, id, room, peers };

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
