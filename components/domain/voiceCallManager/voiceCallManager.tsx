import classNames from 'classnames';
import { Room } from 'colyseus.js';
import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { Button } from '../../core/button/Button';
import { Notifications } from '../../core/notifications/Notifications';
import styles from './voiceCallManager.module.scss';
import { CallDashboard } from '../../core/callDashboard/callDashboard';

interface Props {
  room: Room;
  id: string;
  clickedPlayers: { id: string }[];
}

export const VoiceCallManager: React.FC<Props> = (props) => {
  const { room, id, clickedPlayers } = props;
  const [callRequests, setCallRequests] = useState<
    { signal: Peer.SignalData; id: string }[]
  >([]);
  const [stream, setStream] = useState<MediaStream>();
  const [notifications, setNotifications] = useState<{ id: string }[]>();
  const [isWaitingForResponse, setIsWaitingForResponse] =
    useState<boolean>(false);
  const [isCalling, setIsCalling] = useState<{ id: string }>();
  const [closeRequest, setCloseRequest] = useState<boolean>(false);
  const userAudio = useRef<HTMLAudioElement | null>(null);
  const connectionRef = useRef<Peer.Instance>();

  const deleteNotification = (id: string) =>
    setNotifications((v) => v?.filter((v) => v.id !== id));

  const deleteCallRequestNotification = (id: string) =>
    setCallRequests((v) => v.filter((v) => v.id !== id));

  useEffect(() => {
    setNotifications(clickedPlayers);
  }, [clickedPlayers]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((stream) => {
        setStream(stream);
      });

    room.onMessage(
      'sending private message',
      (data: { signal: Peer.SignalData; senderId: string }) => {
        const { signal, senderId } = data;

        setCallRequests((v) => [...v, { id: senderId, signal: signal }]);
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {isCalling && (
        <CallDashboard
          id={isCalling.id}
          onMute={() => console.log('should mute')}
          onEnd={() => leaveCall(isCalling.id)}
        />
      )}
      {renderCallNotification()}
      {renderRequestNotifications()}
      <audio className={styles.audio} playsInline ref={userAudio} autoPlay />
    </>
  );

  function renderCallNotification() {
    return notifications?.map((value, index) => (
      <Notifications
        isClosing={isCalling ? true : false}
        key={index}
        types={'info'}
        onDelete={() => deleteCallRequestNotification(value.id)}
      >
        <div className={styles.notificationContainer}>
          <p className={styles.notificationTitle}>
            {!isWaitingForResponse
              ? `Call player ${value.id}`
              : `Calling ${value.id}..`}{' '}
          </p>

          {!isWaitingForResponse && (
            <div className={styles.buttonContainer}>
              <Button
                onClick={() => handleClickedNonPlayableCharacter(value.id)}
                className={styles.notificationButton}
                text={'Call'}
              />
              <Button
                className={classNames(
                  styles.notificationButton,
                  styles.cancelNotificationButton
                )}
                onClick={() => deleteNotification(value.id)}
                text={'Cancel'}
              />
            </div>
          )}
        </div>
      </Notifications>
    ));
  }

  function handleClickedNonPlayableCharacter(clickedPlayer: string) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on('signal', (data) => {
      room.send('sending private message', {
        to: clickedPlayer,
        signal: data,
      });
    });

    peer.on('stream', (stream) => {
      if (userAudio.current) userAudio.current.srcObject = stream;
    });

    setIsWaitingForResponse(true);

    peer.on('close', () => {
      console.log('test');
      setIsCalling(undefined);
      setIsWaitingForResponse(false);
      deleteNotification(clickedPlayer);
    });

    peer.on('end', () => {
      console.log('test from end');
    });

    room.onMessage('callAccepted', (data) => {
      const { signal, id } = data;
      console.log(signal);
      setIsCalling({ id: id });

      peer.signal(signal);
    });

    connectionRef.current = peer;
  }

  function renderRequestNotifications() {
    return callRequests.map(({ id, signal }) => (
      <Notifications
        isClosing={closeRequest}
        key={id}
        types={'info'}
        onDelete={() => deleteNotification(id)}
      >
        <div className={styles.notificationContainer}>
          <p className={styles.notificationTitle}>
            {id} Wants to start a voice call
          </p>
          <div className={styles.buttonContainer}>
            <button
              onClick={() => answerCall(id, signal)}
              className={styles.notificationButton}
            >
              Accept
            </button>
            <button
              className={classNames(
                styles.notificationButton,
                styles.cancelNotificationButton
              )}
              onClick={() => deleteNotification(id)}
            >
              Decline
            </button>
          </div>
        </div>
      </Notifications>
    ));
  }

  function answerCall(callerId: string, callerSignal: Peer.SignalData) {
    setCloseRequest(true);
    setIsWaitingForResponse(false);
    deleteNotification(callerId);
    deleteCallRequestNotification(callerId);

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    peer.on('signal', (data) => {
      room.send('answerCall', { signal: data, to: callerId });
      setIsCalling({ id: callerId });
    });

    peer.on('stream', (stream) => {
      if (userAudio.current) userAudio.current.srcObject = stream;
    });

    peer.on('close', () => {
      setCloseRequest(false);
      setIsCalling(undefined);
    });

    peer.signal(callerSignal);

    connectionRef.current = peer;
  }

  function leaveCall(id: string) {
    deleteNotification(id);
    deleteCallRequestNotification(id);
    setIsCalling(undefined);
    setCloseRequest(false);

    if (connectionRef.current) connectionRef.current.destroy();

    connectionRef.current = undefined;
  }
};
