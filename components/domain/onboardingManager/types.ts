import { IconType } from '../../../utils/icons/types';

export interface OnboardingData {
  title: string;
  icon?: IconType;
  message: string;
  isFirst?: boolean;
  isLast?: boolean;
}
