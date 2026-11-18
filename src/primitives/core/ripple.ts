/**
 * Ripple geometry (framework-free), identical to the MUI TouchRipple maths Vanguard shipped with, so the
 * pressed/focus feedback keeps its size and origin.
 */
export interface RippleInput {
  rect: { left: number; top: number; width: number; height: number };
  center: boolean;
  clientX?: number;
  clientY?: number;
  clientWidth: number;
  clientHeight: number;
}

export const rippleGeometry = (input: RippleInput): { x: number; y: number; size: number } => {
  const { rect, center, clientX, clientY, clientWidth, clientHeight } = input;
  let x: number;
  let y: number;
  if (center || clientX === undefined || clientY === undefined || (clientX === 0 && clientY === 0)) {
    x = Math.round(rect.width / 2);
    y = Math.round(rect.height / 2);
  } else {
    x = Math.round(clientX - rect.left);
    y = Math.round(clientY - rect.top);
  }
  if (center) {
    let size = Math.sqrt((2 * rect.width ** 2 + rect.height ** 2) / 3);
    if (size % 2 === 0) size += 1;
    return { x, y, size };
  }
  const sizeX = Math.max(Math.abs(clientWidth - x), x) * 2 + 2;
  const sizeY = Math.max(Math.abs(clientHeight - y), y) * 2 + 2;
  return { x, y, size: Math.sqrt(sizeX ** 2 + sizeY ** 2) };
};

/**
 * DOM order of ripples (MUI parity, from its react-transition-group days): exiting ripples keep their place and new
 * active ripples are inserted before the trailing group of exiting ones.
 */
export const mergeRippleOrder = (prevOrder: number[], nextActiveKeys: number[]): number[] => {
  const nextKeySet = new Set(nextActiveKeys);
  const pendingBeforeKey = new Map<number, number[]>();
  let pending: number[] = [];
  for (const prevKey of prevOrder) {
    if (nextKeySet.has(prevKey)) {
      if (pending.length > 0) {
        pendingBeforeKey.set(prevKey, pending);
        pending = [];
      }
    } else {
      pending.push(prevKey);
    }
  }
  const nextOrder: number[] = [];
  for (const key of nextActiveKeys) {
    const before = pendingBeforeKey.get(key);
    if (before) nextOrder.push(...before);
    nextOrder.push(key);
  }
  nextOrder.push(...pending);
  return nextOrder;
};
