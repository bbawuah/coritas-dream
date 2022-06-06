import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import styles from './Notifications.module.scss';
import createContainer from './createContainer/createContainer';
import ReactDOM from 'react-dom';

interface Props {
  isSelfClosing?: boolean;
  onDelete?: () => void;
}

let timeToDelete = 1000;

const container = createContainer();

export const Notifications: React.FC<Props> = (props) => {
  const { children, isSelfClosing, onDelete } = props;
  // const [shouldClose, setShouldClose] = useState<boolean>(false);
  const classes = classNames(styles.notification, {
    [styles.slideIn]: isSelfClosing,
    // [styles.slideOut]: shouldClose,
  });

  useEffect(() => {
    if (isSelfClosing && onDelete) {
      const timeoutId = setTimeout(onDelete, timeToDelete);

      return () => {
        // setShouldClose(true);
        clearTimeout(timeoutId);
      };
    }
  }, [isSelfClosing, onDelete]);

  if (container) {
    return ReactDOM.createPortal(
      <div className={classes}>{children}</div>,
      container
    );
  }

  return null;
};
