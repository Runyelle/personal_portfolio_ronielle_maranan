import { describe, expect, it } from 'vitest';
import { BEAM_MAX, BEAM_MIN, beamScale } from './useScrollTint.js';

describe('beamScale', () => {
  it('starts at the small size at the top of the page', () => {
    expect(beamScale(0)).toBeCloseTo(BEAM_MIN);
  });

  it('peaks at the middle of the page', () => {
    expect(beamScale(0.5)).toBeCloseTo(BEAM_MAX);
  });

  it('returns to the starting size at the bottom of the page', () => {
    expect(beamScale(1)).toBeCloseTo(BEAM_MIN);
  });

  it('caps the peak 30% below the previous full size of 1', () => {
    expect(BEAM_MAX).toBeCloseTo(0.7);
    for (let i = 0; i <= 100; i += 1) {
      expect(beamScale(i / 100)).toBeLessThanOrEqual(BEAM_MAX + 1e-9);
    }
  });

  it('is symmetric around the middle', () => {
    for (const p of [0.1, 0.25, 0.4]) {
      expect(beamScale(p)).toBeCloseTo(beamScale(1 - p));
    }
  });

  it('grows through the first half and shrinks through the second', () => {
    for (let i = 1; i <= 50; i += 1) {
      expect(beamScale(i / 100)).toBeGreaterThan(beamScale((i - 1) / 100));
    }
    for (let i = 51; i <= 100; i += 1) {
      expect(beamScale(i / 100)).toBeLessThan(beamScale((i - 1) / 100));
    }
  });

  it('clamps out-of-range and junk input', () => {
    expect(beamScale(-0.5)).toBeCloseTo(BEAM_MIN);
    expect(beamScale(2)).toBeCloseTo(BEAM_MIN);
    expect(beamScale(NaN)).toBeCloseTo(BEAM_MIN);
    expect(beamScale(undefined)).toBeCloseTo(BEAM_MIN);
  });
});
