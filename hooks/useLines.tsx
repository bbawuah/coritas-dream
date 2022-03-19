import { useMemo } from 'react';
import * as THREE from 'three';

const getRange = () => Math.max(0.2, Math.random());

interface Props {
  radius: number;
  count: number;
  colors: Array<string>;
}

export const useLines = (props: Props) => {
  const { radius, count, colors } = props;

  const line = useMemo(
    () =>
      new Array(count).fill(undefined).map((_, index) => {
        const pos = new THREE.Vector3(
          Math.sin(0) * radius * getRange(),
          Math.cos(0) * radius * getRange(),
          0
        );

        const points = new Array(20).fill(undefined).map((_, index) => {
          const angle = (index / 20) * Math.PI * 2;
          return pos
            .add(
              new THREE.Vector3(
                Math.sin(angle) * radius * getRange(),
                Math.cos(angle) * radius * getRange(),
                Math.sin(angle) * Math.cos(angle) * radius * getRange()
              )
            )
            .clone();
        });

        const curve = new THREE.CatmullRomCurve3(points).getPoints(1000);

        return {
          width: Math.max(0.1, (0.2 * index) / 10),
          speed: Math.max(0.001, 0.004 * Math.random()),
          curve,
          color: colors[parseInt((colors.length * Math.random()) as any)],
        };
      }),
    [count]
  );

  return line;
};
