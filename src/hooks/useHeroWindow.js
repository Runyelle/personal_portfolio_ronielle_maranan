import { useCallback, useEffect, useRef, useState } from 'react';
import { useMediaQuery } from './useMediaQuery.js';
import { openWindowFromIcon } from './useLaunchIntro.js';

/** Pure: should the dock be up? At the footer, during a back-to-top trip, or while the window is closed. */
export function dockVisible({ footerVisible, returning, closed }) {
  return Boolean(footerVisible || returning || closed);
}

/** Pure: what the dock's app icon does — re-open a closed window, otherwise take you home. */
export function appIconAction({ closed }) {
  return closed ? 'reopen' : 'backToTop';
}

/**
 * Pure: should a closed window quietly come back? Once the hero has scrolled
 * fully off the top, so the dock doesn't sit over every section below.
 */
export function shouldRestore({ closed, heroBottom }) {
  return Boolean(closed) && Number.isFinite(heroBottom) && heroBottom <= 0;
}

/**
 * Open / closed state of the hero window, shared by Hero (red close button)
 * and the dock (re-open from the app icon).
 *  - close():       macOS-style close — a slight shrink + fade (~0.2s); the
 *                   window keeps its space, then is hidden (incl. from AT)
 *  - reopen(icon):  the window opens out of the dock icon, then the dock drops
 *  - scroll-away:   a closed window silently restores once the hero is off screen
 */
export function useHeroWindow(windowRef) {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [closed, setClosed] = useState(false);
  const closeBtnRef = useRef(null);
  const anim = useRef(null);

  const stopAnim = () => {
    anim.current?.cancel();
    anim.current = null;
  };

  const restoreNow = useCallback(() => {
    const win = windowRef.current;
    stopAnim();
    win?.classList.remove('is-closing', 'is-closed');
    setClosed(false);
  }, [windowRef]);

  const close = useCallback(() => {
    const win = windowRef.current;
    if (!win || closed) return;
    stopAnim();
    setClosed(true); // the dock rises in step with the close
    win.classList.add('is-closing');
    const hide = () => {
      win.classList.remove('is-closing');
      win.classList.add('is-closed');
      stopAnim();
    };
    if (typeof win.animate !== 'function') {
      hide();
      return;
    }
    const from = getComputedStyle(win).opacity;
    anim.current = win.animate(
      reduceMotion
        ? [{ opacity: from }, { opacity: 0 }]
        : [
            { transform: 'scale(1)', opacity: from },
            { transform: 'scale(0.94)', opacity: 0 },
          ],
      { duration: reduceMotion ? 150 : 200, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' }
    );
    anim.current.finished.then(hide, () => {});
  }, [windowRef, closed, reduceMotion]);

  const reopen = useCallback(
    (icon) => {
      const win = windowRef.current;
      if (!win) return;
      const iconHadFocus = icon && document.activeElement === icon;
      stopAnim();
      win.classList.remove('is-closing', 'is-closed');
      if (typeof win.animate !== 'function') {
        setClosed(false);
        return;
      }
      // keep the dock up (closed stays true) until the window has opened
      anim.current = reduceMotion
        ? win.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150 })
        : openWindowFromIcon(win, icon);
      anim.current.finished.then(() => {
        anim.current = null;
        setClosed(false);
        if (iconHadFocus) closeBtnRef.current?.focus({ preventScroll: true });
      }, () => {});
    },
    [windowRef, reduceMotion]
  );

  // restore once the hero is scrolled away, so the dock doesn't linger
  useEffect(() => {
    if (!closed) return undefined;
    let frame = 0;
    const check = () => {
      frame = 0;
      const win = windowRef.current;
      if (win && shouldRestore({ closed: true, heroBottom: win.getBoundingClientRect().bottom })) {
        restoreNow();
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, [closed, windowRef, restoreNow]);

  useEffect(() => () => stopAnim(), []);

  return { closed, close, reopen, closeBtnRef };
}
