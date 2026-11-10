import { useEffect, useRef } from 'react';
import {
  clampToBounds,
  project,
  releaseVelocity,
  rubberbandRange,
  springSettled,
  springStep,
} from './windowPhysics.js';

// a release faster than this (px/s) counts as a flick and earns a little bounce
const FLICK = 600;
// keep windows clear of the fixed brand mark / nav at the top of the screen
const TOP_CLEARANCE = 72;

/**
 * Drag a window by its title bar, kept inside `deskRef`.
 *  - 1:1 tracking from the grab point (pointer capture, so it keeps tracking off the bar)
 *  - rubber-bands past the desk edge, springs back inside on release
 *  - release velocity carries it on (momentum projection), then a spring settles it
 *  - grabbing it mid-settle catches it where it is (interruptible)
 * Offsets are in the desk's local px, so they stay right while the Showcase
 * scales the panel. Reduced motion: still 1:1, but it stops where dropped.
 *
 * Each change of `homeKey` glides the window back to its default spot (a
 * critically damped spring; instant with reduced motion). Grabbing it on the
 * way home catches it, as with any other settle.
 */
export function useDraggableWindow({
  winRef,
  barRef,
  deskRef,
  enabled,
  reducedMotion,
  onGrab,
  homeKey = 0,
}) {
  const offset = useRef({ x: 0, y: 0 });
  const grabRef = useRef(onGrab);
  grabRef.current = onGrab;
  // set by the effect below while drag is enabled: glide back to { 0, 0 }
  const goHome = useRef(null);

  useEffect(() => {
    const win = winRef.current;
    const bar = barRef.current;
    const desk = deskRef.current;

    const apply = () => {
      win.style.setProperty('--wx', `${offset.current.x.toFixed(2)}px`);
      win.style.setProperty('--wy', `${offset.current.y.toFixed(2)}px`);
    };

    if (!win || !bar || !desk || !enabled) {
      // leaving desk mode: windows go back into the stacked layout
      offset.current = { x: 0, y: 0 };
      win?.style.removeProperty('--wx');
      win?.style.removeProperty('--wy');
      return undefined;
    }

    let raf = 0;
    let drag = null;

    // allowed offsets: the window's resting box (without its offset) kept inside
    // the desk's padding box — so within the section, and out from under the nav
    const measure = () => {
      const d = desk.getBoundingClientRect();
      const cs = getComputedStyle(desk);
      const padL = parseFloat(cs.paddingLeft) || 0;
      const padR = parseFloat(cs.paddingRight) || 0;
      const padT = Math.max(parseFloat(cs.paddingTop) || 0, TOP_CLEARANCE);
      const padB = parseFloat(cs.paddingBottom) || 0;
      const scale = desk.offsetWidth ? d.width / desk.offsetWidth : 1;
      const w = win.getBoundingClientRect();
      const o = offset.current;
      const left = (w.left - d.left) / scale - o.x;
      const top = (w.top - d.top) / scale - o.y;
      const width = w.width / scale;
      const height = w.height / scale;
      return {
        scale,
        deskW: desk.offsetWidth,
        deskH: desk.offsetHeight,
        bounds: {
          minX: padL - left,
          maxX: desk.offsetWidth - padR - (left + width),
          minY: padT - top,
          maxY: desk.offsetHeight - padB - (top + height),
        },
      };
    };

    const stopSpring = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    // spring from the current (on-screen) offset to target, carrying velocity
    const springTo = (target, vx, vy, params) => {
      stopSpring();
      let sx = { x: offset.current.x, v: vx };
      let sy = { x: offset.current.y, v: vy };
      let last = performance.now();
      const tick = (now) => {
        // fixed small substeps keep the spring stable on slow frames
        let dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        while (dt > 0) {
          const h = Math.min(dt, 1 / 240);
          sx = springStep(sx, target.x, h, params);
          sy = springStep(sy, target.y, h, params);
          dt -= h;
        }
        if (springSettled(sx, target.x) && springSettled(sy, target.y)) {
          offset.current = { ...target };
          apply();
          raf = 0;
          return;
        }
        offset.current = { x: sx.x, y: sy.x };
        apply();
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const settle = (vx, vy) => {
      const { bounds } = measure();
      if (reducedMotion) {
        offset.current = clampToBounds(offset.current, bounds);
        apply();
        return;
      }
      const target = clampToBounds(
        { x: offset.current.x + project(vx), y: offset.current.y + project(vy) },
        bounds
      );
      const flicked = Math.hypot(vx, vy) > FLICK;
      springTo(target, vx, vy, { damping: flicked ? 0.8 : 1, response: 0.35 });
    };

    goHome.current = () => {
      if (drag) return; // they're holding it — leave it be
      const { x, y } = offset.current;
      if (Math.abs(x) < 0.5 && Math.abs(y) < 0.5) return;
      if (reducedMotion) {
        stopSpring();
        offset.current = { x: 0, y: 0 };
        apply();
        return;
      }
      // a calm, no-bounce glide — nothing threw it, so nothing overshoots
      springTo({ x: 0, y: 0 }, 0, 0, { damping: 1, response: 0.55 });
    };

    const down = (e) => {
      if (e.button !== 0) return;
      stopSpring(); // catch it wherever it is right now
      grabRef.current?.();
      const m = measure();
      bar.setPointerCapture(e.pointerId);
      drag = {
        id: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        from: { ...offset.current },
        ...m,
        hx: [{ t: e.timeStamp, v: offset.current.x }],
        hy: [{ t: e.timeStamp, v: offset.current.y }],
      };
      e.preventDefault(); // no text selection while dragging
    };

    const move = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const rawX = drag.from.x + (e.clientX - drag.startX) / drag.scale;
      const rawY = drag.from.y + (e.clientY - drag.startY) / drag.scale;
      const b = drag.bounds;
      offset.current = {
        x: rubberbandRange(rawX, b.minX, b.maxX, drag.deskW),
        y: rubberbandRange(rawY, b.minY, b.maxY, drag.deskH),
      };
      apply();
      drag.hx.push({ t: e.timeStamp, v: offset.current.x });
      drag.hy.push({ t: e.timeStamp, v: offset.current.y });
      if (drag.hx.length > 12) {
        drag.hx.shift();
        drag.hy.shift();
      }
    };

    const up = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const vx = releaseVelocity(drag.hx);
      const vy = releaseVelocity(drag.hy);
      drag = null;
      settle(vx, vy);
    };

    // a resized desk: pull every window back inside, no animation
    const onResize = () => {
      if (drag) return;
      stopSpring();
      offset.current = clampToBounds(offset.current, measure().bounds);
      apply();
    };

    bar.addEventListener('pointerdown', down);
    bar.addEventListener('pointermove', move);
    bar.addEventListener('pointerup', up);
    bar.addEventListener('pointercancel', up);
    window.addEventListener('resize', onResize);
    return () => {
      stopSpring();
      goHome.current = null;
      bar.removeEventListener('pointerdown', down);
      bar.removeEventListener('pointermove', move);
      bar.removeEventListener('pointerup', up);
      bar.removeEventListener('pointercancel', up);
      window.removeEventListener('resize', onResize);
    };
  }, [winRef, barRef, deskRef, enabled, reducedMotion]);

  // glide home whenever the key changes (skips the first render)
  const firstKey = useRef(homeKey);
  useEffect(() => {
    if (homeKey === firstKey.current) return;
    goHome.current?.();
  }, [homeKey]);
}
