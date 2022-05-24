import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import styles from './Notifications.module.scss';
import createContainer from './createContainer/createContainer';
import ReactDOM from 'react-dom';

interface Props {
  types: NotificationTypes;
  isClosing: boolean;
  onDelete: () => void;
}

let timeToDelete = 300;

type NotificationTypes = 'info' | 'warning' | 'error' | 'success';

const container = createContainer();

export const Notifications: React.FC<Props> = (props) => {
  const { children, isClosing, onDelete, types } = props;
  const classes = classNames(styles.notification, {
    [styles.slideIn]: !isClosing,
    [styles.slideOut]: isClosing,
  });

  useEffect(() => {
    if (isClosing) {
      const timeoutId = setTimeout(onDelete, timeToDelete);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [isClosing, onDelete]);

  if (container) {
    return ReactDOM.createPortal(
      <div className={classes}>{children}</div>,
      container
    );
  }

  return null;
};
