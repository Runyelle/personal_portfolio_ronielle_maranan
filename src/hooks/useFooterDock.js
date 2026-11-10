import { useCallback, useEffect, useRef, useState } from 'react';
import { openWindowFromIcon } from './useLaunchIntro.js';

// give up on the smooth scroll home if it hasn't arrived by then
export const RETURN_TIMEOUT = 3000;

/**
 * Pure: where a "Back to top" trip stands.
 *  - 'open'  arrived at the top — open the window out of the icon
 *  - 'abort' took too long (the visitor scrolled away, or smooth scroll stalled)
 *  - 'wait'  still on the way
 */
export function returnPhase({ scrollY, elapsed, timeout = RETURN_TIMEOUT }) {
  if ((Number(scrollY) || 0) <= 1) return 'open';
  if (elapsed > timeout) return 'abort';
  return 'wait';
}

/**
 * The dock rises when the footer scrolls into view and hides when it leaves.
 * `backToTop()` (the app icon's click) scrolls home and re-opens the hero
 * window out of the icon, keeping the dock up for the trip. Any wheel / touch
 * / key input on the way cancels the replay and leaves the window visible.
 * With reduced motion it's a plain jump to the top.
 */
export function useFooterDock({ windowRef, iconRef, reducedMotion }) {
  const [footerVisible, setFooterVisible] = useState(false);
  const [returning, setReturning] = useState(false);
  const cancelRef = useRef(null);

  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting), {
      threshold: 0.25,
    });
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  // tear down a trip in progress on unmount
  useEffect(() => () => cancelRef.current?.(), []);

  const backToTop = useCallback(() => {
    const win = windowRef.current;
    if (reducedMotion || !win || typeof win.animate !== 'function') {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }
    cancelRef.current?.();

    setReturning(true);
    // hide the window for the trip so it can open out of the icon on arrival
    win.style.opacity = '0';
    const started = performance.now();
    let raf = 0;
    let anim = null;

    const events = ['wheel', 'touchstart', 'keydown'];
    const cleanup = () => {
      cancelAnimationFrame(raf);
      events.forEach((e) => window.removeEventListener(e, abort, true));
      cancelRef.current = null;
    };
    const restore = () => {
      win.style.opacity = '';
      setReturning(false);
    };
    function abort() {
      cleanup();
      anim?.cancel();
      restore();
    }
    events.forEach((e) => window.addEventListener(e, abort, { capture: true, passive: true }));
    cancelRef.current = abort;

    const tick = () => {
      const phase = returnPhase({ scrollY: window.scrollY, elapsed: performance.now() - started });
      if (phase === 'wait') {
        raf = requestAnimationFrame(tick);
        return;
      }
      if (phase === 'abort') {
        abort();
        return;
      }
      // arrived: open out of the icon, then let the dock drop away
      events.forEach((e) => window.removeEventListener(e, abort, true));
      anim = openWindowFromIcon(win, iconRef.current);
      win.style.opacity = ''; // the animation now owns opacity
      anim.finished.then(
        () => {
          cancelRef.current = null;
          setReturning(false);
        },
        () => {}
      );
      cancelRef.current = () => {
        anim.cancel();
        restore();
        cancelRef.current = null;
      };
    };

    window.scrollTo({ top: 0, behavior: 'smooth' });
    raf = requestAnimationFrame(tick);
  }, [windowRef, iconRef, reducedMotion]);

  return { docked: footerVisible || returning, footerVisible, returning, backToTop };
}

