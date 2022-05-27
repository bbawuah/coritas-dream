import { Html, useProgress } from '@react-three/drei';
import React from 'react';
import styles from './loader.module.scss';

export const Loader: React.FC = () => {
  const { progress } = useProgress();

  return (
    <div className={styles.container}>
      <p className={styles.loader}>{Math.floor(progress)} % loaded</p>
      <div className={styles.loadingContainer}>
        <div
          className={styles.loadingBar}
          style={{
            width: `${progress}%`,
          }}
        ></div>
      </div>
    </div>
  );
};
