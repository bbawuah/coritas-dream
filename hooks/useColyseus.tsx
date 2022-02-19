import React, { useEffect, useState } from 'react';
import { Client, Room } from 'colyseus.js';

export const useColyseus = () => {
  const [client, setClient] = useState<Client>();
  const [room, setRoom] = useState<Room>();
  const [data, setData] = useState<any>();

  useEffect(() => {
    setClient(new Client('ws://localhost:8080'));
  }, []);

  useEffect(() => {
    if (client) {
      client
        .joinOrCreate('gallery')
        .then((room) => {
          if (room) {
            setRoom(room);
          }
        })
        .catch((e) => {
          console.log('JOIN ERROR', e);
        });
    }
  }, [client]);

  return { client, room, getSpawnPosition };

  function getSpawnPosition(): any {
    let data: any = {};
    if (room) {
      room.onMessage('spawn', (message) => {
        const test = message;
        console.log(test);
        data = { ...test };
      });
      console.log(data);
      return data;
    }
    return 'isdjc';
  }
};
