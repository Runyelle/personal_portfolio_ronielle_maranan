import { useEffect, useRef, useState } from 'react';

/**
 * Mirrors the IntersectionObserver "reveal on scroll" behaviour from the
 * original HTML: once the element scrolls into view it stays revealed.
 */
export function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || revealed) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
          }
        });
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, revealed]);

  return [ref, revealed];
}
