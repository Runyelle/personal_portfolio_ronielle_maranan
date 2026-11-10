import { useCallback, useEffect, useState } from 'react';

/** Pure: move `id` to the top (end) of the stacking order; unknown ids leave it unchanged. */
export function raise(order, id) {
  if (!order.includes(id) || order[order.length - 1] === id) return order;
  return [...order.filter((o) => o !== id), id];
}

// how much of the desk must stay on screen before the windows glide home
export const HOME_RATIO = 0.6;

/**
 * Pure: has the desk just crossed out of view enough to send windows home?
 * True only on the crossing (was at/above the threshold, now below), so the
 * glide fires once as the panel leaves — not on every scroll frame.
 */
export function shouldGlideHome({ wasRatio, ratio, threshold = HOME_RATIO }) {
  return Number(wasRatio) >= threshold && Number(ratio) < threshold;
}

/** Pure: has the desk just gone fully off screen (time to reset the stacking order)? */
export function shouldResetStack({ wasVisible, isVisible }) {
  return Boolean(wasVisible) && !isVisible;
}

/**
 * Stacking order of a set of windows (last = front). Resets when the set of
 * ids changes (e.g. a window hidden at a breakpoint), so the front window is
 * always one that's actually on screen.
 */
export function useWindowStack(ids) {
  const key = ids.join('|');
  const [order, setOrder] = useState(ids);

  useEffect(() => {
    setOrder(key ? key.split('|') : []);
  }, [key]);

  const bringToFront = useCallback((id) => setOrder((o) => raise(o, id)), []);
  // back to the default order (the order the ids were given in)
  const reset = useCallback(() => setOrder(key ? key.split('|') : []), [key]);

  return {
    order,
    reset,
    front: order[order.length - 1],
    zIndex: (id) => 10 + Math.max(0, order.indexOf(id)),
    bringToFront,
  };
}
