export interface IPositionType {
  x: number;
  y: number;
  z: number;
}

export interface IMoveProps extends IPositionType {
  rx: number;
  ry: number;
  rz: number;
  azimuthalAngle: number;
}

export type IUserDirection = 'forward' | 'backward' | 'left' | 'right' | 'idle';
