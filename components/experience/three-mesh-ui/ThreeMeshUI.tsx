// @ts-ignore
import { useEffect } from 'react';
import * as THREE from 'three';

interface Props {
  scene: THREE.Scene;
}

export const MakeTextPanel: React.FC<Props> = (props) => {
  const { scene } = props;
  console.log('from ui component');

  useEffect(() => {
    const load = async () => {
      const module = (await import('three-mesh-ui')).default;
      console.log(module);
    };

    load();
  }, []);
  // const container = new ThreeMeshUI.Block({
  //   width: 1.2,
  //   height: 0.5,
  //   padding: 0.05,
  //   justifyContent: 'center',
  //   textAlign: 'left',
  // });

  // container.position.set(0, 1, -1.8);
  // container.rotation.x = -0.55;
  // scene.add(container);

  // //

  // container.add(
  //   new ThreeMeshUI.Text({
  //     content: 'This library supports line-break-friendly-characters,',
  //     fontSize: 0.055,
  //   }),

  //   new ThreeMeshUI.Text({
  //     content:
  //       ' As well as multi-font-size lines with consistent vertical spacing.',
  //     fontSize: 0.08,
  //   })
  // );

  return null;
};
