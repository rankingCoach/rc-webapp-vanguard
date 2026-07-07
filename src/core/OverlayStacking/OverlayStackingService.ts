/**
 * Single source of truth for overlay z-index allocation.
 *
 * Every surface that paints into the shared stacking context — modals,
 * popovers, drawers — claims a slot here on open and releases it on close.
 * Slots are dense integers starting at 1; z-index is `base + order`, where
 * `base` defaults to `OVERLAY_BASE_Z_INDEX`. Freed slots compact naturally
 * because we always assign `max(orders) + 1`, so once the stack drains the
 * counter returns to 1.
 *
 * The `base` can be raised via `register(id, kind, baseZIndex)`. This is the
 * escape hatch for surfaces that must paint above content we don't control —
 * e.g. a drawer that has to cover a 3rd-party widget injected at an arbitrarily
 * high z-index. The raised floor is *sticky*: the effective base of every
 * register is `max(current floor, baseZIndex)`, where the current floor is the
 * highest base still in the ledger. So once an overlay opens at base 9000,
 * subsequent overlays continue stacking from 9000 without re-passing it, and
 * the floor only falls back to `OVERLAY_BASE_Z_INDEX` once every overlay
 * holding the higher base has closed. The order counter is unaffected, so
 * z-indexes stay strictly monotonic with open order:
 *
 *   register(d1, 'drawer')        -> 1101   (floor 1100, order 1)
 *   register(m2, 'modal')         -> 1102   (floor 1100, order 2)
 *   register(d3, 'drawer', 9000)  -> 9003   (floor 9000, order 3)
 *   register(m4, 'modal')         -> 9004   (floor inherited 9000, order 4)
 *
 * Kinds are tracked so callers can ask "what's the topmost <kind>" without
 * having to keep their own parallel maps.
 */
export const OVERLAY_BASE_Z_INDEX = 1100;

export type OverlayKind = 'modal' | 'popover' | 'drawer';

class OverlayStackingServiceClass {
  private order = new Map<string, number>();
  private kind = new Map<string, OverlayKind>();
  private base = new Map<string, number>();

  /**
   * Assign the next slot above all currently-mounted overlays and return its
   * z-index.
   *
   * @param baseZIndex Floor to stack this overlay from. Defaults to
   * `OVERLAY_BASE_Z_INDEX`. Pass a higher value to force the overlay above
   * content outside the ledger (e.g. injected 3rd-party widgets). The raised
   * floor is sticky — the effective base is `max(current floor, baseZIndex)`,
   * so later overlays keep stacking from it until the stack drains.
   */
  register(id: string, kind: OverlayKind, baseZIndex: number = OVERLAY_BASE_Z_INDEX): number {
    const o = this.getMaxOrder() + 1;
    const base = Math.max(this.getCurrentFloor(), baseZIndex);
    this.order.set(id, o);
    this.kind.set(id, kind);
    this.base.set(id, base);
    return base + o;
  }

  /** Free the slot. The next opener will reuse the now-vacated topmost order. */
  unregister(id: string): void {
    this.order.delete(id);
    this.kind.delete(id);
    this.base.delete(id);
  }

  /** Slot order for an id, or 0 if not registered. */
  getOrder(id: string): number {
    return this.order.get(id) ?? 0;
  }

  /**
   * Resolved z-index (`base + order`) for an id. Unknown ids fall back to the
   * stacking floor. Use this instead of recomputing `OVERLAY_BASE_Z_INDEX +
   * order` so per-overlay base overrides are honored.
   */
  getZIndex(id: string): number {
    return (this.base.get(id) ?? OVERLAY_BASE_Z_INDEX) + this.getOrder(id);
  }

  /**
   * Topmost z-index across all overlays, or — when `kind` is supplied — the
   * topmost z within that kind only. Returns `OVERLAY_BASE_Z_INDEX` (the
   * stacking floor) when nothing of the requested kind is registered.
   */
  getTopmostZIndex(kind?: OverlayKind): number {
    let max = OVERLAY_BASE_Z_INDEX;
    this.order.forEach((_o, id) => {
      if (kind && this.kind.get(id) !== kind) return;
      const z = this.getZIndex(id);
      if (z > max) max = z;
    });
    return max;
  }

  /** Test-only: wipe internal state. Not for production code paths. */
  __resetForTests(): void {
    this.order.clear();
    this.kind.clear();
    this.base.clear();
  }

  /**
   * Highest base still held by a registered overlay, or the default floor when
   * none is registered. This is what makes a raised base "sticky" across
   * subsequent registers and lets the floor fall back once the stack drains.
   */
  private getCurrentFloor(): number {
    let floor = OVERLAY_BASE_Z_INDEX;
    this.base.forEach((b) => {
      if (b > floor) floor = b;
    });
    return floor;
  }

  private getMaxOrder(kind?: OverlayKind): number {
    let max = 0;
    this.order.forEach((o, id) => {
      if (kind && this.kind.get(id) !== kind) return;
      if (o > max) max = o;
    });
    return max;
  }
}

export const OverlayStackingService = new OverlayStackingServiceClass();
