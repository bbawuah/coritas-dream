import React from 'react';
import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import shallow from 'zustand/shallow';
import type { GetState, SetState, StateSelector } from 'zustand';
import { IUserDirection } from '../shared/physics/types';

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

const userDirection: IUserDirection = 'idle';

const clients = {};

const azimuthalAngle: number = 0;

const players: IPlayerType = {};

const playersCount: number = 0;

export type Controls = typeof controls;

const actionNames = ['idle', 'walking'] as const;
export type ActionNames = typeof actionNames[number];

interface ICoordinates {
  position: [x: number, y: number, z: number];
  rotation: [x: number, y: number, z: number];
}

export interface IState {
  controls: Controls;
  userDirection: IUserDirection;
  players: IPlayerType;
  playersCount: number;
  azimuthalAngle: number;
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
        userDirection,
        azimuthalAngle,
        playersCount,
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
