import React, { useRef } from 'react';
import { useOutsideAlerter } from '../../../hooks/useOutsideAlerter';
import { IconType } from '../../../utils/icons/types';
import { Icon } from '../../core/icon/Icon';
import { Modal } from '../../core/modal/modal';
import styles from './mutePlayer.module.scss';

interface Props {
  children?: React.ReactNode;
  shouldRender: boolean;
  onClickOutside: () => void;
}

export const MutePlayer: React.FC<Props> = (props) => {
  const { shouldRender, onClickOutside, children } = props;
  const ref = useRef<HTMLDivElement | null>(null);

  useOutsideAlerter(ref, () => onClickOutside());

  if (!shouldRender) {
    return null;
  }

  return (
    <Modal>
      <div ref={ref} className={styles.container}>
        {children}
      </div>
    </Modal>
  );
};
