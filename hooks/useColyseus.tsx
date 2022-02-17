import React, { useEffect, useState } from 'react';
import { Client, Room } from 'colyseus.js';

export const useColyseus = () => {
  const [client, setClient] = useState<Client>();
  const [room, setRoom] = useState<Room>();

  useEffect(() => {
    setClient(
      new Client(
        `${location.protocol.replace('http', 'ws')}//${location.hostname}:3000`
      )
    );
  }, []);

  useEffect(() => {
    console.log('ggvgh');
    if (client) {
      console.log(client);
      client
        .joinOrCreate('gallery')
        .then((room) => {
          console.log(room.sessionId, 'joined', room.name);
        })
        .catch((e) => {
          console.log('JOIN ERROR', e);
        });
    }
  }, [client]);

  return { client, room };
};
