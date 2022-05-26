import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import shallow from 'zustand/shallow';
import type { GetState, SetState, StateSelector } from 'zustand';
import Peer from 'simple-peer';

const controls = {
  backward: false,
  forward: false,
  left: false,
  right: false,
};

export type IPlayerType = Record<string, IPlayerNetworkData>;

export interface IPlayerNetworkData {
  id: string;
  timestamp: number;
  animationState: ActionNames;
  x: number;
  uuid: string;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
}

interface CallRequests {
  id: string;
  signal: Peer.SignalData;
}

const playerIds: string[] = [];

const players: IPlayerType = {};

const callRequests: CallRequests[] = [];

const playersCount: number = 0;

const focusImage: string =  ''

const animationName: ActionState = { animationName: 'idle' };

export type Controls = typeof controls;

interface ActionState {
  animationName: ActionNames;
  cb?: () => void;
}

const actionNames = ['idle', 'walking', 'praying', 'fist'] as const;
export type ActionNames = typeof actionNames[number];

const cursorState: CursorStates = 'grab';

type CursorStates = 'grab' | 'pointer';

export interface IState {
  controls: Controls;
  players: IPlayerType | undefined;
  playerIds: string[];
  playersCount: number;
  focusImage: string
  animationName: ActionState;
  callRequests: CallRequests[];
  cursorState: CursorStates;
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
        players,
        playerIds,
        playersCount,
        callRequests,
        focusImage,
        animationName,
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
