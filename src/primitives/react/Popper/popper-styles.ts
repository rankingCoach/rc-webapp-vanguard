import { getOffsetParent } from './dom-geometry';

/**
 * popper.js 2.11 `computeStyles` + `applyStyles`: the inline styles and attributes MUI Popper ends up with, so the
 * own Popper paints identically (consumer CSS such as `[data-popper-placement]` keeps matching).
 */
export type StyleMap = Partial<
  Record<'position' | 'top' | 'left' | 'right' | 'bottom' | 'margin' | 'transform', string>
>;

/** applyStyles' effect: what popper writes on create, before the first position. */
export const initialPopperStyles = (strategy: 'absolute' | 'fixed'): StyleMap => ({
  position: strategy,
  left: '0',
  top: '0',
  margin: '0',
});

const UNSET_SIDES: StyleMap = { top: 'auto', right: 'auto', bottom: 'auto', left: 'auto' };

export interface MapToStylesInput {
  element: HTMLElement;
  floatingSize: { width: number; height: number };
  placement: string;
  offsets: { x?: number; y?: number };
  position: 'absolute' | 'fixed';
  gpuAcceleration: boolean;
  adaptive: boolean;
  roundOffsets: boolean;
  isFixed: boolean;
}

/** popper `mapToStyles`. */
export const mapToStyles = (input: MapToStylesInput): StyleMap => {
  const { element, floatingSize, offsets, position, gpuAcceleration, adaptive, roundOffsets, isFixed } = input;
  const [base, variation] = input.placement.split('-');
  let x = offsets.x ?? 0;
  let y = offsets.y ?? 0;
  const hasX = Object.hasOwn(offsets, 'x');
  const hasY = Object.hasOwn(offsets, 'y');
  let sideX: 'left' | 'right' = 'left';
  let sideY: 'top' | 'bottom' = 'top';
  const win = element.ownerDocument.defaultView ?? window;

  if (adaptive) {
    let offsetParent: Element | Window = getOffsetParent(element);
    let heightProp: 'clientHeight' | 'scrollHeight' = 'clientHeight';
    let widthProp: 'clientWidth' | 'scrollWidth' = 'clientWidth';
    if (offsetParent === win) {
      offsetParent = element.ownerDocument.documentElement;
      if (win.getComputedStyle(offsetParent).position !== 'static' && position === 'absolute') {
        heightProp = 'scrollHeight';
        widthProp = 'scrollWidth';
      }
    }
    const parent = offsetParent as Element;
    if (base === 'top' || ((base === 'left' || base === 'right') && variation === 'end')) {
      sideY = 'bottom';
      const offsetY =
        isFixed && (parent as unknown) === win && win.visualViewport ? win.visualViewport.height : parent[heightProp];
      y -= offsetY - floatingSize.height;
      y *= gpuAcceleration ? 1 : -1;
    }
    if (base === 'left' || ((base === 'top' || base === 'bottom') && variation === 'end')) {
      sideX = 'right';
      const offsetX =
        isFixed && (parent as unknown) === win && win.visualViewport ? win.visualViewport.width : parent[widthProp];
      x -= offsetX - floatingSize.width;
      x *= gpuAcceleration ? 1 : -1;
    }
  }

  const common: StyleMap = { position, ...(adaptive ? UNSET_SIDES : {}) };
  if (roundOffsets) {
    const dpr = win.devicePixelRatio || 1;
    x = Math.round(x * dpr) / dpr || 0;
    y = Math.round(y * dpr) / dpr || 0;
  }
  if (gpuAcceleration) {
    return {
      ...common,
      [sideY]: hasY ? '0' : '',
      [sideX]: hasX ? '0' : '',
      transform: (win.devicePixelRatio || 1) <= 1 ? `translate(${x}px, ${y}px)` : `translate3d(${x}px, ${y}px, 0)`,
    };
  }
  return { ...common, [sideY]: hasY ? `${y}px` : '', [sideX]: hasX ? `${x}px` : '', transform: '' };
};
