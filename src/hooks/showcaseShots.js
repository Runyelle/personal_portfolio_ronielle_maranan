/**
 * Pure: should the phone cycle through a project's screenshots right now?
 * Only while the pointer (or focus) is on a project card, the Showcase is on
 * screen, and there is more than one shot — otherwise it holds still.
 */
export function shouldCycleShots({ over, visible, count }) {
  return Boolean(over) && Boolean(visible) && Number(count) > 1;
}
