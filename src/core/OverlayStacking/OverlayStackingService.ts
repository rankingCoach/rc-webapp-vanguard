/**
 * Single source of truth for overlay z-index allocation.
 *
 * Every surface that paints into the shared stacking context — modals,
 * popovers, drawers — claims a slot here on open and releases it on close.
 * Slots are dense integers starting at 1; z-index is `OVERLAY_BASE_Z_INDEX +
 * order`. Freed slots compact naturally because we always assign
 * `max(orders) + 1`, so once the stack drains the counter returns to 1.
 *
 * Kinds are tracked so callers can ask "what's the topmost <kind>" without
 * having to keep their own parallel maps.
 */
export const OVERLAY_BASE_Z_INDEX = 1100;

export type OverlayKind = 'modal' | 'popover' | 'drawer';

class OverlayStackingServiceClass {
  private order = new Map<string, number>();
  private kind = new Map<string, OverlayKind>();

  /** Assign the next slot above all currently-mounted overlays and return its z-index. */
  register(id: string, kind: OverlayKind): number {
    const o = this.getMaxOrder() + 1;
    this.order.set(id, o);
    this.kind.set(id, kind);
    return OVERLAY_BASE_Z_INDEX + o;
  }

  /** Free the slot. The next opener will reuse the now-vacated topmost order. */
  unregister(id: string): void {
    this.order.delete(id);
    this.kind.delete(id);
  }

  /** Slot order for an id, or 0 if not registered. */
  getOrder(id: string): number {
    return this.order.get(id) ?? 0;
  }

  /**
   * Topmost z-index across all overlays, or — when `kind` is supplied — the
   * topmost z within that kind only. Returns `OVERLAY_BASE_Z_INDEX` (the
   * stacking floor) when nothing of the requested kind is registered.
   */
  getTopmostZIndex(kind?: OverlayKind): number {
    return OVERLAY_BASE_Z_INDEX + this.getMaxOrder(kind);
  }

  /** Test-only: wipe internal state. Not for production code paths. */
  __resetForTests(): void {
    this.order.clear();
    this.kind.clear();
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
