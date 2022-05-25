/* eslint-disable @next/next/no-img-element */
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { Suspense, useEffect, useState } from 'react';
import styles from '../styles/home/Home.module.scss';
import Link from 'next/link';
import { Footer } from '../components/core/footer/footer';
import { Header } from '../components/core/headers/basicHeader/basicHeader';
import { useAuth } from '../hooks/useAuth';
import { useSignOut } from 'react-supabase';

const Canvas = dynamic(() => import('../components/landingPageCanvas/canvas'), {
  ssr: false,
});

const Home: NextPage = () => {
  const [isSsr, setIsSsr] = useState<boolean>(true); // andere manier fixen
  const { session, user } = useAuth();
  const [titleElement, setTitleElement] = useState<HTMLHeadingElement>();
  const [{ error, fetching }, signOut] = useSignOut(); //Render logout error

  useEffect(() => {
    if (session) {
      (async () => {
        await signOut();
      })();
    }

    setIsSsr(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Head>
        <title>CORITA&apos;S DREAM</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.container}>
        <div className={styles.gridWrapper}>
          <Header showLogo={false} />
          <main className={styles.main}>
            <section className={styles.contentContainer}>
              <h1
                ref={(value) => {
                  if (value) setTitleElement(value);
                }}
                className={styles.title}
              >
                Corita&apos;s dream{' '}
              </h1>
              <div className={styles.descriptionContainer}>
                <p className={styles.description}>
                  An immersive social experience that puts a magnifying glass on
                  the ideals of Corita Kent.
                </p>
                <p className={styles.description}>
                  This experience is inspired by the exhibition Everyday,
                  Someday and Other Stories, which can be viewed in the
                  Stedelijk Museum, where developments in visual art and design
                  from the 1950s to the 1980s.
                </p>
                <p className={styles.description}>
                  Throughout the ‘60s, her work became increasingly political,
                  urging viewers to consider poverty, racism, and injustice.
                </p>
                <p className={styles.description}>
                  With her art, Corita shares her powerful message of love,
                  hope, and justice.
                </p>
              </div>
            </section>
            <section className={styles.buttonContainer}>
              <Link href={!session ? '/signin' : '/dream'}>
                <a className={styles.button}>Start Experience</a>
              </Link>
            </section>
          </main>
          <Footer />
        </div>
        <div className={styles.animationContainer}>
          <p className={styles.animationText}>
            <span className={styles.love}>love</span> -{' '}
            <span className={styles.hope}>hope</span> -{' '}
            <span className={styles.justice}>justice</span>
          </p>
        </div>
        {renderCanvas()}
      </div>
    </>
  );

  function renderCanvas() {
    if (isSsr || !titleElement) {
      return null;
    }

    return (
      <Suspense fallback={null}>
        <Canvas titleElement={titleElement} />
      </Suspense>
    );
  }
};

export default Home;
