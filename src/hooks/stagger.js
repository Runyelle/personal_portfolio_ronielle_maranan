/**
 * Pure: entrance delay (ms) for item `index` in a staggered list —
 * `step` ms apart, capped so a long list never keeps the reader waiting.
 */
export function staggerDelay(index, step = 40, cap = 200) {
  const i = Number.isFinite(index) && index > 0 ? index : 0;
  return Math.min(i * step, cap);
}
