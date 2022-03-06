import { useEffect, useState } from 'react';
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
};

interface Props {
  keyDownEvent: (d: IUserDirection) => void;
  keyUpEvent: (d: IUserDirection) => void;
}

export const useKeyboardEvents = (props: Props) => {
  const [userDirection, setUserDirection] = useState<IUserDirection>();
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
      setUserDirection(keys[ev.key]);
      props.keyDownEvent(keys[ev.key]);
    }
  }

  function onKeyUp(ev: KeyboardEvent) {
    const objectKeys = Object.keys(keys);
    if (objectKeys.includes(ev.key)) {
      setUserDirection('idle');
      props.keyUpEvent(keys[ev.key]);
    }
  }

  return [userDirection];
};
