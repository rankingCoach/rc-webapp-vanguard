import { modalLayout } from '../modal-layout';

export type CompactWindowBounds = { x: number; y: number; width: number; height: number };

/** Keep the whole window reachable, including on viewports smaller than its preferred minimum. */
export const clampCompactWindowBounds = (
  bounds: CompactWindowBounds,
  viewportWidth: number,
  viewportHeight: number,
): CompactWindowBounds => {
  const width = Math.min(viewportWidth, Math.max(Math.min(modalLayout.minWidth, viewportWidth), bounds.width));
  const height = Math.min(viewportHeight, Math.max(Math.min(modalLayout.minHeight, viewportHeight), bounds.height));
  return {
    width,
    height,
    x: Math.max(0, Math.min(bounds.x, viewportWidth - width)),
    y: Math.max(0, Math.min(bounds.y, viewportHeight - height)),
  };
};

/** Overlap area as a fraction of the smaller window; 0 when either window is empty. */
export const compactWindowOverlapRatio = (source: CompactWindowBounds, target: CompactWindowBounds) => {
  const overlap =
    Math.max(0, Math.min(source.x + source.width, target.x + target.width) - Math.max(source.x, target.x)) *
    Math.max(0, Math.min(source.y + source.height, target.y + target.height) - Math.max(source.y, target.y));
  const area = Math.min(source.width * source.height, target.width * target.height);
  return area > 0 ? overlap / area : 0;
};
