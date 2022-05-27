import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import styles from '../styles/signin/SignIn.module.scss';
import { Provider } from '@supabase/supabase-js';
import classNames from 'classnames';
import { client } from '../utils/supabase';
import { Footer } from '../components/core/footer/footer';
import { Header } from '../components/core/headers/basicHeader/basicHeader';
import { useSignIn } from 'react-supabase';
import { Button } from '../components/core/button/Button';

const dev: boolean = process.env.NODE_ENV !== 'production';
console.log(dev);

const SignIn: NextPage = () => {
  const [{ error, fetching, session, user }, signIn] = useSignIn();
  const [isSsr, setIsSsr] = useState<boolean>(true); // andere manier fixen

  useEffect(() => {
    setIsSsr(false);
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>CORITA&apos;S DREAM</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header showLogo={true} />
      <main className={styles.main}>
        <section className={styles.contentContainer}>
          <p className={styles.description}>Log in to continue</p>
          <section className={styles.buttonContainer}>
            <Button
              onClick={() =>
                signIn(
                  {
                    provider: 'google',
                  },
                  {
                    redirectTo: dev
                      ? 'http://localhost:3000/dream'
                      : 'https://coritas-dream.herokuapp.com/dream' ||
                        'https://coritasdream.xyz/dream',
                  }
                )
              }
              className={classNames(styles.signInbutton, styles.google)}
              text={'Google'}
            />
            <Button
              onClick={() =>
                signIn(
                  {
                    provider: 'facebook',
                  },
                  {
                    redirectTo: dev
                      ? 'http://localhost:3000/dream'
                      : 'https://coritas-dream.herokuapp.com/dream' ||
                        'https://coritasdream.xyz/dream',
                  }
                )
              }
              className={classNames(styles.signInbutton, styles.facebook)}
              text={'Facebook'}
            />

            <Button
              onClick={() =>
                signIn(
                  {
                    provider: 'github',
                  },
                  {
                    redirectTo: dev
                      ? 'http://localhost:3000/dream'
                      : 'https://coritas-dream.herokuapp.com/dream' ||
                        'https://coritasdream.xyz/dream',
                  }
                )
              }
              className={classNames(styles.signInbutton, styles.github)}
              text={'Github'}
            />
          </section>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SignIn;
