import type { AnchoredPlacementInput, Placement } from '../../core/anchored-placement';

/* eslint-disable @typescript-eslint/no-explicit-any */

/** A popper.js modifier entry as MUI Popper callers pass it (`modifiers` / `popperOptions.modifiers`). */
export interface PopperModifierLike {
  name: string;
  enabled?: boolean;
  phase?: string;
  fn?: unknown;
  options?: Record<string, any>;
}

/** The popper.js modifiers the own core models (plan §27); anything else keeps the component on MUI Popper. */
const MODELLED = new Set(['offset', 'flip', 'preventOverflow', 'arrow', 'computeStyles', 'eventListeners', 'hide']);

export interface ResolvedPopperOptions {
  supported: boolean;
  /** Names that are not modelled (dev diagnostics; the caller falls back to MUI Popper). */
  unsupported: string[];
  placement: Placement;
  strategy: 'absolute' | 'fixed';
  input: Omit<AnchoredPlacementInput, 'reference' | 'floating' | 'boundary' | 'arrow'> & {
    arrow?: { element: Element | null; padding?: number };
  };
  computeStyles: { gpuAcceleration: boolean; adaptive: boolean; roundOffsets: boolean };
}

/**
 * Translates MUI Popper props into anchoredPlacement input with popper.js's precedence: MUI's own
 * preventOverflow/flip entries first, then `modifiers`, then `popperOptions.modifiers` (later entries with the same
 * name merge over earlier ones, as popper's mergeByName does).
 */
export const resolvePopperOptions = (props: {
  placement?: Placement;
  modifiers?: PopperModifierLike[] | null;
  popperOptions?: { placement?: Placement; strategy?: 'absolute' | 'fixed'; modifiers?: PopperModifierLike[] } | null;
  disablePortal?: boolean;
}): ResolvedPopperOptions => {
  const all: PopperModifierLike[] = [
    { name: 'preventOverflow', options: { altBoundary: Boolean(props.disablePortal) } },
    { name: 'flip', options: { altBoundary: Boolean(props.disablePortal) } },
    ...(props.modifiers ?? []),
    ...(props.popperOptions?.modifiers ?? []),
  ];
  const merged = new Map<string, PopperModifierLike>();
  for (const m of all) {
    const prev = merged.get(m.name);
    merged.set(m.name, prev ? { ...prev, ...m, options: { ...prev.options, ...m.options } } : m);
  }
  const unsupported = [...merged.values()]
    .filter((m) => m.enabled !== false && (!MODELLED.has(m.name) || m.fn !== undefined))
    .map((m) => m.name);
  // Function-valued options (offset/padding callbacks) and boundaries other than the viewport are not modelled.
  for (const m of merged.values()) {
    if (m.enabled === false || !m.options) continue;
    if (Object.values(m.options).some((v) => typeof v === 'function')) unsupported.push(`${m.name}(function option)`);
    if (m.options.boundary !== undefined && m.options.boundary !== 'clippingParents')
      unsupported.push(`${m.name}.boundary`);
    if (m.options.rootBoundary !== undefined && m.options.rootBoundary !== 'viewport')
      unsupported.push(`${m.name}.rootBoundary`);
  }
  const opts = (name: string) => (merged.get(name)?.enabled === false ? false : (merged.get(name)?.options ?? {}));
  const flip = opts('flip');
  const prevent = opts('preventOverflow');
  const offset = opts('offset');
  const arrow = opts('arrow');
  const cs = opts('computeStyles') || {};
  return {
    supported: unsupported.length === 0,
    unsupported,
    placement: props.popperOptions?.placement ?? props.placement ?? 'bottom',
    strategy: props.popperOptions?.strategy ?? 'absolute',
    input: {
      offset: offset && Array.isArray(offset.offset) ? (offset.offset as [number, number]) : undefined,
      flip:
        flip === false
          ? false
          : {
              padding: flip.padding,
              fallbackPlacements: flip.fallbackPlacements,
              flipVariations: flip.flipVariations,
              altAxis: flip.altAxis,
            },
      preventOverflow:
        prevent === false
          ? false
          : {
              padding: prevent.padding,
              altAxis: prevent.altAxis,
              tether: prevent.tether,
              tetherOffset: prevent.tetherOffset,
            },
      arrow: arrow && arrow.element ? { element: arrow.element as Element, padding: arrow.padding } : undefined,
    },
    computeStyles: {
      gpuAcceleration: cs.gpuAcceleration ?? true,
      adaptive: cs.adaptive ?? true,
      roundOffsets: cs.roundOffsets ?? true,
    },
  };
};
