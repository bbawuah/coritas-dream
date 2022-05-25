import { Room } from 'colyseus.js';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useSignOut } from 'react-supabase';
import { Menu } from '../menu/Menu';
import { SettingsButton } from '../settingsButton/SettingsButton';

export const SettingsMenu: React.FC = (props) => {
  const [hovered, setHovered] = useState<boolean>(false);
  const [clicked, setClicked] = useState<boolean>(false);
  const router = useRouter();

  return (
    <>
      <SettingsButton
        onMouseOver={(e) => setHovered(true)}
        onMouseLeave={(e) => setHovered(false)}
        onClick={(e) => setClicked(!clicked)}
        hovered={hovered}
        clicked={clicked}
      />
      {renderMenu()}
    </>
  );

  function renderMenu() {
    if (!clicked) {
      return null;
    }

    return <Menu onLogout={handleLogout} />;
  }

  function handleLogout() {
    router.push('/');
  }
};
