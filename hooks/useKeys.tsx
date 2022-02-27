import { useEffect } from 'react';
import { IUserDirection } from '../server/physics/types';
import { useStore } from '../store/store';

interface Keys {
  [x: string]: IUserDirection;
}

const keys: Keys = {
  w: 'forward',
  s: 'backward',
  a: 'left',
  d: 'right',
};

// Data to server should be send in this component

export const useKeyboardEvents = () => {
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
      set((state) => ({
        ...state,
        userDirection: keys[ev.key],
      }));
    }
  }

  function onKeyUp(ev: KeyboardEvent) {
    const objectKeys = Object.keys(keys);
    if (objectKeys.includes(ev.key)) {
      set((state) => ({
        ...state,
        userDirection: 'idle',
      }));
    }
  }

  return null;
};
