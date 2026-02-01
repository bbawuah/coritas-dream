import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';
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
  avatar: string;
  x: number;
  uuid: string;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  isUnMuted: boolean;
}

interface CallRequests {
  id: string;
  signal: Peer.SignalData;
}

export interface PaintingMetaData {
  src: string;
  title: string;
  description: string;
  isVisibleInMuseum: boolean;
}

const playerIds: string[] = [];

const players: IPlayerType = {};

const callRequests: CallRequests[] = [];

const isMuted: boolean = false;

const playersCount: number = 0;

const canvasContainerRef: HTMLDivElement | null = null;

const focusImage: PaintingMetaData | undefined = undefined;

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
  isMuted: boolean;
  canvasContainerRef: HTMLDivElement | null;
  focusImage: PaintingMetaData | undefined;
  animationName: ActionState;
  callRequests: CallRequests[];
  cursorState: CursorStates;
  get: () => IState;
  set: (partial: Partial<IState> | ((state: IState) => Partial<IState>)) => void;
}

const useStoreImplementation = create<IState>()(
  subscribeWithSelector((set, get) => ({
    controls,
    players,
    playerIds,
    playersCount,
    isMuted,
    callRequests,
    canvasContainerRef,
    focusImage,
    animationName,
    cursorState,
    get,
    set,
  }))
);

const useStore = <T>(sel: (state: IState) => T) =>
  useStoreImplementation(useShallow(sel));
Object.assign(useStore, useStoreImplementation);

const { getState, setState, subscribe } = useStoreImplementation;

export { getState, setState, useStore, subscribe };
