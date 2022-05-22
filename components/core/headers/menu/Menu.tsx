import { Room } from 'colyseus.js';
import { useRouter } from 'next/router';
import React from 'react';
import { client } from '../../../../utils/supabase';
import styles from './Menu.module.scss';

interface Props {
  room: Room;
}

export const Menu: React.FC<Props> = (props) => {
  const { room } = props;
  const router = useRouter();

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

        <button onClick={handleLogout} className={styles.logOutButton}>
          Log out
        </button>
      </div>
    </div>
  );

  async function handleLogout() {
    await client.auth.signOut();
    room.leave();
    router.replace('/');
  }
};
