export interface IPositionType {
  x: number;
  y: number;
  z: number;
}

export interface IHandlePhysicsProps {
  timestamp: number;
  userDirection: IUserDirection;
  azimuthalAngle: number;
}

export type IUserDirection = 'forward' | 'backward' | 'left' | 'right' | 'idle';
