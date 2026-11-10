import { describe, expect, it } from 'vitest';
import {
  BEAM_MAX,
  BEAM_MIN,
  GOLD_MIN,
  beamGold,
  beamScale,
} from './useScrollTint.js';

describe('beamGold', () => {
  it('is dim at the top and bottom of the page', () => {
    expect(beamGold(0)).toBeCloseTo(GOLD_MIN);
    expect(beamGold(1)).toBeCloseTo(GOLD_MIN);
  });

  it('is at full strength at the middle', () => {
    expect(beamGold(0.5)).toBeCloseTo(1);
  });

  it('is symmetric and tracks beamScale (bolder as it grows)', () => {
    for (let i = 1; i <= 100; i += 1) {
      const p = i / 100;
      const prev = (i - 1) / 100;
      expect(beamGold(p)).toBeCloseTo(beamGold(1 - p));
      // both rise together, then fall together
      expect(Math.sign(beamGold(p) - beamGold(prev))).toBe(
        Math.sign(beamScale(p) - beamScale(prev))
      );
    }
  });

  it('stays within [GOLD_MIN, 1] and clamps junk input', () => {
    for (let i = 0; i <= 100; i += 1) {
      const v = beamGold(i / 100);
      expect(v).toBeGreaterThanOrEqual(GOLD_MIN - 1e-9);
      expect(v).toBeLessThanOrEqual(1 + 1e-9);
    }
    expect(beamGold(-1)).toBeCloseTo(GOLD_MIN);
    expect(beamGold(5)).toBeCloseTo(GOLD_MIN);
    expect(beamGold(NaN)).toBeCloseTo(GOLD_MIN);
  });
});

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
