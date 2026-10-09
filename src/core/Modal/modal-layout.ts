/** Shared pixel geometry for JS hit testing/clamping and CSS panel sizing. */
export const modalLayout = {
  width: 480, height: 760, inset: 16, minWidth: 320, minHeight: 240,
  stackStep: 28, maxStackOffset: 140, depthStep: 10, maxDepth: 4,
  titleBand: 48, resizeEdge: 8, stackMoveHalfWidth: 48,
} as const;

export const modalLayoutCss = {
  '--modal-preferred-width': `${modalLayout.width}px`,
  '--modal-preferred-height': `${modalLayout.height}px`,
  '--modal-inset': `${modalLayout.inset}px`,
  '--modal-title-band': `${modalLayout.titleBand}px`,
  '--modal-resize-edge': `${modalLayout.resizeEdge}px`,
};

export const modalStackStep = (count: number) => Math.min(modalLayout.stackStep, modalLayout.maxStackOffset / Math.max(1, count - 1));
export const modalStackDepth = (index: number, count: number) => Math.min(modalLayout.maxDepth, count - 1 - index) * modalLayout.depthStep;
