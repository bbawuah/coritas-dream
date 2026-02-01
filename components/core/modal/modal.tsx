import React from 'react';
import ReactDOM from 'react-dom';
import createContainer from './createContainer/createContainer';
import styles from './modal.module.scss';

interface Props {
  children?: React.ReactNode;
}

const container = createContainer();

export const Modal: React.FC<Props> = (props) => {
  const { children } = props;

  if (container) {
    return ReactDOM.createPortal(
      <div className={styles.container}>
        <div className={styles.contentContainer}>{children}</div>
      </div>,
      container
    );
  }

  return null;
};
