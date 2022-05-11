import React from 'react';
import { IconType } from '../../../utils/icons/types';
import { Button } from '../button/Button';
import { Icon } from '../icon/Icon';
import styles from './Onboarding.module.scss';

interface Props {
  title: string;
  message: string;
  icon?: IconType;
  isFirst?: boolean;
  isLast?: boolean;
  onNext?: () => void;
  onBack?: () => void;
}

export const Onboarding: React.FC<Props> = (props) => {
  const { title, message, icon, isFirst, isLast, onNext, onBack } = props;
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.leftContainer}>{renderIcon()}</div>
        <div className={styles.rightContainer}>
          <p className={styles.onboardingTitle}>{title}</p>
          <p className={styles.message}>{message}</p>
          {renderButtons()}
        </div>
      </div>
    </div>
  );

  function renderIcon() {
    if (icon) {
      return (
        <div className={styles.iconContainer}>
          <Icon icon={icon} />
        </div>
      );
    }
  }

  function renderButtons() {
    if (isFirst) {
      return (
        <div className={styles.singleButtonContainer}>
          <Button text="Next" onClick={onNext} />
        </div>
      );
    } else if (isLast) {
      return (
        <div className={styles.buttonContainer}>
          <Button text="Back" onClick={onBack} />
          <Button text="Done" onClick={onNext} />
        </div>
      );
    }

    return (
      <div className={styles.buttonContainer}>
        <Button text="Back" onClick={onBack} />
        <Button text="Next" onClick={onNext} />
      </div>
    );
  }
};
