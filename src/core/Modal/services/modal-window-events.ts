import { OverlayStackingService } from '../../OverlayStacking/OverlayStackingService';

/** Opaque consumer-owned values. Vanguard never reads or navigates a route. */
export type ModalWindowMetadata = Readonly<Record<string, unknown>>;
export type ModalWindow = Readonly<{ id: string; metadata: ModalWindowMetadata }>;
export type ModalWindowEvent =
  | {
      type: 'activated';
      window: ModalWindow;
      previousWindowId: string | null;
      reason: 'open' | 'focus' | 'dock' | 'close';
    }
  | { type: 'closed'; window: ModalWindow; wasActive: boolean; activeWindow: ModalWindow | null }
  | { type: 'metadataChanged'; window: ModalWindow; isActive: boolean };

export type ModalWindowActivationReason = Extract<ModalWindowEvent, { type: 'activated' }>['reason'];

const topmost = (windows: Iterable<ModalWindow>) =>
  [...windows].sort((a, b) => OverlayStackingService.getZIndex(b.id) - OverlayStackingService.getZIndex(a.id))[0];

export class ModalWindowEvents {
  private windows = new Map<string, ModalWindow>();
  private activeWindowId: string | null = null;
  private listeners = new Set<(event: ModalWindowEvent) => void>();

  /** No initial event; read getActive()/getWindows() after subscribing. */
  subscribe(listener: (event: ModalWindowEvent) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getWindows(): ModalWindow[] {
    return [...this.windows.values()];
  }
  getWindow(id: string): ModalWindow | undefined {
    return this.windows.get(id);
  }
  getActive(): ModalWindow | null {
    return this.activeWindowId ? (this.windows.get(this.activeWindowId) ?? null) : null;
  }

  register(id: string, metadata: ModalWindowMetadata) {
    this.windows.set(id, Object.freeze({ id, metadata: Object.freeze({ ...metadata }) }));
  }

  /** Replace metadata on an already opted-in window, without changing its focus or presentation. */
  setMetadata(id: string, metadata: ModalWindowMetadata) {
    if (!this.windows.has(id)) return;
    const modalWindow = Object.freeze({ id, metadata: Object.freeze({ ...metadata }) });
    this.windows.set(id, modalWindow);
    this.emit({ type: 'metadataChanged', window: modalWindow, isActive: id === this.activeWindowId });
  }

  syncActive(reason: ModalWindowActivationReason) {
    if (!this.windows.size && this.activeWindowId === null) return;
    const modalWindow = topmost(this.windows.values());
    const previousWindowId = this.activeWindowId;
    this.activeWindowId = modalWindow?.id ?? null;
    if (modalWindow && previousWindowId !== modalWindow.id)
      this.emit({ type: 'activated', window: modalWindow, previousWindowId, reason });
  }

  /** Call after the overlay slot is unregistered so the replacement is computed without it. */
  handleRemoved(id: string) {
    const closedWindow = this.windows.get(id);
    const wasActive = this.activeWindowId === id;
    this.windows.delete(id);
    if (closedWindow) {
      // Close first, then announce any replacement. The close event already carries
      // the replacement so consumers never need to clear the URL between windows.
      const activeWindow = topmost(this.windows.values()) ?? null;
      this.activeWindowId = activeWindow?.id ?? null;
      this.emit({ type: 'closed', window: closedWindow, wasActive, activeWindow });
      if (wasActive && activeWindow && this.activeWindowId === activeWindow.id) {
        this.emit({ type: 'activated', window: activeWindow, previousWindowId: id, reason: 'close' });
      }
    }
  }

  reset() {
    this.windows.clear();
    this.activeWindowId = null;
    this.listeners.clear();
  }

  private emit(event: ModalWindowEvent) {
    for (const listener of [...this.listeners]) {
      try {
        listener(event);
      } catch (error) {
        console.error('Modal window listener failed', error);
      }
    }
  }
}
