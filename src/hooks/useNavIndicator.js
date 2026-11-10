import { useLayoutEffect } from 'react';

/**
 * Pure: x offset (px) that centres an indicator of `indicatorWidth` under a
 * link at `linkLeft` with `linkWidth`. Bad input reads as 0.
 */
export function indicatorX(linkLeft, linkWidth, indicatorWidth) {
  const n = (v) => (Number.isFinite(v) ? v : 0);
  return n(linkLeft) + n(linkWidth) / 2 - n(indicatorWidth) / 2;
}

/**
 * Moves one shared indicator element under the active link. It slides
 * between links (CSS transition on transform), but appears in place — no
 * slide in from the left edge — when it was previously hidden.
 * Re-measures on resize and once web fonts load (label widths change).
 */
export function useNavIndicator(navRef, indicatorRef, activeKey) {
  useLayoutEffect(() => {
    const nav = navRef.current;
    const ind = indicatorRef.current;
    if (!nav || !ind) return undefined;

    const place = (animate) => {
      const link = activeKey ? nav.querySelector(`[data-key="${activeKey}"]`) : null;
      if (!link) {
        ind.classList.remove('is-on');
        return;
      }
      const wasOn = ind.classList.contains('is-on');
      const x = indicatorX(link.offsetLeft, link.offsetWidth, ind.offsetWidth);
      if (!animate || !wasOn) {
        // jump into place without sliding
        ind.style.transition = 'none';
        ind.style.setProperty('--x', `${x}px`);
        void ind.offsetWidth; // flush so the jump isn't animated
        ind.style.transition = '';
      } else {
        ind.style.setProperty('--x', `${x}px`);
      }
      ind.classList.add('is-on');
    };

    place(true);
    const onResize = () => place(false);
    window.addEventListener('resize', onResize);
    let alive = true;
    document.fonts?.ready?.then(() => alive && place(false));
    return () => {
      alive = false;
      window.removeEventListener('resize', onResize);
    };
  }, [navRef, indicatorRef, activeKey]);
}
