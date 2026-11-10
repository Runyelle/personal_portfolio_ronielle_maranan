import { useLayoutEffect } from 'react';

// sessionStorage key — the intro plays once per tab session
export const SEEN_KEY = 'hero-launch-seen';

// timeline (ms from mount)
export const TIMELINE = {
  dockIn: { at: 150, dur: 450 },
  press: { at: 1100, dur: 380 },
  dot: { at: 1300, dur: 160 },
  open: { at: 1500, dur: 560 },
  dockOut: { at: 2150, dur: 380 },
};

// decelerate hard and settle with no overshoot (critically damped feel)
export const SETTLE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const ACCEL = 'cubic-bezier(0.4, 0, 1, 1)';

/**
 * Pure: what intro to run.
 *  - 'none'   already seen this session, or the page loaded scrolled down
 *  - 'fade'   reduced motion: a short opacity fade, no dock, no zoom
 *  - 'launch' the full dock → click → window-opens sequence
 */
export function shouldPlayIntro({ reducedMotion, seen, scrollY }) {
  if (seen) return 'none';
  if ((Number(scrollY) || 0) > 0) return 'none';
  return reducedMotion ? 'fade' : 'launch';
}

/**
 * Pure: the transform that shrinks `win` down onto `icon` (both viewport
 * rects). Uniform scale so the window keeps its shape, centres aligned —
 * assumes transform-origin is the window's centre. Returns null when either
 * rect is unusable, so the caller can fall back to a plain fade.
 */
export function launchTransform(icon, win) {
  const ok = (r) => r && r.width > 0 && r.height > 0;
  if (!ok(icon) || !ok(win)) return null;
  const scale = Math.min(icon.width / win.width, icon.height / win.height);
  const x = icon.left + icon.width / 2 - (win.left + win.width / 2);
  const y = icon.top + icon.height / 2 - (win.top + win.height / 2);
  return { x, y, scale };
}

/**
 * Animates the window opening out of the dock icon (or fading in if the
 * geometry is unusable). Measures both rects now, so call it while the dock
 * sits at rest. With a delay, the window stays hidden until it opens.
 */
export function openWindowFromIcon(win, icon, { delay = 0, duration = TIMELINE.open.dur } = {}) {
  const start = icon ? launchTransform(icon.getBoundingClientRect(), win.getBoundingClientRect()) : null;
  if (!start) {
    return win.animate([{ opacity: 0 }, { opacity: 1 }], { delay, duration: 300, fill: 'backwards' });
  }
  return win.animate(
    [
      { transform: `translate(${start.x}px, ${start.y}px) scale(${start.scale})`, opacity: 0 },
      { opacity: 1, offset: 0.2 },
      { transform: 'none', opacity: 1 },
    ],
    { delay, duration, easing: SETTLE, fill: 'backwards' }
  );
}

const readSeen = () => {
  try {
    return window.sessionStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
};

const markSeen = () => {
  try {
    window.sessionStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* storage blocked — the intro just plays again next load */
  }
};

/**
 * Plays the hero intro: a dock rises, the app icon is "clicked", and the
 * window opens out of it, then the dock hides. Runs before first paint so the
 * window never flashes. Any scroll / key / pointer input finishes it
 * instantly — input is never locked out.
 */
export function useLaunchIntro({ windowRef, dockRef, iconRef, dotRef, reducedMotion }) {
  useLayoutEffect(() => {
    const win = windowRef.current;
    const dock = dockRef.current;
    const icon = iconRef.current;
    const dot = dotRef.current;
    if (!win || typeof win.animate !== 'function') return undefined;

    const mode = shouldPlayIntro({
      reducedMotion,
      seen: readSeen(),
      scrollY: window.scrollY,
    });
    if (mode === 'none') return undefined;

    if (mode === 'fade') {
      const fade = win.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 300,
        easing: 'ease',
      });
      fade.finished.then(markSeen, () => {});
      return () => fade.cancel();
    }

    if (!dock || !icon || !dot) return undefined;

    // show the dock at rest first, so the icon is measured where it will sit
    dock.classList.add('is-active');
    // the window is invisible until it opens — don't let its words be hovered
    // (speech bubbles would pop over an empty screen)
    win.classList.add('is-launching');
    const t = TIMELINE;
    const anims = [
      dock.animate(
        [{ transform: 'translateY(calc(100% + 24px))' }, { transform: 'none' }],
        { delay: t.dockIn.at, duration: t.dockIn.dur, easing: SETTLE, fill: 'backwards' }
      ),
      // cursor-less click: the icon darkens and comes back
      icon.animate(
        [
          { filter: 'brightness(1)' },
          { filter: 'brightness(0.5)', offset: 0.45 },
          { filter: 'brightness(1)' },
        ],
        { delay: t.press.at, duration: t.press.dur, easing: 'ease-out' }
      ),
      // running-app indicator appears under the icon
      dot.animate([{ opacity: 0 }, { opacity: 1 }], {
        delay: t.dot.at,
        duration: t.dot.dur,
        fill: 'both',
      }),
      openWindowFromIcon(win, icon, { delay: t.open.at }),
      dock.animate(
        [{ transform: 'none' }, { transform: 'translateY(calc(100% + 24px))' }],
        { delay: t.dockOut.at, duration: t.dockOut.dur, easing: ACCEL, fill: 'forwards' }
      ),
    ];

    let done = false;
    const events = ['wheel', 'touchstart', 'keydown', 'pointerdown', 'scroll'];
    const finish = () => {
      if (done) return;
      done = true;
      events.forEach((e) => window.removeEventListener(e, skip, true));
      anims.forEach((a) => a.cancel());
      dock.classList.remove('is-active');
      win.classList.remove('is-launching');
      markSeen();
    };
    // jump straight to the end state on any input; inner scrollers (e.g. the
    // chat panel auto-scrolling) don't count — only the page itself scrolling
    const skip = (e) => {
      if (e.type === 'scroll' && e.target !== document) return;
      finish();
    };
    events.forEach((e) => window.addEventListener(e, skip, { capture: true, passive: true }));

    Promise.all(anims.map((a) => a.finished)).then(finish, () => {});

    return () => {
      // unmount (or StrictMode's dev re-run): tear down without marking seen
      done = true;
      events.forEach((e) => window.removeEventListener(e, skip, true));
      anims.forEach((a) => a.cancel());
      dock.classList.remove('is-active');
      win.classList.remove('is-launching');
    };
  }, [windowRef, dockRef, iconRef, dotRef, reducedMotion]);
}
