import { Player } from '../player/player';

export interface IPositionType {
  x: number;
  y: number;
  z: number;
}

export interface IHandlePhysicsProps {
  userDirection: IUserDirection;
  azimuthalAngle: number;
}

export type IUserDirection = 'forward' | 'backward' | 'left' | 'right' | 'idle';
