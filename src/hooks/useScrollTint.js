import { useEffect } from 'react';

// sections that pin themselves and scroll sideways instead of down
const HOLD_SELECTOR = '[data-tint-hold]';

/**
 * Publishes `--gray-t` on :root — a 0 → 1 → 0 curve tracking scroll position.
 * Black at the top, most gray at the middle of the page, black again at the
 * bottom, easing in and out so the shift reads as gradual in both directions.
 *
 * Scroll spent inside a pinned horizontal section is removed from the curve,
 * so the background holds whatever value it had on entry and only resumes
 * once the section releases.
 */
export function useScrollTint() {
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;

    const apply = () => {
      frame = 0;
      const viewport = window.innerHeight;
      const y = window.scrollY;

      // `consumed` comes off the numerator (freezing the curve while pinned),
      // `pinned` off the denominator (so the curve still ends at 0 at the foot
      // of the page rather than short of it).
      let consumed = 0;
      let pinned = 0;
      for (const el of document.querySelectorAll(HOLD_SELECTOR)) {
        const start = el.getBoundingClientRect().top + y;
        const length = Math.max(0, el.offsetHeight - viewport);
        pinned += length;
        consumed += Math.min(Math.max(y - start, 0), length);
      }

      const scrollable = root.scrollHeight - viewport - pinned;
      const progress = scrollable > 0 ? (y - consumed) / scrollable : 0;
      const clamped = Math.min(1, Math.max(0, progress));
      // sin² — a smooth hump that eases away from black at both ends
      const gray = Math.sin(Math.PI * clamped) ** 2;
      root.style.setProperty('--gray-t', gray.toFixed(4));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);
}
