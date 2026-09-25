import { PUB_SUB_EVENTS, pubSubService } from '@helpers/pub-sub';

import { OverlayStackingService } from '../../OverlayStacking/OverlayStackingService';
import type { ModalWindowEvents } from './modal-window-events';
import type { PresentationStore } from './presentation-store';

/** Read/close access to the stored modal components owned by ModalService. */
export type ModalRegistry = {
  get(id: string): any;
  ids(): string[];
  forEach(callback: (component: any, id: string) => void): void;
  close(id: string): void;
};

/** Compact-window queries the stack needs; late-bound to avoid a construction cycle. */
export type CompactWindowPort = {
  isCompactWindowControlsEnabled(): boolean;
  isCompactWindowDetached(id: string): boolean;
  canManageCompactWindow(id: string): boolean;
  groupKey(id?: string): string;
  focusCompactWindow(id: string): void;
};

export class BamStack {
  private stackingEnabled = false;
  private compactMode = false;
  private maxStackSize: number | undefined;
  private stackEvictions = new Set<string>();
  private compactWindows!: CompactWindowPort;

  constructor(
    private registry: ModalRegistry,
    private presentation: PresentationStore,
    private windowEvents: ModalWindowEvents,
  ) {}

  attachCompactWindows(compactWindows: CompactWindowPort) {
    this.compactWindows = compactWindows;
  }

  isStackingEnabled() {
    return this.stackingEnabled;
  }
  isCompactMode() {
    return this.compactMode;
  }

  /** Silent opt-in used by compact-window gestures; callers enforce and notify. */
  enableStacking() {
    this.stackingEnabled = true;
  }

  getBamIds() {
    return this.registry
      .ids()
      .filter((id) => this.registry.get(id)?.isFullscreen)
      .sort((a, b) => OverlayStackingService.getZIndex(a) - OverlayStackingService.getZIndex(b));
  }

  /** All attached BAMs, or only the stack containing a specified BAM. */
  getStackedBamIds(modalId?: string) {
    const ids = this.getBamIds().filter((id) => !this.compactWindows.isCompactWindowDetached(id));
    if (!modalId || !this.compactWindows.isCompactWindowControlsEnabled() || !this.compactMode) return ids;
    if (this.compactWindows.isCompactWindowDetached(modalId)) return [];
    const key = this.compactWindows.groupKey(modalId);
    return ids.filter((id) => this.compactWindows.groupKey(id) === key);
  }

  /** Maximum attached BAMs. Omit/undefined/null restores unlimited stacking. */
  setMaxStackSize(max?: number | null) {
    if (max !== null && max !== undefined && (!Number.isInteger(max) || max < 1)) {
      throw new RangeError('Maximum BAM stack size must be a positive integer.');
    }
    this.maxStackSize = max ?? undefined;
    this.enforceStackLimit();
  }

  getMaxStackSize() {
    return this.maxStackSize;
  }

  enforceStackLimit() {
    if (!this.stackingEnabled || this.maxStackSize === undefined) return;
    const ids = this.getStackedBamIds().filter((id) => !this.stackEvictions.has(id));
    const groups = new Map<string, string[]>();
    for (const id of ids) {
      const key =
        this.compactWindows.isCompactWindowControlsEnabled() && this.compactMode
          ? this.compactWindows.groupKey(id)
          : 'default';
      const members = groups.get(key) ?? [];
      members.push(id);
      groups.set(key, members);
    }
    const closing = [...groups.values()].flatMap((members) =>
      members.slice(0, Math.max(0, members.length - this.maxStackSize!)),
    );
    // Reserve the entire batch before callbacks, which may themselves open windows.
    closing.forEach((id) => this.stackEvictions.add(id));
    for (const id of closing) {
      this.registry.close(id);
    }
  }

  /** Enable/disable the shared compact presentation for ALL fullscreen BAMs. */
  setCompactMode(enabled: boolean) {
    this.compactMode = enabled;
    this.registry.forEach((component, id) => {
      if (component.isFullscreen || component.props.allowCompact) this.setCompact(id, enabled);
    });
    this.enforceStackLimit();
    this.presentation.notify();
  }

  /** Opt into the visual card stack. Disabled by default. */
  setStackingEnabled(enabled: boolean) {
    this.stackingEnabled = enabled;
    this.enforceStackLimit();
    this.presentation.notify();
  }

  /** Fullscreen Modal reports its actual presentation, even through consumer wrappers. */
  registerFullscreen(modalId: string, fullscreen: boolean) {
    const component = this.registry.get(modalId);
    if (!component || component.isFullscreen === fullscreen) return;
    component.isFullscreen = fullscreen;
    if (fullscreen && this.compactMode) this.setCompact(modalId, true);
    if (!fullscreen && !component.props.allowCompact) this.setCompact(modalId, false);
    this.enforceStackLimit();
    this.presentation.notify();
  }

  /** Promote within the BAM stack; unrelated dialogs/drawers retain their overlay slots. */
  bringToFront(modalId: string) {
    if (!this.stackingEnabled) return;
    if (this.compactWindows.canManageCompactWindow(modalId)) {
      this.compactWindows.focusCompactWindow(modalId);
      return;
    }
    const ids = this.getBamIds();
    if (!ids.includes(modalId) || ids.at(-1) === modalId) return;
    OverlayStackingService.reorder([...ids.filter((id) => id !== modalId), modalId]);
    this.windowEvents.syncActive('focus');
    this.presentation.notify();
  }

  /** Consumer control: compact the entire BAM group. */
  compact(modalId?: string | null) {
    if (modalId && this.registry.get(modalId)?.props.allowCompact) this.setCompactMode(true);
  }

  /** Consumer control: expand the entire BAM group. */
  expand(modalId?: string | null) {
    if (modalId && this.registry.get(modalId)?.props.allowCompact) this.setCompactMode(false);
  }

  handleRemoved(id: string) {
    this.stackEvictions.delete(id);
  }

  reset() {
    this.maxStackSize = undefined;
    this.stackEvictions.clear();
    this.compactMode = false;
    this.stackingEnabled = false;
  }

  private setCompact(modalId: string, isCompact: boolean) {
    const component = this.registry.get(modalId);
    if (!component || Boolean(component.isCompact) === isCompact) return;
    component.compactManaged = true;
    component.isCompact = isCompact;
    pubSubService.$pub(PUB_SUB_EVENTS.reactModalCompactChange, { modalId, isCompact });
  }
}
