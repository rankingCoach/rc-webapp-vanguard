// Ported from @popperjs/core@2.11.8 lib/utils/detectOverflow.js, lib/dom-utils/getCompositeRect.js (MIT)
import { AnchoredPlacementResult, anchoredPlacement, Placement } from '../../core/anchored-placement';
import { getClippingRect, getCompositeRect, getOffsetParent, layoutSize } from './dom-geometry';
import type { ResolvedPopperOptions } from './popper-options';

export type AnchorLike = Element | { getBoundingClientRect: () => DOMRect; contextElement?: Element };

export interface ComputedAnchored extends AnchoredPlacementResult {
  /** Floating element position in its offset parent's coordinates (what popper's translate/top-left use). */
  offsetX: number;
  offsetY: number;
}

/**
 * Measures the two clipping rects the way popper's detectOverflow does. Each modifier chooses the clipping
 * parents of the floating element, or of the anchor when its `altBoundary` is enabled. Both intersect the viewport.
 * runs the pure core in viewport coordinates and shifts the result into the floating element's offset-parent
 * coordinates (popper getCompositeRect), so `translate(offsetX, offsetY)` lands where popper.js would put it.
 */
export const computeAnchored = (
  anchor: AnchorLike,
  floating: HTMLElement,
  options: Pick<
    ResolvedPopperOptions,
    'placement' | 'strategy' | 'input' | 'flipAltBoundary' | 'preventOverflowAltBoundary'
  >,
): ComputedAnchored => {
  const fixed = options.strategy === 'fixed';
  const anchorClient = anchor.getBoundingClientRect();
  const reference = {
    x: anchorClient.left,
    y: anchorClient.top,
    width: anchorClient.width,
    height: anchorClient.height,
  };
  const size = layoutSize(floating);
  const referenceElement =
    'nodeType' in anchor ? anchor : (anchor.contextElement ?? floating.ownerDocument.documentElement);
  const referenceBoundary = getClippingRect(referenceElement, options.strategy);
  const floatingBoundary = getClippingRect(floating, options.strategy);
  const arrowEl = options.input.arrow?.element as HTMLElement | null | undefined;
  const arrowParent = arrowEl?.offsetParent as HTMLElement | null | undefined;
  const composite = getCompositeRect(anchor, getOffsetParent(floating), fixed);
  // Like popper: offsets from the offset-parent (composite) rect, overflow from the client rect.
  const result = anchoredPlacement({
    reference: composite,
    clientReference: reference,
    floating: size,
    boundary: floatingBoundary,
    flipBoundary: options.flipAltBoundary ? referenceBoundary : floatingBoundary,
    preventOverflowBoundary: options.preventOverflowAltBoundary ? referenceBoundary : floatingBoundary,
    placement: options.placement as Placement,
    offset: options.input.offset,
    flip: options.input.flip,
    preventOverflow: options.input.preventOverflow,
    hide: options.input.hide,
    referenceBoundary,
    arrow: arrowEl
      ? {
          ...layoutSize(arrowEl),
          padding: options.input.arrow?.padding,
          clientWidth: arrowParent ? arrowParent.clientWidth : 0,
          clientHeight: arrowParent ? arrowParent.clientHeight : 0,
        }
      : undefined,
  });
  return { ...result, offsetX: result.x, offsetY: result.y };
};
