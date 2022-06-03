/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { useStore } from '../../../store/store';
import { IconType } from '../../../utils/icons/types';
import { Icon } from '../icon/Icon';
import { Modal } from '../modal/modal';
import styles from './focusImage.module.scss';

export const FocusImage: React.FC = (props) => {
  const { focusImage, set } = useStore(({ focusImage, set }) => ({
    focusImage,
    set,
  }));

  if (!focusImage) {
    return null;
  }

  return (
    <Modal>
      <div className={styles.modalContainer}>
        <img className={styles.image} alt="focus" src={focusImage.src}></img>
        <div className={styles.contentContainer}>
          <div className={styles.headingContainer}>
            <h3>{focusImage.title}</h3>
            <div
              className={styles.iconContainer}
              onClick={() => {
                set((state) => ({ ...state, focusImage: undefined }));
              }}
            >
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
};
