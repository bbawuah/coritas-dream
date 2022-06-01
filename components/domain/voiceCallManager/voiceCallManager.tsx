import { Room } from 'colyseus.js';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MediaConnection, Peer } from 'peerjs';
import styles from './voiceCallManager.module.scss';
import { useStore } from '../../../store/store';

interface Props {
  room: Room;
}

interface AudioProps {
  stream: MediaStream;
}

const Audio: React.FC<AudioProps> = (props) => {
  const { stream } = props;
  const ref = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);

  return <audio className={styles.audio} playsInline ref={ref} autoPlay />;
};

export const VoiceCallManager: React.FC<Props> = (props) => {
  const { room } = props;
  const [myStream, setMyStream] = useState<MediaStream>();
  const [usersStreams, setUsersStreams] = useState<
    { id: string; stream: MediaStream }[]
  >([]);
  const userAudio = useRef<HTMLAudioElement | null>(null);
  const peers = useRef<{ [id: string]: MediaConnection }>({});
  const myPeer = useRef<Peer>();
  const { isMuted } = useStore(({ isMuted }) => ({ isMuted }));

  useEffect(() => {
    myPeer.current = new Peer(room.sessionId, {
      config: {
        iceServers: [
          {
            urls: 'stun:openrelay.metered.ca:80',
          },
          {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject',
          },
          {
            urls: 'turn:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credential: 'openrelayproject',
          },
          {
            urls: 'turn:openrelay.metered.ca:443?transport=tcp',
            username: 'openrelayproject',
            credential: 'openrelayproject',
          },
        ],
      },
    });
  }, []);

  useEffect(() => {
    if (myPeer.current) {
      myPeer.current.on('open', (id) => {
        room.send('join-call', { id });
      });

      room.onMessage('user-connected', (data) => {
        const { id } = data;
      });
      navigator.mediaDevices
        .getUserMedia({ video: false, audio: true })
        .then((stream) => {
          setMyStream(stream);

          if (myPeer.current)
            myPeer.current.on('call', (call) => {
              call.answer(stream);

              call.on('stream', (stream) => {
                setUsersStreams((v) => [...v, { id: call.peer, stream }]);
              });

              if (peers.current[call.peer]) {
                peers.current[call.peer] = call;
              } else {
                peers.current = { ...peers.current, [call.peer]: call };
              }
            });

          room.onMessage('user-connected', (data) => {
            const { id } = data;

            connectToNewUser(id, stream);
          });

          room.onMessage('user-disconnected', (data: { id: string }) => {
            const { id } = data;
            if (peers.current[id]) {
              peers.current[id].close();
              setUsersStreams((v) => {
                const filter = v.filter((v) => v.id !== id);

                return filter;
              });
            }
          });
        });

      const peer = myPeer.current;

      return () => {
        peer.destroy();
      };
    }
  }, [room]);

  useEffect(() => {
    muteMic(isMuted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMuted, myStream]);

  return (
    <>
      <audio className={styles.audio} playsInline ref={userAudio} autoPlay />
      {usersStreams.map((stream, index) => {
        return <Audio stream={stream.stream} key={index} />;
      })}
    </>
  );

  function muteMic(bool: boolean) {
    if (myStream)
      myStream.getAudioTracks().forEach((track) => (track.enabled = bool));
  }

  function connectToNewUser(userId: string, stream: MediaStream) {
    if (myPeer.current) {
      const call = myPeer.current.call(userId, stream);

      if (call) {
        call.on('stream', (audioStream) => {
          // Add stream to array of user
          setUsersStreams((v) => [...v, { id: userId, stream: audioStream }]);
        });

        call.on('close', () => {
          //Remove video from user
          setUsersStreams((v) => {
            const filter = v.filter((v) => v.id !== userId);

            return filter;
          });
        });

        if (peers.current[userId]) {
          peers.current[userId] = call;
        } else {
          peers.current = { ...peers.current, [userId]: call };
        }
      }
    }
  }
};
