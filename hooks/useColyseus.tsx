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

        room.onMessage(
          'sending private message',
          (data: { signal: Peer.SignalData; senderId: string }) => {
            const { signal, senderId } = data;

            set((state) => ({
              ...state,
              callRequests: [
                ...state.callRequests,
                { id: senderId, signal: signal },
              ],
            }));
          }
        );

        getPlayerId(room);
        setRoom(room);
        onAnimation(room);
        onSpawnPlayer(room);
        onRemovePlayer(room);
        onMove(room);

        // if (id) await handleAudioCall(room, id);
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
      console.log(players);
      console.log('new player joined');

      set((state) => ({
        ...state,
        players,
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

  async function handleAudioCall(room: Room, id: string) {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        height: window.innerHeight / 2,
        width: window.innerWidth / 2,
      },
      audio: true,
    });

    room.onMessage('spawnPlayer', (data: { players: IPlayerType }) => {
      if (stream) {
        console.log('test');

        const { players } = data;
        console.log(players);
        const ids = Object.keys(players).filter((playerId) => playerId !== id);
        const peers: any[] = [];

        ids.forEach((userId) => {
          console.log(userId);
          const peer = createPeer(userId, id, stream, room);

          peersRef.current.push({
            peerID: userId,
            peer,
          });

          peers.push(peer);
        });
        setPeers(peers);
      }
    });

    room.onMessage('user joined call', (payload: any) => {
      if (stream) {
        const peer = addPeer(payload.signal, payload.callerId, stream, room);

        peersRef.current.push({
          peerID: payload.callerID,
          peer,
        });

        setPeers((users) => (users ? [...users, peer] : [peer]));
      }
    });

    room.onMessage('receiving returned signal', (payload) => {
      const item = peersRef.current.find((p) => p.peerID === payload.id);

      item?.peer.signal(payload.signal);
    });
  }

  function createPeer(
    userToSignalId: string,
    callerId: string,
    stream: MediaStream,
    room: Room
  ) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on('signal', (signal) => {
      console.log(signal);
      room.send('sending signal', { userToSignalId, callerId, signal });
    });

    return peer;
  }

  function addPeer(
    incomingSignal: string | Peer.SignalData,
    callerId: string,
    stream: MediaStream,
    room: Room
  ) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal) => {
      room.send('returning signal', { signal, callerId });
    });

    peer.signal(incomingSignal);

    return peer;
  }
};
