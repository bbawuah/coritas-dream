import { useEffect, useRef, useState } from 'react';
import { IUserDirection } from '../shared/physics/types';
import { useStore } from '../store/store';

interface Keys {
  [x: string]: IUserDirection;
}

const keys: Keys = {
  w: 'forward',
  s: 'backward',
  a: 'left',
  d: 'right',
  W: 'forward',
  S: 'backward',
  A: 'left',
  D: 'right',
};

interface Props {
  keyDownEvent: (d: IUserDirection) => void;
  keyUpEvent: (d: IUserDirection) => void;
}

export const useKeyboardEvents = (props: Props) => {
  const userDirection = useRef<IUserDirection>('idle');
  const { set } = useStore(({ set }) => ({ set }));

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown, { passive: true });
    document.addEventListener('keyup', onKeyUp, { passive: true });

    return () => (
      document.removeEventListener('keydown', onKeyDown),
      document.removeEventListener('keyup', onKeyUp)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onKeyDown(ev: KeyboardEvent) {
    const objectKeys = Object.keys(keys);
    if (objectKeys.includes(ev.key)) {
      userDirection.current = keys[ev.key];
      props.keyDownEvent(keys[ev.key]);
    }
  }

  function onKeyUp(ev: KeyboardEvent) {
    const objectKeys = Object.keys(keys);
    if (objectKeys.includes(ev.key)) {
      userDirection.current = 'idle';
      props.keyUpEvent(keys[ev.key]);
    }
  }

  function getDirection(): IUserDirection {
    return userDirection.current;
  }

  return [getDirection];
};
