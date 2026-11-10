import { useEffect } from 'react';

const clamp01 = (n) => Math.min(1, Math.max(0, Number.isFinite(n) ? n : 0));

// the reveal starts when the block's top reaches START of the viewport height
// and finishes when its centre reaches END — just below mid-screen, so the
// text is fully lit wherever it comes to rest centred (e.g. after a nav-link
// jump, which centres the section on the viewport)
export const START = 0.9;
export const END = 0.55;

/**
 * Pure: an element's viewport rect → reveal progress (0 → 1).
 * 0 until its top crosses START·viewport, 1 once its centre crosses
 * END·viewport, linear in between. Clamped; bad input reads as 0.
 */
export function scrollProgress(top, height, viewport) {
  if (!(viewport > 0)) return 0;
  const range = (START - END) * viewport + Math.max(0, height || 0) / 2;
  if (!(range > 0)) return 0;
  return clamp01((START * viewport - top) / range);
}

// how many words are mid-fade at once — a soft leading edge, not a hard cut
export const OVERLAP = 3;

/**
 * Pure: reveal progress → how lit word `index` of `total` is (0 → 1).
 * Words light in reading order with a soft OVERLAP-word leading edge.
 * Guarantees every word is 0 at progress 0 and 1 at progress 1.
 */
export function wordFill(progress, index, total) {
  if (!(total > 0)) return 1;
  const t = clamp01(progress) * (total + OVERLAP) - index;
  return clamp01(t / OVERLAP);
}

/**
 * Drives a scroll-lit text block: every `[data-word]` inside `ref` gets a
 * `--fill` custom property (0 → 1) as the block scrolls through the viewport.
 * Writes styles directly (no React re-render per frame), throttled to one
 * update per animation frame. Reversible — scrolling back up dims the words.
 *
 * When `enabled` is false nothing is written, so CSS falls back to fully lit.
 */
export function useScrollProgress(ref, enabled = true) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return undefined;

    const words = Array.from(el.querySelectorAll('[data-word]'));
    const last = new Array(words.length).fill(-1);
    let frame = 0;

    const apply = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const p = scrollProgress(rect.top, rect.height, window.innerHeight);
      words.forEach((word, i) => {
        // round so tiny scroll deltas don't trigger style writes
        const f = Math.round(wordFill(p, i, words.length) * 1000) / 1000;
        if (f !== last[i]) {
          last[i] = f;
          word.style.setProperty('--fill', String(f));
        }
      });
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
      // hand control back to CSS (fully lit)
      words.forEach((word) => word.style.removeProperty('--fill'));
    };
  }, [ref, enabled]);
}
