import React, { useState } from 'react';
import { Onboarding } from '../../core/onboarding/Onboarding';
import { onboardingData } from './data';

interface Props {}

export const OnboardingManager: React.FC<Props> = (props) => {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const {} = props;
  const data = onboardingData;

  return renderOnboarding();

  function renderOnboarding() {
    if (isVisible) {
      return (
        <Onboarding
          title={onboardingData[index].title}
          message={onboardingData[index].message}
          icon={onboardingData[index].icon}
          isFirst={onboardingData[index].isFirst}
          isLast={onboardingData[index].isLast}
          onNext={handleOnNext}
          onBack={handleOnBack}
        />
      );
    }

    return null;
  }

  function handleOnNext() {
    if (onboardingData[index].isLast) {
      setIsVisible(false);
      return;
    }

    setIndex((v) => v + 1);
  }

  function handleOnBack() {
    setIndex((v) => v - 1);
  }
};
