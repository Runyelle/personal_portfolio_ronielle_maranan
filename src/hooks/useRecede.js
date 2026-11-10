import { useEffect } from 'react';

// fraction of a viewport height of scroll over which the window fully recedes
export const RECEDE_SPAN = 0.8;

/**
 * Pure: how far the hero has receded (0 → 1) given its top edge relative to
 * the viewport. 0 at (or above) the top of the page, 1 once it has scrolled
 * RECEDE_SPAN viewports up, linear between. Clamped; bad input reads as 0.
 */
export function recedeProgress(top, viewport) {
  if (!(viewport > 0) || !Number.isFinite(top)) return 0;
  return Math.min(1, Math.max(0, -top / (RECEDE_SPAN * viewport)));
}

/**
 * Writes `--recede` (0 → 1) on `targetRef` as `sourceRef` scrolls away.
 * Reversible — scrolling back up returns it to 0. Throttled to one write per
 * animation frame; no React re-render. When disabled nothing is written, so
 * CSS falls back to `--recede: 0` (the window at rest).
 */
export function useRecede(sourceRef, targetRef, enabled = true) {
  useEffect(() => {
    const source = sourceRef.current;
    const target = targetRef.current;
    if (!source || !target || !enabled) return undefined;

    let frame = 0;
    let last = -1;

    const apply = () => {
      frame = 0;
      const p = recedeProgress(source.getBoundingClientRect().top, window.innerHeight);
      const r = Math.round(p * 1000) / 1000;
      if (r !== last) {
        last = r;
        target.style.setProperty('--recede', String(r));
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      target.style.removeProperty('--recede');
    };
  }, [sourceRef, targetRef, enabled]);
}
