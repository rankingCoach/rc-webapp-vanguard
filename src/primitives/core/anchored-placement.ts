// Ported from @popperjs/core@2.11.8 lib/modifiers/(popperOffsets,offset,flip,preventOverflow,arrow,hide).js, lib/utils/detectOverflow.js (MIT)
/**
 * Anchored placement (group B, plan §27): a framework-free port of popper.js 2.11's main-phase modifiers as MUI
 * Popper/Tooltip run them: popperOffsets → offset → flip (resets the run once when it changes the placement) →
 * preventOverflow. Input is plain rects (viewport coordinates); output is the floating element's top-left and the
 * final placement. The DOM adapter can supply each modifier's own clipping rect for nested scroll containers.
 */

export type BasePlacement = 'top' | 'bottom' | 'left' | 'right';
export type Variation = 'start' | 'end';
export type Placement = BasePlacement | `${BasePlacement}-${Variation}` | 'auto' | `auto-${Variation}`;

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface Size {
  width: number;
  height: number;
}
type Sides = { top: number; bottom: number; left: number; right: number };
type Point = { x: number; y: number };

export interface AnchoredPlacementInput {
  /** Anchor rect in the coordinate system of the result (popper's `rects.reference`: offset-parent coordinates). */
  reference: Rect;
  /**
   * Anchor rect in viewport coordinates for overflow detection (popper's detectOverflow uses the client rect).
   * Default: `reference` (then everything is in viewport coordinates).
   */
  clientReference?: Rect;
  floating: Size;
  /** Default clipping rect for modifiers without a supplied boundary. */
  boundary: Rect;
  /** Clipping rect for `flip` and `preventOverflow`, each with its own popper.js `altBoundary`. */
  flipBoundary?: Rect;
  preventOverflowBoundary?: Rect;
  /**
   * Clipping rect for scoring `auto` placements. popper's computeAutoPlacement does not forward `altBoundary`, so it
   * always clips against the floating element's clipping parents. Default: `boundary`.
   */
  autoBoundary?: Rect;
  placement?: Placement;
  /** popper `offset` modifier `[skidding, distance]`. */
  offset?: [number, number];
  flip?:
    | false
    | {
        padding?: number | Partial<Sides>;
        fallbackPlacements?: Placement[];
        flipVariations?: boolean;
        altAxis?: boolean;
      };
  preventOverflow?:
    | false
    | { padding?: number | Partial<Sides>; altAxis?: boolean; tether?: boolean; tetherOffset?: number };
  /**
   * Arrow element size when the arrow modifier is on: keeps the arrow inside the reference while tethering and
   * returns its offset. `clientWidth`/`clientHeight` = the arrow's offset parent client size (default: floating).
   */
  arrow?: Size & { padding?: number; clientWidth?: number; clientHeight?: number };
  /**
   * popper `hide` modifier (on by default in popper.js). `referenceBoundary` = the clipping rect of the reference's
   * own clipping parents (default: `boundary`).
   */
  hide?: boolean;
  referenceBoundary?: Rect;
}

export interface AnchoredPlacementResult {
  x: number;
  y: number;
  placement: Exclude<Placement, 'auto' | 'auto-start' | 'auto-end'>;
  /** popper `arrow` modifier data: the arrow's offset on the main axis and how far it was clamped from centre. */
  arrow?: { x?: number; y?: number; centerOffset: number };
  /** popper `hide` modifier data (`data-popper-reference-hidden` / `data-popper-escaped`). */
  hide?: { isReferenceHidden: boolean; hasPopperEscaped: boolean };
}

const BASES: BasePlacement[] = ['top', 'bottom', 'right', 'left'];
const VARIATION_PLACEMENTS = BASES.flatMap((b) => [`${b}-start`, `${b}-end`] as Placement[]);
const ALL_PLACEMENTS: Placement[] = BASES.flatMap((b) => [b, `${b}-start`, `${b}-end`] as Placement[]);
const OPPOSITE: Record<string, string> = { left: 'right', right: 'left', bottom: 'top', top: 'bottom' };

const basePlacement = (p: Placement) => p.split('-')[0] as BasePlacement | 'auto';
const variation = (p: Placement) => p.split('-')[1] as Variation | undefined;
const mainAxisOf = (b: string): 'x' | 'y' => (b === 'top' || b === 'bottom' ? 'x' : 'y');
const oppositePlacement = (p: Placement) => p.replace(/left|right|bottom|top/g, (m) => OPPOSITE[m]) as Placement;
const oppositeVariation = (p: Placement) =>
  p.replace(/start|end/g, (m) => (m === 'start' ? 'end' : 'start')) as Placement;
const within = (min: number, value: number, max: number) => Math.max(min, Math.min(value, max));
const sides = (padding: number | Partial<Sides> | undefined): Sides => {
  if (typeof padding === 'object') return { top: 0, bottom: 0, left: 0, right: 0, ...padding };
  const p = padding ?? 0;
  return { top: p, bottom: p, left: p, right: p };
};

/** popper `computeOffsets`. */
export const computeOffsets = (reference: Rect, floating: Size, placement: Placement): Point => {
  const base = basePlacement(placement);
  const v = variation(placement);
  const commonX = reference.x + reference.width / 2 - floating.width / 2;
  const commonY = reference.y + reference.height / 2 - floating.height / 2;
  let offsets: Point;
  switch (base) {
    case 'top':
      offsets = { x: commonX, y: reference.y - floating.height };
      break;
    case 'bottom':
      offsets = { x: commonX, y: reference.y + reference.height };
      break;
    case 'right':
      offsets = { x: reference.x + reference.width, y: commonY };
      break;
    case 'left':
      offsets = { x: reference.x - floating.width, y: commonY };
      break;
    default:
      offsets = { x: reference.x, y: reference.y };
  }
  // popper applies the variation for `auto-*` too (getMainAxisFromPlacement('auto') is 'y').
  const axis = mainAxisOf(base);
  const len = axis === 'y' ? 'height' : 'width';
  if (v === 'start') offsets[axis] -= reference[len] / 2 - floating[len] / 2;
  if (v === 'end') offsets[axis] += reference[len] / 2 - floating[len] / 2;
  return offsets;
};

/** popper `distanceAndSkiddingToXY` (offset modifier). */
const offsetFor = (placement: Placement, offset: [number, number] = [0, 0]): Point => {
  const base = basePlacement(placement);
  const invert = base === 'left' || base === 'top' ? -1 : 1;
  const skidding = offset[0] || 0;
  const distance = (offset[1] || 0) * invert;
  return base === 'left' || base === 'right' ? { x: distance, y: skidding } : { x: skidding, y: distance };
};

/** popper `detectOverflow` (elementContext popper, offset modifier data applied): positive = overflowing. */
const detectOverflow = (
  input: AnchoredPlacementInput,
  placement: Placement,
  padding?: number | Partial<Sides>,
  boundary: Rect = input.boundary,
) => {
  const { floating } = input;
  const reference = input.clientReference ?? input.reference;
  const p = sides(padding);
  const at = computeOffsets(reference, floating, placement);
  const rect = { top: at.y, left: at.x, bottom: at.y + floating.height, right: at.x + floating.width };
  const overflow: Sides = {
    top: boundary.y - rect.top + p.top,
    bottom: rect.bottom - (boundary.y + boundary.height) + p.bottom,
    left: boundary.x - rect.left + p.left,
    right: rect.right - (boundary.x + boundary.width) + p.right,
  };
  if (input.offset) {
    const o = offsetFor(placement, input.offset);
    overflow.top -= o.y;
    overflow.bottom += o.y;
    overflow.left -= o.x;
    overflow.right += o.x;
  }
  return overflow;
};

/** popper `computeAutoPlacement`. */
const autoPlacements = (
  input: AnchoredPlacementInput,
  placement: Placement,
  flipVariations: boolean,
  padding?: number | Partial<Sides>,
) => {
  const v = variation(placement);
  const candidates = v
    ? flipVariations
      ? VARIATION_PLACEMENTS
      : VARIATION_PLACEMENTS.filter((p) => variation(p) === v)
    : (BASES as Placement[]);
  const scored = candidates.map(
    (p) =>
      [
        p,
        detectOverflow(input, p, padding, input.autoBoundary ?? input.boundary)[basePlacement(p) as BasePlacement],
      ] as const,
  );
  return [...scored].sort((a, b) => a[1] - b[1]).map(([p]) => p);
};

/** popper `flip`. */
const flip = (input: AnchoredPlacementInput, preferred: Placement): Placement => {
  const options = input.flip || {};
  const flipVariations = options.flipVariations ?? true;
  const checkAltAxis = options.altAxis ?? true;
  const base = basePlacement(preferred);
  const isBase = base === preferred;
  const fallbacks =
    options.fallbackPlacements ??
    (isBase || !flipVariations
      ? [oppositePlacement(preferred)]
      : base === 'auto'
        ? []
        : [
            oppositeVariation(preferred),
            oppositePlacement(preferred),
            oppositeVariation(oppositePlacement(preferred)),
          ]);
  const placements = [preferred, ...fallbacks].flatMap((p) =>
    basePlacement(p) === 'auto' ? autoPlacements(input, p, flipVariations, options.padding) : [p],
  );
  const checksMap = new Map<Placement, boolean[]>();
  for (const placement of placements) {
    const b = basePlacement(placement) as BasePlacement;
    const isStart = variation(placement) === 'start';
    const isVertical = b === 'top' || b === 'bottom';
    const len = isVertical ? 'width' : 'height';
    const overflow = detectOverflow(input, placement, options.padding, input.flipBoundary);
    let mainVariationSide: BasePlacement = isVertical ? (isStart ? 'right' : 'left') : isStart ? 'bottom' : 'top';
    if (input.reference[len] > input.floating[len]) mainVariationSide = OPPOSITE[mainVariationSide] as BasePlacement;
    const altVariationSide = OPPOSITE[mainVariationSide] as BasePlacement;
    const checks = [overflow[b] <= 0];
    if (checkAltAxis) checks.push(overflow[mainVariationSide] <= 0, overflow[altVariationSide] <= 0);
    if (checks.every(Boolean)) return placement;
    checksMap.set(placement, checks);
  }
  for (let n = flipVariations ? 3 : 1; n > 0; n--) {
    const fitting = placements.find((p) => checksMap.get(p)?.slice(0, n).every(Boolean));
    if (fitting) return fitting;
  }
  return placements[0];
};

/** popper `preventOverflow` (mainAxis always, altAxis optional), applied to `at` for `placement`. */
const preventOverflow = (input: AnchoredPlacementInput, placement: Placement, at: Point): Point => {
  const options = input.preventOverflow || {};
  const tether = options.tether ?? true;
  const tetherOffset = options.tetherOffset ?? 0;
  const overflow = detectOverflow(input, placement, options.padding, input.preventOverflowBoundary);
  const base = basePlacement(placement) as BasePlacement;
  const v = variation(placement);
  const isBase = !v;
  const mainAxis = mainAxisOf(base);
  const altAxis = mainAxis === 'x' ? 'y' : 'x';
  const { reference, floating } = input;
  const offsetValue = input.offset ? offsetFor(placement, input.offset) : { x: 0, y: 0 };
  const out = { ...at };

  const mainSide = mainAxis === 'y' ? 'top' : 'left';
  const altSide = mainAxis === 'y' ? 'bottom' : 'right';
  const len = mainAxis === 'y' ? 'height' : 'width';
  const offset = at[mainAxis];
  const min = offset + overflow[mainSide];
  const max = offset - overflow[altSide];
  const additive = tether ? -floating[len] / 2 : 0;
  const minLen = v === 'start' ? reference[len] : floating[len];
  const maxLen = v === 'start' ? -floating[len] : -reference[len];
  const arrowLenRaw = tether && input.arrow ? input.arrow[len] : 0;
  const arrowPadding = tether && input.arrow ? (input.arrow.padding ?? 0) : 0;
  const arrowLen = within(0, reference[len], arrowLenRaw);
  const minOffset = isBase
    ? reference[len] / 2 - additive - arrowLen - arrowPadding - tetherOffset
    : minLen - arrowLen - arrowPadding - tetherOffset;
  const maxOffset = isBase
    ? -reference[len] / 2 + additive + arrowLen + arrowPadding + tetherOffset
    : maxLen + arrowLen + arrowPadding + tetherOffset;
  const tetherMin = offset + minOffset - offsetValue[mainAxis];
  const tetherMax = offset + maxOffset - offsetValue[mainAxis];
  out[mainAxis] = within(tether ? Math.min(min, tetherMin) : min, offset, tether ? Math.max(max, tetherMax) : max);

  if (options.altAxis) {
    const mainSide2 = mainAxis === 'x' ? 'top' : 'left';
    const altSide2 = mainAxis === 'x' ? 'bottom' : 'right';
    const offset2 = at[altAxis];
    const len2 = altAxis === 'y' ? 'height' : 'width';
    const min2 = offset2 + overflow[mainSide2];
    const max2 = offset2 - overflow[altSide2];
    const isOriginSide = base === 'top' || base === 'left';
    const tetherMin2 = isOriginSide
      ? min2
      : offset2 - reference[len2] - floating[len2] - offsetValue[altAxis] + tetherOffset;
    const tetherMax2 = isOriginSide
      ? offset2 + reference[len2] + floating[len2] - offsetValue[altAxis] - tetherOffset
      : max2;
    if (tether && isOriginSide) {
      const clamped = within(tetherMin2, offset2, tetherMax2);
      out[altAxis] = Math.min(clamped, tetherMax2);
    } else {
      out[altAxis] = within(tether ? tetherMin2 : min2, offset2, tether ? tetherMax2 : max2);
    }
  }
  return out;
};

/** popper `arrow` modifier. */
const arrowOffset = (input: AnchoredPlacementInput, placement: Placement, at: Point) => {
  const arrow = input.arrow as NonNullable<AnchoredPlacementInput['arrow']>;
  const base = basePlacement(placement);
  const axis = mainAxisOf(base);
  const len = base === 'left' || base === 'right' ? 'height' : 'width';
  const { reference, floating } = input;
  const padding = arrow.padding ?? 0;
  const endDiff = reference[len] + reference[axis] - at[axis] - floating[len];
  const startDiff = at[axis] - reference[axis];
  const clientSize = (len === 'width' ? arrow.clientWidth : arrow.clientHeight) ?? floating[len];
  const centerToReference = endDiff / 2 - startDiff / 2;
  const center = clientSize / 2 - arrow[len] / 2 + centerToReference;
  const offset = within(padding, center, clientSize - arrow[len] - padding);
  return { [axis]: offset, centerOffset: offset - center } as { x?: number; y?: number; centerOffset: number };
};

/** popper `hide` modifier: is the reference fully clipped, has the floating element escaped the reference's box. */
const hideData = (input: AnchoredPlacementInput, placement: Placement, prevented: Point) => {
  const b = input.referenceBoundary ?? input.boundary;
  const ref = input.clientReference ?? input.reference;
  const referenceOverflow: Sides = {
    top: b.y - ref.y,
    bottom: ref.y + ref.height - (b.y + b.height),
    left: b.x - ref.x,
    right: ref.x + ref.width - (b.x + b.width),
  };
  const popperOverflow = detectOverflow(input, placement, 0, b);
  const sideOffsets = (o: Sides, size: Size, p: Point) => ({
    top: o.top - size.height - p.y,
    right: o.right - size.width + p.x,
    bottom: o.bottom - size.height + p.y,
    left: o.left - size.width - p.x,
  });
  const anyClipped = (o: Sides) => [o.top, o.right, o.bottom, o.left].some((v) => v >= 0);
  return {
    isReferenceHidden: anyClipped(sideOffsets(referenceOverflow, input.reference, { x: 0, y: 0 })),
    hasPopperEscaped: anyClipped(sideOffsets(popperOverflow, input.floating, prevented)),
  };
};

/** The floating element's top-left (viewport coordinates) and final placement, as popper.js computes them. */
export const anchoredPlacement = (input: AnchoredPlacementInput): AnchoredPlacementResult => {
  let placement = input.placement ?? 'bottom';
  // popper resolves `auto` inside flip; without flip it keeps the raw placement (offsets at the reference origin).
  if (input.flip !== false) placement = flip(input, placement);
  const base = computeOffsets(input.reference, input.floating, placement);
  const o = offsetFor(placement, input.offset);
  let at = { x: base.x + o.x, y: base.y + o.y };
  const beforePrevent = at;
  if (input.preventOverflow !== false) at = preventOverflow(input, placement, at);
  const result: AnchoredPlacementResult = {
    x: at.x,
    y: at.y,
    placement: placement as AnchoredPlacementResult['placement'],
  };
  if (input.arrow) result.arrow = arrowOffset(input, placement, at);
  if (input.hide !== false)
    result.hide = hideData(input, placement, { x: at.x - beforePrevent.x, y: at.y - beforePrevent.y });
  return result;
};

export const PLACEMENTS = ALL_PLACEMENTS;
