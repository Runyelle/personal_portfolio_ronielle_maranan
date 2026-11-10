import { describe, expect, it } from 'vitest';
import { RECEDE_SPAN, recedeProgress } from './useRecede.js';

describe('recedeProgress', () => {
  const vh = 1000;

  it('is 0 at the top of the page', () => {
    expect(recedeProgress(0, vh)).toBe(0);
    expect(recedeProgress(120, vh)).toBe(0);
  });

  it('is 1 once the hero has scrolled the full span', () => {
    expect(recedeProgress(-RECEDE_SPAN * vh, vh)).toBe(1);
    expect(recedeProgress(-5000, vh)).toBe(1);
  });

  it('grows linearly with scroll', () => {
    expect(recedeProgress((-RECEDE_SPAN * vh) / 2, vh)).toBeCloseTo(0.5);
    expect(recedeProgress(-100, vh)).toBeLessThan(recedeProgress(-200, vh));
  });

  it('treats bad input as at rest', () => {
    expect(recedeProgress(NaN, vh)).toBe(0);
    expect(recedeProgress(-100, 0)).toBe(0);
  });
});
