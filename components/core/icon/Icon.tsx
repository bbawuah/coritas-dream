import React from 'react';
import { IconType } from '../../../utils/icons/types';
import icons from '../../../utils/icons/icons.json';
import classNames from 'classnames';
import styles from './Icon.module.scss';

interface Props {
  icon: IconType;
  size?: 'small' | 'medium' | 'large'; //Should actually do something with this
  hovered?: boolean;
  clicked?: boolean;
  className?: string;
}

export const Icon: React.FC<Props> = (props) => {
  const { icon, size, hovered, clicked, className } = props;
  const classes = classNames(styles.icon, className, {
    [styles.medium]: size === 'medium',
    [styles.small]: size === 'small',
    [styles.large]: size === 'large',
    [styles.hovered]: hovered === true,
    [styles.hovered]: clicked === true,
  });

  return (
    <i className={classes} dangerouslySetInnerHTML={{ __html: icons[icon] }} />
  );
};
