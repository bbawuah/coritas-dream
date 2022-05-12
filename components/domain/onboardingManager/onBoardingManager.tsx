import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import { IconType } from '../../../utils/icons/types';
import { Onboarding } from '../../core/onboarding/Onboarding';
import {
  useTransition,
  animated,
  AnimatedProps,
  useSpringRef,
  config,
} from '@react-spring/web';
import styles from './onBoarding.module.scss';

interface Props {}

export const OnboardingManager: React.FC<Props> = (props) => {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const transRef = useSpringRef();
  const transitions = useTransition(index, {
    ref: transRef,
    keys: null,
    from: { opacity: 0, transform: 'translate3d(-50%,30%,0)' },
    enter: { opacity: 1, transform: 'translate3d(-50%,0,0)' },
    leave: { opacity: 0.35, transform: 'translate3d(-50%,-10%,0)' },
  });

  useEffect(() => {
    transRef.start();
  }, [index]);

  const data: ((
    props: AnimatedProps<{ style: CSSProperties }>
  ) => JSX.Element)[] = [
    ({ style }) => (
      <animated.div style={{ ...style }} key={'keys'}>
        <Onboarding
          title={'Navigating'}
          message={'Use these keys to navigate'}
          icon={IconType.keys}
          isFirst={true}
          onBack={() => setIndex((v) => v - 1)}
          onNext={() => setIndex((v) => v + 1)}
        />
      </animated.div>
    ),
    ({ style }) => (
      <animated.div style={{ ...style }} key={'mouse'}>
        <Onboarding
          title={'Navigating'}
          message={'Click and drag on the screen to look/turn around'}
          icon={IconType.mouse}
          onBack={() => setIndex((v) => v - 1)}
          onNext={() => setIndex((v) => v + 1)}
        />
      </animated.div>
    ),
    ({ style }) => (
      <animated.div style={{ ...style }} key={'settings'}>
        <Onboarding
          title={'Navigating'}
          message={'Use the settings menu to personalise your experience'}
          icon={IconType.settings}
          isLast={true}
          onBack={() => setIndex((v) => v - 1)}
          onNext={() => setIsVisible(false)}
        />
      </animated.div>
    ),
  ];

  return renderOnboarding();

  function renderOnboarding() {
    if (isVisible) {
      const jsx = transitions((style, i) => {
        const AnimatedOnboardingComponent = data[i];

        return (
          <div className={styles.container}>
            <AnimatedOnboardingComponent style={style} />
          </div>
        );
      });

      return jsx;
    }

    return null;
  }
};
