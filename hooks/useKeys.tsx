import { useEffect } from 'react';
import { useStore } from '../store/store';

const controls = {
  backward: false,
  forward: false,
  left: false,
  right: false,
};

interface Keys {
  [x: string]: string;
}

const keys: Keys = {
  w: 'forward',
  s: 'backward',
  a: 'left',
  d: 'right',
};

export function Keyboard() {
  const { set, get } = useStore(({ get, set }) => ({ get, set }));
  const state = get();

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown, { passive: true });
    document.addEventListener('keyup', onKeyUp, { passive: true });

    return () => (
      document.removeEventListener('keydown', onKeyDown),
      document.removeEventListener('keyup', onKeyUp)
    );
  }, []);

  function onKeyDown(ev: KeyboardEvent) {
    const objectKeys = Object.keys(keys);
    if (objectKeys.includes(ev.key)) {
      set((state) => ({
        ...state,
        controls: { ...state.controls, [keys[ev.key]]: true },
      }));
    }
  }

  function onKeyUp(ev: KeyboardEvent) {
    const objectKeys = Object.keys(keys);
    if (objectKeys.includes(ev.key)) {
      set((state) => ({
        ...state,
        controls: { ...state.controls, [keys[ev.key]]: false },
      }));
    }
  }

  return null;
}
