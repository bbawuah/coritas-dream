import React from 'react';
import create from 'zustand';
import shallow from 'zustand/shallow';
import type { GetState, SetState, StateSelector } from 'zustand';
import * as THREE from 'three';
import { ClientType } from '../types/socket';
import dynamic from 'next/dynamic';
import { Camera } from 'three';

const controls = {
  backward: false,
  forward: false,
  left: false,
  right: false,
};

const clients = {};

const test = false;

let collider: THREE.Mesh;

// export const cameras = ['DEFAULT', 'FIRST_PERSON', 'BIRD_EYE'] as const;
// export type Camera = typeof cameras[number];

export type Controls = typeof controls;

const actionNames = ['idle', 'walking'] as const;
export type ActionNames = typeof actionNames[number];

interface ICoordinates {
  position: [x: number, y: number, z: number];
  rotation: [x: number, y: number, z: number];
}

export interface IState {
  actions: Record<ActionNames, (camera: Camera) => void>;
  controls: Controls;
  test: boolean;
  clients: ClientType;
  collider: THREE.Mesh;
  get: Getter;
  set: Setter;
}

type Getter = GetState<IState>;
export type Setter = SetState<IState>;

const useStoreImplementation = create<IState>(
  (set: SetState<IState>, get: GetState<IState>) => {
    const actions = {
      walking: () => {},
      idle: () => {},
    };

    return {
      actions,
      controls,
      clients,
      test,
      collider,
      get,
      set,
    };
  }
);

const useStore = <T>(sel: StateSelector<IState, T>) =>
  useStoreImplementation(sel, shallow);
Object.assign(useStore, useStoreImplementation);

const { getState, setState } = useStoreImplementation;

export { getState, setState, useStore };
