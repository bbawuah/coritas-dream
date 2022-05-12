import { IconType } from '../../../utils/icons/types';
import { Onboarding } from '../../core/onboarding/Onboarding';
import { OnboardingData } from './types';

export const onboardingData: JSX.Element[] = [
  <Onboarding
    title={'Navigating'}
    key={'keys'}
    message={'Use these keys to navigate'}
    icon={IconType.keys}
    isFirst={true}
  />,
  <Onboarding
    title={'Navigating'}
    key={'mouse'}
    message={'Click and drag on the screen to look/turn around'}
    icon={IconType.mouse}
  />,
  <Onboarding
    title={'Navigating'}
    key={'settings'}
    message={'Use the settings menu to personalise your experience'}
    icon={IconType.settings}
    isLast={true}
  />,
];
