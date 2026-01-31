import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import styles from '../styles/dream/Dream.module.scss';
import { useColyseus } from '../hooks/useColyseus';
import { Suspense, useEffect, useState } from 'react';
import type { Navigator } from 'webxr';
import { useDeviceCheck } from '../hooks/useDeviceCheck';
import { Loader } from '../components/experience/loader/loader';

const Canvas = dynamic(() => import('../components/experience/canvas/canvas'), {
  ssr: false,
});

const Dream: NextPage = () => {
  const { isInVR } = useDeviceCheck();
  const { room } = useColyseus();
  const [webXRIsSupported, setWebXRIsSupported] = useState<boolean>();

  useEffect(() => {
    const webXRNavigator: Navigator = navigator as any as Navigator;

    if ('xr' in webXRNavigator) {
      webXRNavigator.xr.isSessionSupported('immersive-vr').then((supported) => {
        setWebXRIsSupported(supported);
      });
    }
  }, [isInVR]);

  return (
    <div className={styles.container}>
      <Head>
        <title>CORITA&apos;S DREAM</title>
        <meta name="description" content="Corita's Dream - An immersive multiplayer gallery experience" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {renderCanvas()}
    </div>
  );

  function renderCanvas() {
    if (!room) {
      return <Loader />;
    }

    return (
      <Suspense fallback={<Loader />}>
        <Canvas isWebXrSupported={webXRIsSupported ?? false} room={room} />
      </Suspense>
    );
  }
};

export default Dream;
