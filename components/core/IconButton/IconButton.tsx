import React, { useState } from 'react';
import styles from './IconButton.module.scss';
import classNames from 'classnames';
import { Icon } from '../icon/Icon';
import { IconType } from '../../../utils/icons/types';

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  icon: IconType;
  color?: 'red' | 'black';
}

export const IconButton: React.FC<Props> = (props) => {
  const { icon, color = 'black', className, ...rest } = props;
  const classes = classNames(styles.button, className, {
    [styles.red]: color === 'red',
  });

  return (
    <button className={classes} {...rest}>
      <Icon icon={icon} />
    </button>
  );
};
