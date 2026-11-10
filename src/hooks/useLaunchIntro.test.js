import { describe, expect, it } from 'vitest';
import { TIMELINE, launchTransform, shouldPlayIntro } from './useLaunchIntro.js';

describe('shouldPlayIntro', () => {
  it('launches on a fresh visit at the top of the page', () => {
    expect(shouldPlayIntro({ reducedMotion: false, seen: false, scrollY: 0 })).toBe('launch');
  });

  it('fades only when reduced motion is on', () => {
    expect(shouldPlayIntro({ reducedMotion: true, seen: false, scrollY: 0 })).toBe('fade');
  });

  it('skips once seen this session', () => {
    expect(shouldPlayIntro({ reducedMotion: false, seen: true, scrollY: 0 })).toBe('none');
    expect(shouldPlayIntro({ reducedMotion: true, seen: true, scrollY: 0 })).toBe('none');
  });

  it('skips when the page loads already scrolled down', () => {
    expect(shouldPlayIntro({ reducedMotion: false, seen: false, scrollY: 400 })).toBe('none');
  });

  it('treats missing scroll as the top', () => {
    expect(shouldPlayIntro({ reducedMotion: false, seen: false, scrollY: undefined })).toBe('launch');
  });
});

describe('launchTransform', () => {
  const win = { left: 100, top: 100, width: 1000, height: 600 };
  const icon = { left: 400, top: 900, width: 50, height: 50 };

  it('scales uniformly to the icon (limited by the tighter axis)', () => {
    expect(launchTransform(icon, win).scale).toBeCloseTo(0.05);
  });

  it('moves the window centre onto the icon centre', () => {
    const { x, y } = launchTransform(icon, win);
    expect(x).toBe(425 - 600);
    expect(y).toBe(925 - 400);
  });

  it('starts below-left of the window when the icon is there', () => {
    const { x, y } = launchTransform(icon, win);
    expect(x).toBeLessThan(0);
    expect(y).toBeGreaterThan(0);
  });

  it('returns null for unusable rects', () => {
    expect(launchTransform(null, win)).toBeNull();
    expect(launchTransform(icon, { ...win, width: 0 })).toBeNull();
  });
});

describe('TIMELINE', () => {
  it('runs dock in → click → open → dock out, in order', () => {
    const t = TIMELINE;
    expect(t.dockIn.at + t.dockIn.dur).toBeLessThan(t.press.at);
    expect(t.press.at).toBeLessThan(t.open.at);
    expect(t.open.at).toBeLessThan(t.dockOut.at);
  });

  it('finishes within about 2.5s', () => {
    const end = Math.max(...Object.values(TIMELINE).map((s) => s.at + s.dur));
    expect(end).toBeLessThanOrEqual(2600);
  });
});
