import { useEffect, useState } from 'react';

export const useDeviceCheck = () => {
  const [isMobile, setIsMobile] = useState<boolean>();
  const [isTablet, setIsTablet] = useState<boolean>();
  const [isDesktop, setIsDesktop] = useState<boolean>();

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isTablet =
      /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(
        userAgent
      );
    const isMobile = handleIsMobile();

    setIsTablet(isTablet);
    setIsMobile(isMobile);
  }, []);

  return [isMobile, isTablet, isDesktop];

  function handleIsMobile() {
    let hasTouchScreen = false;

    if ('maxTouchPoints' in navigator) {
      hasTouchScreen = navigator.maxTouchPoints > 0;
    } else if ('msMaxTouchPoints' in navigator) {
      hasTouchScreen = (navigator as any).msMaxTouchPoints > 0;
    } else {
      var mQ = (window as any).matchMedia && matchMedia('(pointer:coarse)');
      if (mQ && mQ.media === '(pointer:coarse)') {
        hasTouchScreen = !!mQ.matches;
      } else if ('orientation' in window) {
        hasTouchScreen = true; // deprecated, but good fallback
      } else {
        // Only as a last resort, fall back to user agent sniffing
        var UA = navigator.userAgent;
        hasTouchScreen =
          /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) ||
          /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA);
      }
    }

    return hasTouchScreen;
  }
};
