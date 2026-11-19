// Ported from @mui/material@9.5.0 Popover/Popover.js (MIT)
/**
 * Popover positioning (framework-free), identical to the MUI Popover maths Vanguard shipped: anchor point from
 * `anchorOrigin`, element offset from `transformOrigin`, then clamped `marginThreshold` px inside the viewport with
 * the transform origin shifted by the same amount (so the grow animation still starts at the anchor).
 */
export type OriginV = 'top' | 'center' | 'bottom' | number;
export type OriginH = 'left' | 'center' | 'right' | number;

export interface PopoverPositionInput {
  anchorRect: { top: number; left: number; width: number; height: number };
  element: { width: number; height: number };
  anchorOrigin: { vertical: OriginV; horizontal: OriginH };
  transformOrigin: { vertical: OriginV; horizontal: OriginH };
  viewport: { width: number; height: number };
  marginThreshold?: number | null;
}

const offsetTop = (h: number, v: OriginV) =>
  typeof v === 'number' ? v : v === 'center' ? h / 2 : v === 'bottom' ? h : 0;
const offsetLeft = (w: number, o: OriginH) =>
  typeof o === 'number' ? o : o === 'center' ? w / 2 : o === 'right' ? w : 0;

export const popoverPosition = (input: PopoverPositionInput) => {
  const { anchorRect, element, anchorOrigin, transformOrigin, viewport, marginThreshold = 16 } = input;
  const origin = {
    vertical: offsetTop(element.height, transformOrigin.vertical),
    horizontal: offsetLeft(element.width, transformOrigin.horizontal),
  };
  let top = anchorRect.top + offsetTop(anchorRect.height, anchorOrigin.vertical) - origin.vertical;
  let left = anchorRect.left + offsetLeft(anchorRect.width, anchorOrigin.horizontal) - origin.horizontal;
  const bottom = top + element.height;
  const right = left + element.width;
  const heightThreshold = viewport.height - (marginThreshold ?? 0);
  const widthThreshold = viewport.width - (marginThreshold ?? 0);

  if (marginThreshold != null && top < marginThreshold) {
    const diff = top - marginThreshold;
    top -= diff;
    origin.vertical += diff;
  } else if (marginThreshold != null && bottom > heightThreshold) {
    const diff = bottom - heightThreshold;
    top -= diff;
    origin.vertical += diff;
  }
  if (marginThreshold != null && left < marginThreshold) {
    const diff = left - marginThreshold;
    left -= diff;
    origin.horizontal += diff;
  } else if (right > widthThreshold) {
    const diff = right - widthThreshold;
    left -= diff;
    origin.horizontal += diff;
  }
  return {
    top: `${Math.round(top)}px`,
    left: `${Math.round(left)}px`,
    transformOrigin: `${origin.horizontal}px ${origin.vertical}px`,
  };
};
