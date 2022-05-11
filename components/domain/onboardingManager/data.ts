import { IconType } from '../../../utils/icons/types';
import { OnboardingData } from './types';

export const onboardingData: OnboardingData[] = [
  {
    title: 'Navigating',
    icon: IconType.keys,
    message: 'Use these keys to navigate',
    isFirst: true,
  },
  {
    title: 'Navigating',
    icon: IconType.mouse,
    message: 'Click and drag on the screen to look/turn around',
  },
  {
    title: 'Settings',
    icon: IconType.settings,
    message: 'Use the settings menu to personalise your experience',
    isLast: true,
  },
];
