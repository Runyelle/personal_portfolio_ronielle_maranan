import { describe, expect, it } from 'vitest';
import { appIconAction, dockVisible, shouldRestore } from './useHeroWindow.js';

describe('dockVisible', () => {
  it('is hidden when the window is open and away from the footer', () => {
    expect(dockVisible({ footerVisible: false, returning: false, closed: false })).toBe(false);
  });

  it('shows for each reason on its own', () => {
    expect(dockVisible({ footerVisible: true, returning: false, closed: false })).toBe(true);
    expect(dockVisible({ footerVisible: false, returning: true, closed: false })).toBe(true);
    expect(dockVisible({ footerVisible: false, returning: false, closed: true })).toBe(true);
  });

  it('shows when reasons overlap (closed and at the footer)', () => {
    expect(dockVisible({ footerVisible: true, returning: false, closed: true })).toBe(true);
  });
});

describe('appIconAction', () => {
  it('re-opens a closed window', () => {
    expect(appIconAction({ closed: true })).toBe('reopen');
  });

  it('goes back to top otherwise', () => {
    expect(appIconAction({ closed: false })).toBe('backToTop');
  });
});

describe('shouldRestore', () => {
  it('restores a closed window once the hero is off the top', () => {
    expect(shouldRestore({ closed: true, heroBottom: 0 })).toBe(true);
    expect(shouldRestore({ closed: true, heroBottom: -200 })).toBe(true);
  });

  it('keeps it closed while any of the hero is on screen', () => {
    expect(shouldRestore({ closed: true, heroBottom: 40 })).toBe(false);
  });

  it('does nothing when the window is open or input is bad', () => {
    expect(shouldRestore({ closed: false, heroBottom: -200 })).toBe(false);
    expect(shouldRestore({ closed: true, heroBottom: NaN })).toBe(false);
  });
});
