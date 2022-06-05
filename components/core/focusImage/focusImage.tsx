/* eslint-disable @next/next/no-img-element */
import React, { useRef } from 'react';
import { useOutsideAlerter } from '../../../hooks/useOutsideAlerter';
import { useStore } from '../../../store/store';
import { IconType } from '../../../utils/icons/types';
import { Icon } from '../icon/Icon';
import { Modal } from '../modal/modal';
import styles from './focusImage.module.scss';

export const FocusImage: React.FC = (props) => {
  const ref = useRef<HTMLDivElement>(null);
  const { focusImage, set } = useStore(({ focusImage, set }) => ({
    focusImage,
    set,
  }));
  useOutsideAlerter(ref, onClose);

  if (!focusImage) {
    return null;
  }

  return (
    <Modal>
      <div className={styles.modalContainer}>
        <img className={styles.image} alt="focus" src={focusImage.src}></img>
        <div ref={ref} className={styles.contentContainer}>
          <div className={styles.headingContainer}>
            <h3>{focusImage.title}</h3>
            <div className={styles.iconContainer} onClick={onClose}>
              <Icon icon={IconType.close} className={styles.icon} />
            </div>
          </div>
          <div className={styles.paragraphContainer}>
            {focusImage.isVisibleInMuseum ? (
              <p className={styles.inStedelijk}>
                Artwork now visible in the Stedelijk museum
              </p>
            ) : (
              <p className={styles.notInStedelijk}>
                Artwork is not visible in the Stedelijk museum
              </p>
            )}
            <p className={styles.paragraph}>{focusImage.description}</p>
          </div>
        </div>
      </div>
    </Modal>
  );

  function onClose() {
    set((state) => ({ ...state, focusImage: undefined }));
  }
};
