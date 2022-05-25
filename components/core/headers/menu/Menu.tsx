import { Room } from 'colyseus.js';
import React from 'react';
import { Button } from '../../button/Button';
import styles from './Menu.module.scss';

interface Props {
  onLogout: () => void;
}

export const Menu: React.FC<Props> = (props) => {
  const { onLogout } = props;

  return (
    <div className={styles.modal}>
      <div className={styles.menu}>
        <div className={styles.menuContainer}>
          <p className={styles.menuTitle}>Menu</p>
        </div>

        <Button
          onClick={() => onLogout()}
          className={styles.logOutButton}
          text={'Log out'}
        />
      </div>
    </div>
  );
};
