import { AnchoredPlacementResult, anchoredPlacement, Placement } from '../../core/anchored-placement';
import { getClippingRect, getCompositeRect, getOffsetParent } from './dom-geometry';
import type { ResolvedPopperOptions } from './popper-options';

export type AnchorLike = Element | { getBoundingClientRect: () => DOMRect; contextElement?: Element };

export interface ComputedAnchored extends AnchoredPlacementResult {
  /** Floating element position in its offset parent's coordinates (what popper's translate/top-left use). */
  offsetX: number;
  offsetY: number;
}

/**
 * Measures the anchor and the floating element, resolves the clipping rect the way popper's detectOverflow does
 * (clipping parents of the floating element, or of the anchor when `altBoundary`, intersected with the viewport),
 * runs the pure core in viewport coordinates and shifts the result into the floating element's offset-parent
 * coordinates (popper getCompositeRect), so `translate(offsetX, offsetY)` lands where popper.js would put it.
 */
export const computeAnchored = (
  anchor: AnchorLike,
  floating: HTMLElement,
  options: Pick<ResolvedPopperOptions, 'placement' | 'strategy' | 'input'> & { altBoundary?: boolean },
): ComputedAnchored => {
  const fixed = options.strategy === 'fixed';
  const anchorClient = anchor.getBoundingClientRect();
  const reference = {
    x: anchorClient.left,
    y: anchorClient.top,
    width: anchorClient.width,
    height: anchorClient.height,
  };
  // popper getLayoutRect: offsetWidth/Height unless the client rect differs by more than 1px (transforms).
  const fr = floating.getBoundingClientRect();
  const size = {
    width: Math.abs(fr.width - floating.offsetWidth) <= 1 ? floating.offsetWidth : fr.width,
    height: Math.abs(fr.height - floating.offsetHeight) <= 1 ? floating.offsetHeight : fr.height,
  };
  const clipElement =
    options.altBoundary && 'nodeType' in anchor
      ? (anchor as Element)
      : options.altBoundary && 'contextElement' in anchor && anchor.contextElement
        ? anchor.contextElement
        : floating;
  const boundary = getClippingRect(clipElement, options.strategy);
  const autoBoundary = clipElement === floating ? boundary : getClippingRect(floating, options.strategy);
  const arrowEl = options.input.arrow?.element as HTMLElement | null | undefined;
  const arrowParent = arrowEl?.offsetParent as HTMLElement | null | undefined;
  const composite = getCompositeRect(anchor, getOffsetParent(floating), fixed);
  // Like popper: offsets from the offset-parent (composite) rect, overflow from the client rect.
  const result = anchoredPlacement({
    reference: composite,
    clientReference: reference,
    floating: size,
    boundary,
    autoBoundary,
    placement: options.placement as Placement,
    offset: options.input.offset,
    flip: options.input.flip,
    preventOverflow: options.input.preventOverflow,
    arrow: arrowEl
      ? {
          width: arrowEl.offsetWidth,
          height: arrowEl.offsetHeight,
          padding: options.input.arrow?.padding,
          clientWidth: arrowParent ? arrowParent.clientWidth : 0,
          clientHeight: arrowParent ? arrowParent.clientHeight : 0,
        }
      : undefined,
  });
  return { ...result, offsetX: result.x, offsetY: result.y };
};
