import React from 'react';
import styles from './Menu.module.scss';

const Modal: React.FC = (props) => {
  return <div className={styles.modal}>{props.children}</div>;
};

export const Menu: React.FC = () => {
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
      </div>
    </div>
  );
};
