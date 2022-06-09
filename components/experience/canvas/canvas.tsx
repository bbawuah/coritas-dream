/* eslint-disable @next/next/no-img-element */
import React, { Suspense, useEffect, useRef, useState } from 'react';
import * as styles from './canvas.module.scss';
import classNames from 'classnames';
import { Canvas } from '@react-three/fiber';
import { User } from '../users/user';
import { Physics } from '../../../shared/physics/physics';
import { useGLTF } from '@react-three/drei';
import { VRCanvas } from '@react-three/xr';
import { Perf } from 'r3f-perf';
import { MediaConnection, Peer } from 'peerjs';
import { getState, useStore } from '../../../store/store';
import Image from 'next/image';
import { useDeviceCheck } from '../../../hooks/useDeviceCheck';
import { BlendFunction } from 'postprocessing';
import {
  EffectComposer,
  Bloom,
  Noise,
  BrightnessContrast,
} from '@react-three/postprocessing';
import { GLTFResult } from '../environment/types/types';
import { SettingsMenu } from '../../core/headers/settingsMenu/settingsMenu';
import { OnboardingManager } from '../../domain/onboardingManager/onBoardingManager';
import { client } from '../../../utils/supabase';
import { useRealtime } from 'react-supabase';
import { NonPlayableCharacters } from '../users/NonPlayableCharacters/NonPlayableCharacters';
import { IconType } from '../../../utils/icons/types';
import { XRCanvas } from './xrCanvas';
import { Room } from 'colyseus.js';
import { IconButton } from '../../core/IconButton/IconButton';
import { Instructions } from '../../domain/Instructions/instructions';
import { FocusImage } from '../../domain/focusImage/focusImage';
import { BaseScene } from '../baseScene/baseScene';
import { SVGButton } from '../svgButton/svgButton';
import { Notifications } from '../../core/notifications/Notifications';

interface Props {
  room: Room;
  isWebXrSupported: boolean;
}

interface ProfileData {
  avatar: string;
  updated_at: string;
  id: string;
  username: string | null;
}

const Audio: React.FC<{
  stream: MediaStream;
}> = (props) => {
  const { stream } = props;
  const ref = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);

  return <audio className={styles.audio} playsInline ref={ref} autoPlay />;
};

const CanvasComponent: React.FC<Props> = (props) => {
  const { isWebXrSupported, room } = props;
  const { nodes } = useGLTF(
    '/environment-transformed.glb'
  ) as unknown as GLTFResult;
  const { isDesktop } = useDeviceCheck();
  const [physics, setPhysics] = useState<Physics | null>(null);
  const [_, reexecute] = useRealtime('profiles');
  const [userAvatar, setUserAvatar] = useState<string>();
  const containerRef = useRef<HTMLDivElement>(null);
  const classes = classNames([styles.container]);
  const [shouldRenderInstructions, setShouldRenderInstructions] =
    useState<boolean>(false);
  const { playerIds, set } = useStore(({ playerIds, set }) => ({
    playerIds,

    set,
  }));
  const [myStream, setMyStream] = useState<MediaStream>();
  const [usersStreams, setUsersStreams] = useState<
    { id: string; stream: MediaStream }[]
  >([]);
  const [isUnMuted, setIsUnMuted] = useState<boolean>(false);
  const peers = useRef<{ [id: string]: MediaConnection }>({});
  const [clickedPlayer, setClickedPlayer] = useState<{ id: string }>();
  const [isReported, setIsReported] = useState<{ id: string }>();
  const [clickCounter, setClickCounter] = useState<number>(0);
  const [closeVROverlay, setCloseVROverlay] = useState<boolean>(false);
  const [muteNotifications, setMuteNotifications] =
    useState<{ id: string; message: string }>();
  const [unmuteNotifications, setUnmuteNotifications] =
    useState<{ id: string; message: string }>();

  useEffect(() => {
    room.onMessage('mute player', (data) => {
      const { id } = data;
      setIsUnMuted(false);

      if (myStream) myStream.getAudioTracks()[0].enabled = false;
      room.send('mute', { isUnMuted: true });
      setMuteNotifications({ id, message: `${id} has muted you.` });
      console.log(`${id} muted you`);
    });

    room.onMessage('unmute player', (data) => {
      const { id } = data;

      setUnmuteNotifications({ id, message: `${id} wants you to unmute.` });
      console.log(`${id} wants you to unmute.`);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, myStream]);

  useEffect(() => {
    getUserModel();
    setPhysics(new Physics());

    if (containerRef.current) {
      set((state) => ({ ...state, canvasContainerRef: containerRef.current }));
    }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={containerRef} className={classes}>
      {renderCanvas()}
    </div>
  );

  function renderCanvas() {
    if (!physics) {
      return null;
    }

    if (isWebXrSupported && isDesktop) {
      if (myStream) myStream.getAudioTracks()[0].enabled = false;

      return (
        <>
          {!closeVROverlay ? (
            <div className={styles.vrOverlay}>
              <p className={styles.vrOverlayTitle}>Enable mic to continue </p>
              <button
                className={styles.enableAudiobutton}
                onClick={() => {
                  setCloseVROverlay(true);
                  handleVoiceCall();
                }}
              >
                Enable mic
              </button>
              <button
                className={styles.textButton}
                onClick={() => {
                  setCloseVROverlay(true);
                }}
              >
                Continue without mic
              </button>
            </div>
          ) : (
            <>
              <div className={styles.vrInstructionsOverlay}>
                <div className={styles.vrInstructionsImageContainer}>
                  <Image
                    alt="Controls"
                    src="/controls/vr.png"
                    width={700}
                    height={539}
                    layout="responsive"
                  />
                </div>
              </div>
              <VRCanvas camera={{ fov: 70, position: [0, 1.8, 6] }}>
                <Suspense fallback={null}>
                  <XRCanvas room={room} nodes={nodes} />
                </Suspense>
                {myStream && <SVGButton stream={myStream} room={room} />}
                {renderNpcs()}
                <BaseScene nodes={nodes} physics={physics} />

                {/* <Perf /> */}
              </VRCanvas>
              {usersStreams.map((stream, index) => {
                return <Audio stream={stream.stream} key={index} />;
              })}
            </>
          )}
        </>
      );
    }

    return (
      <>
        <SettingsMenu room={room} />
        <OnboardingManager />
        <FocusImage />
        <Canvas camera={{ fov: 70, position: [0, 1.8, 6] }} shadows>
          {renderUser()}
          {renderNpcs()}

          <BaseScene nodes={nodes} physics={physics} />
          <EffectComposer>
            <Noise
              opacity={0.2}
              premultiply
              blendFunction={BlendFunction.ADD}
            />
            <BrightnessContrast brightness={-0.09} contrast={0.3} />
            <Bloom />
          </EffectComposer>
        </Canvas>
        {muteNotifications && (
          <Notifications
            isSelfClosing={true}
            onDelete={() => setMuteNotifications(undefined)}
          >
            <p className={styles.notificationMessage}>
              {muteNotifications.message}
            </p>
          </Notifications>
        )}
        {unmuteNotifications && (
          <Notifications>
            <p className={styles.notificationMessage}>
              {unmuteNotifications.message}
            </p>
            <div className={styles.buttonContainer}>
              <button
                className={styles.button}
                onClick={() => setUnmuteNotifications(undefined)}
              >
                Cancel
              </button>
              <button
                className={styles.button}
                onClick={() => {
                  if (clickCounter === 0) {
                    handleVoiceCall();
                  }

                  setIsUnMuted(true);
                  if (myStream) myStream.getAudioTracks()[0].enabled = true;

                  setClickCounter((v) => v + 1);

                  room.send('mute', { isUnMuted });
                  setUnmuteNotifications(undefined);
                }}
              >
                Unmute
              </button>
            </div>
          </Notifications>
        )}

        {clickedPlayer && (
          <Notifications>
            <p className={styles.notificationMessage}>
              {`Do you want to report player ${clickedPlayer.id}?`}
            </p>
            <div className={styles.buttonContainer}>
              <button
                className={styles.button}
                onClick={() => setClickedPlayer(undefined)}
              >
                Cancel
              </button>
              <button
                className={styles.button}
                onClick={() => {
                  // Report player with id {clickedPlayer.id}
                  setClickedPlayer(undefined);
                  setIsReported({ id: clickedPlayer.id });
                }}
              >
                Report
              </button>
            </div>
          </Notifications>
        )}
        {isReported && (
          <Notifications
            isSelfClosing={true}
            onDelete={() => setIsReported(undefined)}
          >
            <p className={styles.notificationMessage}>
              {`${isReported.id} has been reported. Thank you!`}
            </p>
          </Notifications>
        )}
        <div className={styles.canvasFooterMenu}>
          <IconButton
            icon={!isUnMuted ? IconType.muted : IconType.unmuted}
            onClick={() => {
              if (clickCounter === 0) {
                handleVoiceCall();
              }

              setIsUnMuted(!isUnMuted);

              muteMic();

              setClickCounter((v) => v + 1);
            }}
          />
          <IconButton
            icon={IconType.instruction}
            className={styles.instructionsIconContainer}
            onClick={() => setShouldRenderInstructions(true)}
          />

          {usersStreams.map((stream, index) => {
            return <Audio stream={stream.stream} key={index} />;
          })}
        </div>

        <Instructions
          shouldRenderInstructions={shouldRenderInstructions}
          onClose={() => setShouldRenderInstructions(false)}
        />
      </>
    );
  }

  function renderUser() {
    if (userAvatar && physics) {
      return <User room={room} physics={physics} glbUrl={userAvatar} />;
    }
  }

  async function getUserModel() {
    const user = client.auth.user();
    const data = await reexecute();

    if (data && data.data && user) {
      const profile = data.data.filter(
        (data: ProfileData) => data.id === user.id
      );

      if (profile?.length) {
        const { avatar } = profile[0];
        setUserAvatar(avatar as string);
      }
    }
  }

  function renderNpcs() {
    const players = getState().players;

    if (players) {
      const jsx = playerIds
        .filter((data) => data !== room.sessionId)
        .map((playerId, index) => {
          const player = players[playerId];

          return (
            <NonPlayableCharacters
              key={index}
              playerData={player}
              onClick={() => setClickedPlayer({ id: player.id })}
              onPointerOver={() => {
                if (containerRef?.current)
                  containerRef.current.style.cursor = 'pointer';
              }}
              onPointerLeave={() => {
                if (containerRef?.current)
                  containerRef.current.style.cursor = 'grab';
              }}
              room={room}
            />
          );
        });

      return jsx;
    }
  }

  function handleVoiceCall() {
    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((stream) => {
        setMyStream(stream);

        const peer = new Peer(room.sessionId);

        peer.on('open', (id) => {
          room.send('join-call', { id });
        });

        peer.on('call', (call) => {
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

          connectToNewUser(id, stream, peer);
        });
      });
  }

  function muteMic() {
    // console.log(usersStreams);
    if (myStream) myStream.getAudioTracks()[0].enabled = !isUnMuted;

    room.send('mute', { isUnMuted });
  }

  function connectToNewUser(userId: string, stream: MediaStream, peer: Peer) {
    const call = peer.call(userId, stream);
    if (call) {
      call.on('stream', (audioStream) => {
        // Add stream to array of user
        setUsersStreams((v) => [...v, { id: userId, stream: audioStream }]);
      });

      call.on('close', () => {
        console.log('close audio');
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
};

export default CanvasComponent;
