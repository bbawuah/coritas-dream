import React from 'react';
import className from 'classnames';
import styles from './Button.module.scss';

interface Props
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  text: string;
}

export const Button: React.FC<Props> = (props) => {
  const { text, ...rest } = props;
  const classes = className(styles.button);

  return (
    <button className={styles.button} {...rest}>
      {text}
    </button>
  );
};
