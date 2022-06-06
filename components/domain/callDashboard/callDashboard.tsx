import React, { useEffect, useState } from 'react';
import { Button } from '../../core/button/Button';
import styles from './callDashboard.module.scss';
import ReactDOM from 'react-dom';
import createContainer from '../../core/notifications/createContainer/createContainer';
import { Icon } from '../../core/icon/Icon';
import { IconType } from '../../../utils/icons/types';

const container = createContainer();

interface Props {
  id: string;
  onMute: () => void;
  onEnd: () => void;
  icon: IconType;
}

export const CallDashboard: React.FC<Props> = (props) => {
  const { id, onMute, onEnd, icon } = props;
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);

  useEffect(() => {
    const timerVariable = setInterval(countUpTimer, 1000);
    return () => {
      clearInterval(timerVariable);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSeconds]);

  if (!container) {
    return null;
  }

  return ReactDOM.createPortal(
    <div className={styles.container}>
      <div className={styles.contentContainer}>
        <div className={styles.iconWrapper}>
          <div className={styles.iconContainer}>
            <Icon icon={icon} />
          </div>
        </div>
        <div className={styles.metaData}>
          <div className={styles.titleContainer}>
            <p>{id}</p>
            <p>{`${minutes}:${seconds}`}</p>
          </div>
          <div className={styles.audioVisualizer}>Some visualizer</div>
        </div>
      </div>
      <div className={styles.buttonContainer}>
        <Button
          text={'Mute'}
          className={styles.button}
          onClick={() => onMute()}
        />
        <Button
          text={'End'}
          className={styles.button}
          onClick={() => onEnd()}
        />
      </div>
    </div>,
    container
  );

  function countUpTimer() {
    setTotalSeconds((v) => v + 1);
    const hour = Math.floor(totalSeconds / 3600);
    const minute = Math.floor((totalSeconds - hour * 3600) / 60);
    const seconds = totalSeconds - (hour * 3600 + minute * 60);

    setMinutes(minute);
    setSeconds(seconds);
  }
};
