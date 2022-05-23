import { Room } from 'colyseus.js';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useSignOut } from 'react-supabase';
import { client } from '../../../../utils/supabase';
import styles from './Menu.module.scss';

interface Props {
  room: Room;
  onLogout: () => void;
}

export const Menu: React.FC<Props> = (props) => {
  const { room, onLogout } = props;

  return (
    <div className={styles.modal}>
      <div className={styles.menu}>
        <div className={styles.menuContainer}>
          <p className={styles.menuTitle}>Menu</p>
        </div>
        <div className={styles.menuContainer}>
          <p className={styles.menuItem}>Video</p>
          <button className={styles.button}>play video</button>
        </div>

        <button onClick={() => onLogout()} className={styles.logOutButton}>
          Log out
        </button>
      </div>
    </div>
  );
};
