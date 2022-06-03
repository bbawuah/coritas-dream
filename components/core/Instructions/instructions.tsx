/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { IconType } from '../../../utils/icons/types';
import { Icon } from '../icon/Icon';
import { Modal } from '../modal/modal';
import styles from './instructions.module.scss';

interface Props {
  shouldRenderInstructions: boolean;
  onClose: () => void;
}
export const Instructions: React.FC<Props> = (props) => {
  const { shouldRenderInstructions, onClose } = props;

  if (!shouldRenderInstructions) {
    return null;
  }
  return (
    <Modal>
      <div className={styles.instructionsContainer}>
        <div className={styles.instructionsHeadingContainer}>
          <div
            className={styles.instructionsCloseIconContainer}
            onClick={() => onClose()}
          >
            <Icon icon={IconType.close} />
          </div>
          <h3>Controls</h3>
        </div>
        <div className={styles.instructionsRowsContainer}>
          <div className={styles.instructionsRow}>
            <div className={styles.item}>
              <h4 className={styles.itemTitle}>Move</h4>
              <p>Use these keys to navigate</p>
              <div className={styles.itemColumn}>
                <img src={'./controls/keys-1.png'} alt={'keys'}></img>
                <p>or</p>
                <img src={'./controls/keys-2.png'} alt={'keys'}></img>
              </div>
            </div>
            <div className={styles.item}>
              <h4 className={styles.itemTitle}>Orbit Camera</h4>
              <p>Drag the screen to look around.</p>
              <img src={'./controls/orbit.png'} alt={'keys'}></img>
            </div>
          </div>
          <div className={styles.instructionsRow}>
            <div className={styles.item}>
              <h4 className={styles.itemTitle}>Voice call</h4>
              <p>Click on a player to start a voice call.</p>
              <img src={'./controls/player.png'} alt={'keys'}></img>
            </div>
            <div className={styles.item}>
              <h4 className={styles.itemTitle}>paintings</h4>
              <p>Click on painting to get more information.</p>
              <img src={'./controls/mini-painting.png'} alt={'keys'}></img>
            </div>
          </div>
          <div className={styles.instructionsRow}>
            <h4 className={styles.itemTitle}>Animations</h4>
            <div className={styles.animationsContainer}>
              <div>
                <p>Pray</p>
                <img src={'./controls/1.png'} alt={'controls'}></img>
              </div>
              <div>
                <p>Fist</p>

                <img src={'./controls/2.png'} alt={'controls'}></img>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
