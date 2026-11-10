import { describe, expect, it } from 'vitest';
import { indicatorX } from './useNavIndicator.js';
import { staggerDelay } from './stagger.js';
import { CUBE_FIRST, CUBE_FLIP, CUBE_HOLD, cubeAngle, faceAt } from './useTextCube.js';
import { magnetOffset } from './useMagnet.js';
import { shouldCycleShots } from './showcaseShots.js';
import { RETURN_TIMEOUT, returnPhase } from './useFooterDock.js';

describe('indicatorX (#2 nav underline)', () => {
  it('centres the indicator under the link', () => {
    expect(indicatorX(100, 60, 14)).toBe(123);
  });
  it('treats bad input as 0', () => {
    expect(indicatorX(NaN, undefined, 14)).toBe(-7);
  });
});

describe('staggerDelay (#3 work rows)', () => {
  it('spaces items 40ms apart', () => {
    expect([0, 1, 2, 3].map((i) => staggerDelay(i))).toEqual([0, 40, 80, 120]);
  });
  it('caps the total wait at 200ms', () => {
    expect(staggerDelay(5)).toBe(200);
    expect(staggerDelay(50)).toBe(200);
  });
  it('treats bad input as the first item', () => {
    expect(staggerDelay(-3)).toBe(0);
    expect(staggerDelay(NaN)).toBe(0);
  });
});

describe('text cube (#4)', () => {
  it('rotates -90deg per step, always forward', () => {
    expect(cubeAngle(0)).toBe(-0);
    expect(cubeAngle(1)).toBe(-90);
    expect(cubeAngle(5)).toBe(-450);
  });
  it('wraps faces after the last one', () => {
    expect([0, 1, 2, 3, 4, 5].map((s) => faceAt(s, 4))).toEqual([0, 1, 2, 3, 0, 1]);
  });
  it('a full play-through (n flips) rests on the first face, "Get in touch"', () => {
    expect(faceAt(4, 4)).toBe(0);
  });
  it('handles bad input', () => {
    expect(faceAt(3, 0)).toBe(0);
    expect(faceAt(-1, 4)).toBe(3);
    expect(cubeAngle(NaN)).toBe(-0);
  });
  it('holds each phrase longer than it takes to flip', () => {
    expect(CUBE_HOLD).toBeGreaterThan(CUBE_FLIP);
    expect(CUBE_FIRST).toBeGreaterThan(0);
  });
});

describe('magnetOffset (#5)', () => {
  const rect = { left: 0, top: 0, width: 132, height: 132 }; // centre 66,66

  it('is zero at the centre', () => {
    expect(magnetOffset(66, 66, rect)).toEqual({ x: 0, y: 0 });
  });
  it('leans toward the pointer', () => {
    const { x, y } = magnetOffset(76, 56, rect);
    expect(x).toBeGreaterThan(0);
    expect(y).toBeLessThan(0);
  });
  it('never leans more than 6px', () => {
    const { x, y } = magnetOffset(132, 132, rect);
    expect(Math.hypot(x, y)).toBeCloseTo(6);
    const far = magnetOffset(5000, -5000, rect);
    expect(Math.hypot(far.x, far.y)).toBeLessThanOrEqual(6 + 1e-9);
  });
  it('stays put for bad input', () => {
    expect(magnetOffset(NaN, 0, rect)).toEqual({ x: 0, y: 0 });
    expect(magnetOffset(10, 10, null)).toEqual({ x: 0, y: 0 });
  });
});

describe('shouldCycleShots (#8)', () => {
  it('cycles only when hovered, on screen and with several shots', () => {
    expect(shouldCycleShots({ over: true, visible: true, count: 3 })).toBe(true);
  });
  it('holds still otherwise', () => {
    expect(shouldCycleShots({ over: false, visible: true, count: 3 })).toBe(false);
    expect(shouldCycleShots({ over: true, visible: false, count: 3 })).toBe(false);
    expect(shouldCycleShots({ over: true, visible: true, count: 1 })).toBe(false);
  });
});

describe('returnPhase (#7 back to top)', () => {
  it('opens the window once home', () => {
    expect(returnPhase({ scrollY: 0, elapsed: 400 })).toBe('open');
    expect(returnPhase({ scrollY: 1, elapsed: 400 })).toBe('open');
  });
  it('waits while still scrolling', () => {
    expect(returnPhase({ scrollY: 800, elapsed: 400 })).toBe('wait');
  });
  it('gives up after the timeout', () => {
    expect(returnPhase({ scrollY: 800, elapsed: RETURN_TIMEOUT + 1 })).toBe('abort');
  });
  it('arriving wins even if late', () => {
    expect(returnPhase({ scrollY: 0, elapsed: RETURN_TIMEOUT + 1 })).toBe('open');
  });
});
