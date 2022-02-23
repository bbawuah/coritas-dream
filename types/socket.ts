export type ClientType = Record<
  string,
  {
    position: [number, number, number];
    rotation: [number, number, number];
  }
>;

export type Controls = {
  backward: boolean;
  left: boolean;
  forward: boolean;
  right: boolean;
};

export interface EmitProps {
  id: string;
  rotation: [number, number, number];
  controls: Controls;
  velocity: [number, number, number];
  time: number;
}
