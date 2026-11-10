import { useEffect, useRef } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import { useLaunchIntro } from '../hooks/useLaunchIntro.js';
import { useFooterDock } from '../hooks/useFooterDock.js';
import { appIconAction, dockVisible } from '../hooks/useHeroWindow.js';
import Dock from './Dock.jsx';

/**
 * Owns the dock and its moments:
 *  - launch intro on load (the hero window opens out of the app icon)
 *  - footer reprise (the dock rises; the app icon is "Back to top")
 *  - closed window (the red light closed it; the app icon re-opens it)
 */
export default function LaunchDock({ windowRef, windowClosed = false, onReopen }) {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const dockRef = useRef(null);
  const iconRef = useRef(null);
  const dotRef = useRef(null);

  useLaunchIntro({ windowRef, dockRef, iconRef, dotRef, reducedMotion: reduceMotion });
  const footer = useFooterDock({ windowRef, iconRef, reducedMotion: reduceMotion });

  const action = appIconAction({ closed: windowClosed });
  const docked = dockVisible({
    footerVisible: footer.footerVisible,
    returning: footer.returning,
    closed: windowClosed,
  });

  // closing from the keyboard: hand focus to the icon that brings it back
  useEffect(() => {
    if (!windowClosed) return;
    const win = windowRef.current;
    if (win && win.contains(document.activeElement)) {
      iconRef.current?.focus({ preventScroll: true });
    }
  }, [windowClosed, windowRef]);

  const handleAppClick = () => {
    if (action === 'reopen') onReopen?.(iconRef.current);
    else footer.backToTop();
  };

  return (
    <Dock
      ref={dockRef}
      iconRef={iconRef}
      dotRef={dotRef}
      docked={docked}
      onAppClick={handleAppClick}
      appLabel={action === 'reopen' ? 'Open window' : 'Back to top'}
    />
  );
}
