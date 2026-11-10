import { useCallback, useEffect, useRef, useState } from 'react';

// play-through pacing: hold each phrase, then flip to the next
export const CUBE_HOLD = 1100; // ms a face rests before flipping
export const CUBE_FLIP = 550; // ms per flip (matches TextCube.css)
export const CUBE_FIRST = 600; // ms after scroll-in before the first flip

/** Pure: cube rotation (deg) for a step. Steps only grow, so it always flips forward. */
export function cubeAngle(step) {
  return -90 * (Number.isFinite(step) ? step : 0);
}

/** Pure: which face (0-based) is showing at `step` for an `n`-face cube. */
export function faceAt(step, n) {
  if (!(n > 0)) return 0;
  const s = Number.isFinite(step) ? Math.trunc(step) : 0;
  return ((s % n) + n) % n;
}

/**
 * Drives a TextCube: once the element is mostly on screen it flips through
 * every face once and comes to rest on the first; `next()` (e.g. on hover)
 * flips forward one face and cancels any play-through in progress.
 * With reduced motion it never moves.
 */
export function useTextCube(ref, faces, reducedMotion) {
  const [step, setStep] = useState(0);
  const timers = useRef([]);

  const stopPlay = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        for (let k = 1; k <= faces; k += 1) {
          timers.current.push(
            setTimeout(() => setStep((s) => s + 1), CUBE_FIRST + (k - 1) * (CUBE_HOLD + CUBE_FLIP))
          );
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      stopPlay();
    };
  }, [ref, faces, reducedMotion]);

  const next = useCallback(() => {
    if (reducedMotion) return;
    stopPlay();
    setStep((s) => s + 1);
  }, [reducedMotion]);

  return [step, next];
}
