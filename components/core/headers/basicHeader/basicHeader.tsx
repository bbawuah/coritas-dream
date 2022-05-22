import Link from 'next/link';
import React from 'react';
import styles from './basicHeader.module.scss';

interface Props {
  showLogo: boolean;
}

export const Header: React.FC<Props> = (props) => {
  const { showLogo } = props;
  return <header className={styles.header}>{renderContent()}</header>;

  function renderContent() {
    if (showLogo) {
      return (
        <Link href="/">
          <a className={styles.logoLink}>Corita&apos;s dream</a>
        </Link>
      );
    }

    return (
      <p className={styles.headerText}>
        A thesis prototype for the Stedelijk museum Amsterdam
      </p>
    );
  }
};
