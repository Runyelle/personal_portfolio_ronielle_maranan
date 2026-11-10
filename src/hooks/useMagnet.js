import { useEffect } from 'react';

/**
 * Pure: how far an element leans toward the pointer. A fraction (`strength`)
 * of the pointer's offset from the element centre, clamped to a `max`-px
 * radius so the target never drifts far enough to be hard to hit.
 */
export function magnetOffset(px, py, rect, max = 6, strength = 0.2) {
  if (!rect || !(rect.width > 0) || !(rect.height > 0)) return { x: 0, y: 0 };
  if (!Number.isFinite(px) || !Number.isFinite(py)) return { x: 0, y: 0 };
  let x = (px - (rect.left + rect.width / 2)) * strength;
  let y = (py - (rect.top + rect.height / 2)) * strength;
  const len = Math.hypot(x, y);
  if (len > max) {
    x = (x / len) * max;
    y = (y / len) * max;
  }
  return { x, y };
}

/**
 * Writes `--mx` / `--my` on the element as the pointer moves over it, and
 * resets them on leave. CSS applies them via the `translate` property, so
 * the lean composes with hover `scale` rather than overriding it.
 */
export function useMagnet(ref, enabled = true, max = 6) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return undefined;

    const move = (e) => {
      // measure without the current lean so it doesn't feed back on itself
      const r = el.getBoundingClientRect();
      const mx = parseFloat(el.style.getPropertyValue('--mx')) || 0;
      const my = parseFloat(el.style.getPropertyValue('--my')) || 0;
      const rect = { left: r.left - mx, top: r.top - my, width: r.width, height: r.height };
      const { x, y } = magnetOffset(e.clientX, e.clientY, rect, max);
      el.style.setProperty('--mx', `${x.toFixed(2)}px`);
      el.style.setProperty('--my', `${y.toFixed(2)}px`);
    };
    const leave = () => {
      el.style.setProperty('--mx', '0px');
      el.style.setProperty('--my', '0px');
    };

    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      el.style.removeProperty('--mx');
      el.style.removeProperty('--my');
    };
  }, [ref, enabled, max]);
}
