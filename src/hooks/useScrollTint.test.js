import { describe, expect, it } from 'vitest';
import { BEAM_MAX, BEAM_MIN, beamScale } from './useScrollTint.js';

describe('beamScale', () => {
  it('starts as a small glow at the top of the page', () => {
    expect(beamScale(0)).toBeCloseTo(BEAM_MIN);
  });

  it('reaches full size at the bottom of the page', () => {
    expect(beamScale(1)).toBeCloseTo(BEAM_MAX);
  });

  it('clamps out-of-range and junk input', () => {
    expect(beamScale(-0.5)).toBeCloseTo(BEAM_MIN);
    expect(beamScale(2)).toBeCloseTo(BEAM_MAX);
    expect(beamScale(NaN)).toBeCloseTo(BEAM_MIN);
    expect(beamScale(undefined)).toBeCloseTo(BEAM_MIN);
  });

  it('grows monotonically with scroll', () => {
    let prev = beamScale(0);
    for (let i = 1; i <= 100; i += 1) {
      const next = beamScale(i / 100);
      expect(next).toBeGreaterThan(prev);
      prev = next;
    }
  });

  it('eases out — the first half of the page does most of the growing', () => {
    const half = beamScale(0.5);
    expect(half - BEAM_MIN).toBeGreaterThan((BEAM_MAX - BEAM_MIN) / 2);
  });
});
