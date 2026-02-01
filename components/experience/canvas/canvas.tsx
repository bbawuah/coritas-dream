/* eslint-disable @next/next/no-img-element */
import React, { Suspense, useEffect, useRef, useState, useCallback } from 'react';
import * as styles from './canvas.module.scss';
import classNames from 'classnames';
import { Canvas } from '@react-three/fiber';
import { User } from '../users/user';
import { Physics } from '../../../shared/physics/physics';
import { useGLTF } from '@react-three/drei';
import { XR, createXRStore } from '@react-three/xr';
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
import { NonPlayableCharacters } from '../users/NonPlayableCharacters/NonPlayableCharacters';
import { IconType } from '../../../utils/icons/types';
import { XRCanvas as XRCanvasComponent } from './xrCanvas';
import { Room } from 'colyseus.js';
import { Player } from '../../../server/player/player';
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

const Audio: React.FC<{ stream: MediaStream; odId: string }> = ({ stream, odId }) => {
  const ref = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;

    return () => {
      if (ref.current) ref.current.srcObject = null;
    };
  }, [stream]);

  return <audio className={styles.audio} playsInline ref={ref} autoPlay />;
};

// Create XR store outside of component to avoid recreation on re-renders
const xrStore = createXRStore();

const CanvasComponent: React.FC<Props> = (props) => {
  const { isWebXrSupported, room } = props;
  const { nodes } = useGLTF('/environment-transformed.glb') as unknown as GLTFResult;
  const { isDesktop } = useDeviceCheck();
  const [physics, setPhysics] = useState<Physics | null>(null);
  const [userAvatar, setUserAvatar] = useState<string>();
  const containerRef = useRef<HTMLDivElement>(null);
  const classes = classNames([styles.container]);
  const [shouldRenderInstructions, setShouldRenderInstructions] = useState<boolean>(false);
  const { playerIds, set } = useStore(({ playerIds, set }) => ({ playerIds, set }));

  // WebRTC state
  const [myStream, setMyStream] = useState<MediaStream>();
  const [usersStreams, setUsersStreams] = useState<{ id: string; stream: MediaStream }[]>([]);
  const [isUnMuted, setIsUnMuted] = useState<boolean>(false);
  const peers = useRef<{ [id: string]: MediaConnection }>({});
  const peerInstance = useRef<Peer | null>(null);
  const [voiceCallInitialized, setVoiceCallInitialized] = useState(false);

  // UI state
  const [clickedPlayer, setClickedPlayer] = useState<{ id: string }>();
  const [isReported, setIsReported] = useState<{ id: string }>();
  const [closeVROverlay, setCloseVROverlay] = useState<boolean>(false);
  const [muteNotifications, setMuteNotifications] = useState<{ id: string; message: string }>();
  const [unmuteNotifications, setUnmuteNotifications] = useState<{ id: string; message: string }>();

  // Cleanup function for WebRTC
  const cleanupWebRTC = useCallback(() => {
    // Stop all media tracks
    if (myStream) {
      myStream.getTracks().forEach(track => track.stop());
    }

    // Close all peer connections
    Object.values(peers.current).forEach(conn => conn.close());
    peers.current = {};

    // Destroy peer instance
    if (peerInstance.current) {
      peerInstance.current.destroy();
      peerInstance.current = null;
    }

    setUsersStreams([]);
  }, [myStream]);

  // Initialize physics and get user avatar
  useEffect(() => {
    setPhysics(new Physics());
    getUserModel();

    if (containerRef.current) {
      set((state) => ({ ...state, canvasContainerRef: containerRef.current }));
    }

    // Cleanup on unmount
    return () => {
      cleanupWebRTC();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle mute/unmute messages
  useEffect(() => {
    const handleMutePlayer = (data: { id: string }) => {
      const { id } = data;
      setIsUnMuted(false);
      if (myStream) myStream.getAudioTracks()[0].enabled = false;
      room.send('mute', { isUnMuted: false });
      setMuteNotifications({ id, message: `${id} has muted you.` });
    };

    const handleUnmutePlayer = (data: { id: string }) => {
      const { id } = data;
      setUnmuteNotifications({ id, message: `${id} wants you to unmute.` });
    };

    const handleUserDisconnected = (data: { id: string }) => {
      const { id } = data;
      if (peers.current[id]) {
        peers.current[id].close();
        delete peers.current[id];
        setUsersStreams((v) => v.filter((s) => s.id !== id));
      }
    };

    room.onMessage('mute player', handleMutePlayer);
    room.onMessage('unmute player', handleUnmutePlayer);
    room.onMessage('user-disconnected', handleUserDisconnected);

    // Note: Colyseus doesn't have offMessage, handlers are cleaned when room is left
  }, [room, myStream]);

  function getUserModel() {
    const player = room.state.players.get(room.sessionId);
    if (player && player.avatar) {
      setUserAvatar(player.avatar);
    } else {
      room.state.players.onAdd = (player: Player, key: string) => {
        if (key === room.sessionId && player.avatar) {
          setUserAvatar(player.avatar);
        }
      };
    }
  }

  function handleVoiceCall() {
    if (voiceCallInitialized) return;

    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((stream) => {
        setMyStream(stream);
        setVoiceCallInitialized(true);

        const peer = new Peer(room.sessionId);
        peerInstance.current = peer;

        peer.on('open', (id) => {
          room.send('join-call', { id });
        });

        peer.on('call', (call) => {
          call.answer(stream);

          call.on('stream', (remoteStream) => {
            setUsersStreams((v) => {
              // Prevent duplicates
              if (v.some(s => s.id === call.peer)) return v;
              return [...v, { id: call.peer, stream: remoteStream }];
            });
          });

          peers.current[call.peer] = call;
        });

        peer.on('error', (err) => {
          console.error('PeerJS error:', err);
        });

        room.onMessage('user-connected', (data: { id: string }) => {
          const { id } = data;
          connectToNewUser(id, stream, peer);
        });
      })
      .catch((err) => {
        console.error('Failed to get user media:', err);
        alert('Could not access microphone. Please check permissions.');
      });
  }

  function connectToNewUser(userId: string, stream: MediaStream, peer: Peer) {
    // Don't call ourselves
    if (userId === room.sessionId) return;

    // Don't duplicate calls
    if (peers.current[userId]) return;

    const call = peer.call(userId, stream);
    if (call) {
      call.on('stream', (audioStream) => {
        setUsersStreams((v) => {
          if (v.some(s => s.id === userId)) return v;
          return [...v, { id: userId, stream: audioStream }];
        });
      });

      call.on('close', () => {
        setUsersStreams((v) => v.filter((s) => s.id !== userId));
        delete peers.current[userId];
      });

      peers.current[userId] = call;
    }
  }

  function muteMic() {
    if (myStream) {
      myStream.getAudioTracks()[0].enabled = !isUnMuted;
    }
    room.send('mute', { isUnMuted: !isUnMuted });
  }

  function renderUser() {
    if (userAvatar && physics) {
      return <User room={room} physics={physics} glbUrl={userAvatar} />;
    }
    return null;
  }

  function renderNpcs() {
    const players = getState().players;

    if (!players) return null;

    return playerIds
      .filter((id) => id !== room.sessionId)
      .map((playerId) => {
        const player = players[playerId];
        if (!player) return null;

        return (
          <NonPlayableCharacters
            key={playerId}
            playerData={player}
            onClick={() => setClickedPlayer({ id: player.id })}
            onPointerOver={() => {
              if (containerRef?.current) containerRef.current.style.cursor = 'pointer';
            }}
            onPointerLeave={() => {
              if (containerRef?.current) containerRef.current.style.cursor = 'grab';
            }}
            room={room}
          />
        );
      });
  }

  function renderCanvas() {
    if (!physics) return null;

    if (isWebXrSupported && isDesktop) {
      if (myStream) myStream.getAudioTracks()[0].enabled = false;

      return (
        <>
          {!closeVROverlay ? (
            <div className={styles.vrOverlay}>
              <p className={styles.vrOverlayTitle}>Enable mic to continue</p>
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
                onClick={() => setCloseVROverlay(true)}
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
                    style={{ width: '100%', height: 'auto' }}
                  />
                </div>
              </div>
              <Canvas camera={{ fov: 70, position: [0, 1.8, 6] }}>
                <XR store={xrStore}>
                  <Suspense fallback={null}>
                    <XRCanvasComponent room={room} nodes={nodes} />
                  </Suspense>
                  {myStream && <SVGButton stream={myStream} room={room} />}
                  {renderNpcs()}
                  <BaseScene nodes={nodes} physics={physics} />
                </XR>
              </Canvas>
              {usersStreams.map((s) => (
                <Audio stream={s.stream} odId={s.id} key={s.id} />
              ))}
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
            <Noise opacity={0.2} premultiply blendFunction={BlendFunction.ADD} />
            <BrightnessContrast brightness={-0.09} contrast={0.3} />
            <Bloom />
          </EffectComposer>
        </Canvas>

        {muteNotifications && (
          <Notifications isSelfClosing={true} onDelete={() => setMuteNotifications(undefined)}>
            <p className={styles.notificationMessage}>{muteNotifications.message}</p>
          </Notifications>
        )}

        {unmuteNotifications && (
          <Notifications isSelfClosing={true}>
            <p className={styles.notificationMessage}>{unmuteNotifications.message}</p>
            <div className={styles.buttonContainer}>
              <button className={styles.button} onClick={() => setUnmuteNotifications(undefined)}>
                Cancel
              </button>
              <button
                className={styles.button}
                onClick={() => {
                  if (!voiceCallInitialized) handleVoiceCall();
                  setIsUnMuted(true);
                  if (myStream) myStream.getAudioTracks()[0].enabled = true;
                  room.send('mute', { isUnMuted: true });
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
              <button className={styles.button} onClick={() => setClickedPlayer(undefined)}>
                Cancel
              </button>
              <button
                className={styles.button}
                onClick={() => {
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
          <Notifications isSelfClosing={true} onDelete={() => setIsReported(undefined)}>
            <p className={styles.notificationMessage}>
              {`${isReported.id} has been reported. Thank you!`}
            </p>
          </Notifications>
        )}

        <div className={styles.canvasFooterMenu}>
          <IconButton
            icon={!isUnMuted ? IconType.muted : IconType.unmuted}
            onClick={() => {
              if (!voiceCallInitialized) handleVoiceCall();
              setIsUnMuted(!isUnMuted);
              muteMic();
            }}
          />
          <IconButton
            icon={IconType.instruction}
            className={styles.instructionsIconContainer}
            onClick={() => setShouldRenderInstructions(true)}
          />
          {usersStreams.map((s) => (
            <Audio stream={s.stream} odId={s.id} key={s.id} />
          ))}
        </div>

        <Instructions
          shouldRenderInstructions={shouldRenderInstructions}
          onClose={() => setShouldRenderInstructions(false)}
        />
      </>
    );
  }

  return (
    <div ref={containerRef} className={classes}>
      {renderCanvas()}
    </div>
  );
};

export default CanvasComponent;
