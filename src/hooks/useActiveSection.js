import { useEffect, useState } from 'react';

/**
 * Pure: which section does the probe line fall inside?
 *
 * @param {{ id: string, top: number, bottom: number }[]} sections
 *   document-relative bounds, in page order
 * @param {number} probe  document-relative Y of the probe line
 * @param {boolean} atBottom  page is scrolled to its end — the last section
 *   wins even if it's too short to reach the probe line
 * @returns {string|null}
 */
export function pickActiveSection(sections, probe, atBottom = false) {
  if (!sections.length) return null;
  if (atBottom) return sections[sections.length - 1].id;
  const hit = sections.find((s) => probe >= s.top && probe < s.bottom);
  return hit ? hit.id : null;
}

/** Document-relative top, walked via offsetTop so the `.reveal` transform
 *  on a not-yet-revealed section doesn't skew the measurement. */
function documentTop(el) {
  let top = 0;
  for (let node = el; node; node = node.offsetParent) top += node.offsetTop;
  return top;
}

/**
 * Tracks which of the given section ids sits under the middle of the
 * viewport. Returns null over the hero, the Showcase, or anything else
 * that isn't in the list.
 */
export function useActiveSection(ids) {
  const [active, setActive] = useState(null);
  const key = ids.join('|');

  useEffect(() => {
    let frame = 0;

    const apply = () => {
      frame = 0;
      const sections = key
        .split('|')
        .map((id) => document.getElementById(id))
        .filter(Boolean)
        .map((el) => {
          const top = documentTop(el);
          return { id: el.id, top, bottom: top + el.offsetHeight };
        });
      const root = document.documentElement;
      const y = window.scrollY;
      const atBottom = y > 0 && y + window.innerHeight >= root.scrollHeight - 2;
      setActive(pickActiveSection(sections, y + window.innerHeight / 2, atBottom));
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
  }, [key]);

  return active;
}
