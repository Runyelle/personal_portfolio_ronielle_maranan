// Pure motion maths for draggable windows (see useDraggableWindow).
// Based on Apple's "Designing Fluid Interfaces" — rubber-banding, momentum
// projection and a damping-ratio / response spring.

const finite = (n, fallback = 0) => (Number.isFinite(n) ? n : fallback);

/** Clamp `v` into [min, max]; if the range is inverted (window bigger than the desk) pin to 0. */
export function clampRange(v, min, max) {
  if (min > max) return 0;
  return Math.min(max, Math.max(min, finite(v)));
}

/** Clamp an {x, y} offset into bounds {minX, maxX, minY, maxY}. */
export function clampToBounds(p, b) {
  return { x: clampRange(p.x, b.minX, b.maxX), y: clampRange(p.y, b.minY, b.maxY) };
}

/**
 * Apple's rubber-band: the further past an edge, the less the window follows.
 * Starts at c (0.55) of the overshoot, follows ever less, and tends to — never
 * reaches — `dimension`.
 */
export function rubberband(overshoot, dimension, c = 0.55) {
  const o = finite(overshoot);
  const d = Math.max(1, finite(dimension, 1));
  const sign = o < 0 ? -1 : 1;
  const a = Math.abs(o);
  return sign * ((a * d * c) / (d + c * a));
}

/** A raw (pointer-following) value, rubber-banded once it passes [min, max]. */
export function rubberbandRange(v, min, max, dimension) {
  if (min > max) return rubberband(v, dimension);
  if (v < min) return min - rubberband(min - v, dimension);
  if (v > max) return max + rubberband(v - max, dimension);
  return v;
}

/**
 * Apple's momentum projection: where a release velocity (px/s) carries the
 * value. 0.99 is a short, snappy deceleration — a flick can't hurl a window
 * across the desk.
 */
export function project(velocity, decelerationRate = 0.99) {
  return ((finite(velocity) / 1000) * decelerationRate) / (1 - decelerationRate);
}

/**
 * Release velocity (px/s) from a short position history of {t, v} samples
 * (t in ms). Uses only the last `windowMs`, so a pause before release reads
 * as a still pointer rather than an old flick.
 */
export function releaseVelocity(samples, windowMs = 100) {
  if (!Array.isArray(samples) || samples.length < 2) return 0;
  const last = samples[samples.length - 1];
  const recent = samples.filter((s) => last.t - s.t <= windowMs);
  const first = recent[0];
  const dt = last.t - first.t;
  if (!(dt > 0)) return 0;
  return ((last.v - first.v) / dt) * 1000;
}

/**
 * One step of a spring toward `target`, parameterised the way Apple designs
 * them: `damping` ratio (1 = critically damped, no overshoot) and `response`
 * (seconds — how quickly it gets there). Semi-implicit Euler, mass 1.
 */
export function springStep({ x, v }, target, dt, { damping = 1, response = 0.35 } = {}) {
  const k = ((2 * Math.PI) / response) ** 2;
  const c = (4 * Math.PI * damping) / response;
  const a = -k * (x - target) - c * v;
  const nv = v + a * dt;
  return { x: x + nv * dt, v: nv };
}

/** Has the spring come to rest at `target`? */
export function springSettled({ x, v }, target, eps = 0.1) {
  return Math.abs(x - target) < eps && Math.abs(v) < 5;
}
