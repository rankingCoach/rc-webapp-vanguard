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

  /** Opted in with ModalOpts.allowStacking. Any other modal never joins, counts toward or reorders a stack. */
  isStackable(modalId: string) {
    return !!this.registry.get(modalId)?.props.allowStacking;
  }

  /** All attached stackable BAMs, or only the stack containing a specified BAM; a BAM without allowStacking is alone. */
  getStackedBamIds(modalId?: string) {
    const bamIds = this.getBamIds();
    const ids = bamIds.filter((id) => this.isStackable(id) && !this.compactWindows.isCompactWindowDetached(id));
    if (!modalId) return ids;
    if (!this.isStackable(modalId)) return bamIds.includes(modalId) ? [modalId] : [];
    if (this.compactWindows.isCompactWindowDetached(modalId)) return [];
    const key = this.stackKey(modalId);
    return ids.filter((id) => this.stackKey(id) === key);
  }

  /** Where a modal renders in its stack; inactive stacked cards and background tabs are not presented. */
  getStackPlacement(modalId: string) {
    const bamIds = this.getStackedBamIds(modalId);
    const index = bamIds.indexOf(modalId);
    const stacked = this.stackingEnabled && index >= 0 && bamIds.length > 1;
    const active = !stacked || index === bamIds.length - 1;
    return { bamIds, index, stacked, active };
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
      const key = this.stackKey(id);
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

  /** Enable/disable the shared compact presentation for every modal opened with allowCompact. */
  setCompactMode(enabled: boolean) {
    this.compactMode = enabled;
    this.registry.forEach((component, id) => {
      if (component.props.allowCompact) this.setCompact(id, enabled);
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
    // Reorder only the modal's own stack, so compact windows and unstacked BAMs above it keep their slots.
    const ids = this.getStackedBamIds(modalId);
    if (!ids.includes(modalId) || ids.at(-1) === modalId) return;
    OverlayStackingService.reorder([...ids.filter((id) => id !== modalId), modalId]);
    this.windowEvents.syncActive('focus');
    this.presentation.notify();
  }

  /** Consumer control: compact every allowCompact modal. */
  compact(modalId?: string | null) {
    if (modalId && this.registry.get(modalId)?.props.allowCompact) this.setCompactMode(true);
  }

  /** Consumer control: expand every allowCompact modal. */
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

  /** Among stackable BAMs: compact windows and expanded BAMs never share a stack; compact windows split by docked group. */
  private stackKey(id: string) {
    if (!this.registry.get(id)?.isCompact) return 'expanded';
    return this.compactWindows.isCompactWindowControlsEnabled()
      ? `compact:${this.compactWindows.groupKey(id)}`
      : 'compact';
  }

  private setCompact(modalId: string, isCompact: boolean) {
    const component = this.registry.get(modalId);
    if (!component || Boolean(component.isCompact) === isCompact) return;
    component.compactManaged = true;
    component.isCompact = isCompact;
    pubSubService.$pub(PUB_SUB_EVENTS.reactModalCompactChange, { modalId, isCompact });
  }
}
