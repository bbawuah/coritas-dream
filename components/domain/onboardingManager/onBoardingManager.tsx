import React, { CSSProperties, useEffect, useState } from 'react';
import { IconType } from '../../../utils/icons/types';
import { Onboarding } from '../onboarding/Onboarding';
import {
  useTransition,
  useSpringRef,
} from '@react-spring/web';
import { animated } from '@react-spring/web';
import type { AnimatedProps } from '@react-spring/web';
import styles from './onBoarding.module.scss';

// Type assertion for animated.div due to react-spring types compatibility with React 19
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AnimatedDiv = (animated as any).div as React.ComponentType<{ children?: React.ReactNode; style?: any; key?: string }>;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const onboardingData: ((
    props: AnimatedProps<{ style: CSSProperties }>
  ) => React.ReactElement)[] = [
    ({ style }) => (
      <AnimatedDiv style={{ ...style }} key={'keys'}>
        <Onboarding
          title={'Navigating'}
          message={'Use these keys to navigate'}
          icon={IconType.keys}
          isFirst={true}
          onBack={() => setIndex((v) => v - 1)}
          onNext={() => setIndex((v) => v + 1)}
        />
      </AnimatedDiv>
    ),
    ({ style }) => (
      <AnimatedDiv style={{ ...style }} key={'mouse'}>
        <Onboarding
          title={'Navigating'}
          message={'Click and drag on the screen to look/turn around'}
          icon={IconType.mouse}
          onBack={() => setIndex((v) => v - 1)}
          onNext={() => setIndex((v) => v + 1)}
        />
      </AnimatedDiv>
    ),
    ({ style }) => (
      <AnimatedDiv style={{ ...style }} key={'settings'}>
        <Onboarding
          title={'Navigating'}
          message={'Use the settings menu to personalise your experience'}
          icon={IconType.settings}
          isLast={true}
          onBack={() => setIndex((v) => v - 1)}
          onNext={() => setIsVisible(false)}
        />
      </AnimatedDiv>
    ),
  ];

  return renderOnboarding();

  function renderOnboarding() {
    if (isVisible) {
      const jsx = transitions((style, i) => {
        const AnimatedOnboardingComponent = onboardingData[i];

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
