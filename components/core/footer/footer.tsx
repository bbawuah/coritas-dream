import React from 'react';
import Image from 'next/image';
import styles from './footer.module.scss';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.stedelijkLogo}>
        <a href="https://www.stedelijk.nl/en" target="_blank" rel="noreferrer">
          <Image
            alt="Stedelijk logo"
            src="/svg/stedelijk-logo.svg"
            width={60}
            height={60}
          />
        </a>
      </div>
      <a href="https://readyplayer.me/" target="_blank" rel="noreferrer">
        <Image
          className={styles.image}
          alt="Ready player me"
          src="/svg/ready-player-me.svg"
          width={60}
          height={60}
        />
      </a>
      <p className={styles.copyright}>
        <a href="https://www.brianbawuah.com/" target="_blank" rel="noreferrer">
          By Brian Bawuah
        </a>
      </p>
    </footer>
  );
};
