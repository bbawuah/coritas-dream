import { Room } from 'colyseus.js';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { IconType } from '../../../../utils/icons/types';
import { IconButton } from '../../IconButton/IconButton';
import styles from './settingsMenu.module.scss';
import { Menu } from '../menu/Menu';
import { useClient, useDelete, useSignOut } from 'react-supabase';

interface Props {
  room: Room;
}
export const SettingsMenu: React.FC<Props> = (props) => {
  const { room } = props;
  const [clicked, setClicked] = useState<boolean>(false);
  const router = useRouter();

  return (
    <>
      <IconButton
        className={styles.settingsButton}
        icon={IconType.settings}
        onClick={(e) => setClicked(!clicked)}
      />
      {renderMenu()}
    </>
  );

  function renderMenu() {
    if (!clicked) {
      return null;
    }

    return <Menu room={room} onLogout={() => handleLogout()} />;
  }

  // Not really a signout function tho but anyway
  async function handleLogout() {
    await room.leave();
    router.push('/');
  }
};
