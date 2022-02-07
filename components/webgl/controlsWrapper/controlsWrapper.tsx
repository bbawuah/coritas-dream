import React, { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { OrbitControls } from '@react-three/drei';

interface Props {
  socket: Socket<DefaultEventsMap, DefaultEventsMap>;
}

export const ControlsWrapper: React.FC<Props> = (props) => {
  const { socket } = props;
  const controlsRef = useRef<any>();
  const [updateCallback, setUpdateCallback] = useState(null);

  useEffect(() => {
    const onControlsChange = (ev: any) => {
      const { position, rotation } = ev.target.object;
      const { id } = socket;

      const posArray: Array<number> = [];
      const rotArray: Array<number> = [];

      position.toArray(posArray);
      rotation.toArray(rotArray);

      socket.emit('move', {
        id,
        rotation: rotArray,
        position: posArray,
      });
    };

    if (controlsRef.current) {
      setUpdateCallback(
        controlsRef.current.addEventListener('change', onControlsChange)
      );
    }

    // Dispose
    return () => {
      if (updateCallback && controlsRef.current)
        controlsRef.current.removeEventListener('change', onControlsChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlsRef, socket]);

  return <OrbitControls enablePan={true} enableZoom={true} ref={controlsRef} />;
};
