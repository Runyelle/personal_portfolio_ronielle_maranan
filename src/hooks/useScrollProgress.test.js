import { describe, expect, it } from 'vitest';
import { END, START, scrollProgress, wordFill } from './useScrollProgress.js';

describe('scrollProgress', () => {
  const vh = 1000;
  const h = 400;

  it('is 0 before the block reaches the start line', () => {
    expect(scrollProgress(vh, h, vh)).toBe(0);
    expect(scrollProgress(START * vh, h, vh)).toBe(0);
  });

  it('is 1 once the block centre passes the end line', () => {
    expect(scrollProgress(END * vh - h / 2, h, vh)).toBe(1);
    expect(scrollProgress(-5000, h, vh)).toBe(1);
  });

  it('is fully lit when the block rests centred on the viewport', () => {
    // nav-link jumps centre the section, so the text must be readable there
    expect(scrollProgress(vh / 2 - h / 2, h, vh)).toBe(1);
    // and on a tall phone-sized block too
    expect(scrollProgress(800 / 2 - 600 / 2, 600, 800)).toBe(1);
  });

  it('is linear in between', () => {
    const range = (START - END) * vh + h / 2;
    expect(scrollProgress(START * vh - range / 2, h, vh)).toBeCloseTo(0.5);
  });

  it('treats bad input as 0', () => {
    expect(scrollProgress(100, h, 0)).toBe(0);
    expect(scrollProgress(NaN, h, vh)).toBe(0);
    expect(scrollProgress(100, undefined, undefined)).toBe(0);
  });
});

describe('wordFill', () => {
  const total = 20;

  it('leaves every word dim at progress 0', () => {
    for (let i = 0; i < total; i += 1) expect(wordFill(0, i, total)).toBe(0);
  });

  it('lights every word fully at progress 1', () => {
    for (let i = 0; i < total; i += 1) expect(wordFill(1, i, total)).toBe(1);
  });

  it('lights words in reading order', () => {
    const fills = Array.from({ length: total }, (_, i) => wordFill(0.4, i, total));
    for (let i = 1; i < total; i += 1) expect(fills[i]).toBeLessThanOrEqual(fills[i - 1]);
    expect(fills[0]).toBeGreaterThan(fills[total - 1]);
  });

  it('stays within 0..1 for out-of-range progress', () => {
    expect(wordFill(-1, 0, total)).toBe(0);
    expect(wordFill(2, total - 1, total)).toBe(1);
  });

  it('is fully lit when there are no words to pace', () => {
    expect(wordFill(0, 0, 0)).toBe(1);
  });
});
