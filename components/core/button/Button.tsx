import React from 'react';
import classNames from 'classnames';
import styles from './Button.module.scss';

interface Props
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  text: string;
  className?: string;
}

export const Button: React.FC<Props> = (props) => {
  const { text, className, ...rest } = props;
  const classes = classNames(styles.button, className);

  return (
    <button className={classes} {...rest}>
      {text}
    </button>
  );
};
