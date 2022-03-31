import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import shallow from 'zustand/shallow';
import type { GetState, SetState, StateSelector } from 'zustand';

const controls = {
  backward: false,
  forward: false,
  left: false,
  right: false,
};

export type IPlayerType = Record<string, IPlayerCoordinations>;

export interface IPlayerCoordinations {
  id: string;
  timestamp: number;
  x: number;
  y: number;
  z: number;
}

const clients = {};

const players: IPlayerType = {};

const playersCount: number = 0;

const hovered: boolean = false;

export type Controls = typeof controls;

const actionNames = ['idle', 'walking'] as const;
export type ActionNames = typeof actionNames[number];

const cursorState: CursorStates = 'grab';

type CursorStates = 'grab' | 'pointer';

export interface IState {
  controls: Controls;
  players: IPlayerType;
  playersCount: number;
  cursorState: CursorStates;
  hovered: boolean;
  get: Getter;
  set: Setter;
}

type Getter = GetState<IState>;
export type Setter = SetState<IState>;

const useStoreImplementation = create(
  subscribeWithSelector<IState>(
    (set: SetState<IState>, get: GetState<IState>) => {
      return {
        controls,
        clients,
        players,
        playersCount,
        hovered,
        cursorState,
        get,
        set,
      };
    }
  )
);

const useStore = <T>(sel: StateSelector<IState, T>) =>
  useStoreImplementation(sel, shallow);
Object.assign(useStore, useStoreImplementation);

const { getState, setState, subscribe } = useStoreImplementation;

export { getState, setState, useStore, subscribe };
