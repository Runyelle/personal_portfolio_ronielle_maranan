import { describe, expect, it } from 'vitest';
import {
  clampRange,
  clampToBounds,
  project,
  releaseVelocity,
  rubberband,
  rubberbandRange,
  springSettled,
  springStep,
} from './windowPhysics.js';
import { raise } from './useWindowStack.js';

describe('clamping to the desk', () => {
  const b = { minX: -100, maxX: 200, minY: -50, maxY: 80 };
  it('keeps an offset inside the bounds', () => {
    expect(clampToBounds({ x: 500, y: -500 }, b)).toEqual({ x: 200, y: -50 });
    expect(clampToBounds({ x: 10, y: 10 }, b)).toEqual({ x: 10, y: 10 });
  });
  it('pins to 0 when the window is bigger than the desk', () => {
    expect(clampRange(40, 10, -10)).toBe(0);
  });
});

describe('rubberband', () => {
  it('always follows less than the raw overshoot', () => {
    for (const o of [5, 50, 500]) expect(rubberband(o, 800)).toBeLessThan(o);
  });
  it('never exceeds the dimension, however far you pull', () => {
    expect(rubberband(1e9, 800)).toBeLessThanOrEqual(800);
    expect(rubberband(100, 800)).toBeLessThan(100 * 0.55 + 1e-9);
  });
  it('is symmetric and zero at the edge', () => {
    expect(rubberband(-60, 800)).toBeCloseTo(-rubberband(60, 800));
    expect(rubberband(0, 800)).toBe(0);
  });
  it('only resists past the range', () => {
    expect(rubberbandRange(50, 0, 100, 800)).toBe(50);
    const past = rubberbandRange(160, 0, 100, 800);
    expect(past).toBeGreaterThan(100);
    expect(past).toBeLessThan(160);
    expect(rubberbandRange(-60, 0, 100, 800)).toBeGreaterThan(-60);
  });
});

describe('project (momentum)', () => {
  it('carries further the faster the flick, in its direction', () => {
    expect(project(1000)).toBeCloseTo(99);
    expect(project(-1000)).toBeCloseTo(-99);
    expect(project(2000)).toBeGreaterThan(project(1000));
    expect(project(0)).toBe(0);
  });
});

describe('releaseVelocity', () => {
  it('measures px/s over the recent samples', () => {
    const s = [
      { t: 0, v: 0 },
      { t: 50, v: 25 },
      { t: 100, v: 50 },
    ];
    expect(releaseVelocity(s)).toBeCloseTo(500);
  });
  it('ignores samples older than the window (a pause reads as still)', () => {
    const s = [
      { t: 0, v: 0 },
      { t: 20, v: 200 },
      { t: 400, v: 200 },
    ];
    expect(releaseVelocity(s)).toBe(0);
  });
  it('is 0 without enough samples', () => {
    expect(releaseVelocity([{ t: 0, v: 3 }])).toBe(0);
    expect(releaseVelocity(null)).toBe(0);
  });
});

describe('springStep', () => {
  const run = (state, target, params, steps = 2000) => {
    let s = state;
    let peak = s.x;
    for (let i = 0; i < steps; i += 1) {
      s = springStep(s, target, 1 / 240, params);
      peak = Math.max(peak, s.x);
    }
    return { s, peak };
  };
  it('settles on the target', () => {
    const { s } = run({ x: 0, v: 0 }, 100, { damping: 1, response: 0.35 });
    expect(springSettled(s, 100)).toBe(true);
  });
  it('critically damped: no overshoot from rest', () => {
    const { peak } = run({ x: 0, v: 0 }, 100, { damping: 1, response: 0.35 });
    expect(peak).toBeLessThanOrEqual(100.01);
  });
  it('under-damped (after a flick): overshoots a little, then settles', () => {
    const { s, peak } = run({ x: 0, v: 0 }, 100, { damping: 0.8, response: 0.35 });
    expect(peak).toBeGreaterThan(100);
    expect(peak).toBeLessThan(105);
    expect(springSettled(s, 100)).toBe(true);
  });
});

describe('raise (window stack)', () => {
  it('moves a window to the front, keeping the others in order', () => {
    expect(raise(['a', 'b', 'c'], 'a')).toEqual(['b', 'c', 'a']);
  });
  it('is a no-op for the front window or an unknown id', () => {
    const o = ['a', 'b'];
    expect(raise(o, 'b')).toBe(o);
    expect(raise(o, 'z')).toBe(o);
  });
});

import { HOME_RATIO, shouldGlideHome, shouldResetStack } from './useWindowStack.js';

describe('scrolling away sends the windows home', () => {
  it('glides home once, as the desk crosses below the threshold', () => {
    expect(shouldGlideHome({ wasRatio: 1, ratio: 0.5 })).toBe(true);
    expect(shouldGlideHome({ wasRatio: HOME_RATIO, ratio: HOME_RATIO - 0.01 })).toBe(true);
  });
  it('does not fire again while it keeps leaving, or while coming back', () => {
    expect(shouldGlideHome({ wasRatio: 0.5, ratio: 0.2 })).toBe(false);
    expect(shouldGlideHome({ wasRatio: 0.2, ratio: 0.9 })).toBe(false);
    expect(shouldGlideHome({ wasRatio: 1, ratio: 0.8 })).toBe(false);
  });
  it('resets the stacking order only when the desk goes fully off screen', () => {
    expect(shouldResetStack({ wasVisible: true, isVisible: false })).toBe(true);
    expect(shouldResetStack({ wasVisible: true, isVisible: true })).toBe(false);
    expect(shouldResetStack({ wasVisible: false, isVisible: false })).toBe(false);
  });
});
