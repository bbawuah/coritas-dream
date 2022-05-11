import React, { useState } from 'react';
import { IconType } from '../../../../utils/icons/types';
import { Icon } from '../../icon/Icon';
import styles from './SettingsButton.module.scss';
import classNames from 'classnames';

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  hovered: boolean;
  clicked: boolean;
}

export const SettingsButton: React.FC<Props> = (props) => {
  const { hovered, clicked, ...rest } = props;
  const classes = classNames(styles.menu, {
    [styles.clicked]: clicked,
  });

  return (
    <div className={classes} {...rest}>
      <Icon icon={IconType.settings} hovered={hovered} clicked={clicked} />
    </div>
  );
};
