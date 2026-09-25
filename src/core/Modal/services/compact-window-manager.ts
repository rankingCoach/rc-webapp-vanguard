import { uuidv4 } from '@helpers/generate-uid';

import { OverlayStackingService } from '../../OverlayStacking/OverlayStackingService';
import type { BamStack, CompactWindowPort, ModalRegistry } from './bam-stack';
import { clampCompactWindowBounds, CompactWindowBounds, compactWindowOverlapRatio } from './compact-window-geometry';
import type { ModalWindowEvents } from './modal-window-events';
import type { PresentationStore } from './presentation-store';

export class CompactWindowManager implements CompactWindowPort {
  private controlsEnabled = false;
  private interactingCompactWindows = new Set<string>();
  private floatingWindows = new Map<string, CompactWindowBounds>();
  // Unassigned BAMs belong to the original stack; docked groups have their own identity.
  private compactWindowGroups = new Map<string, string>();
  private compactStackBounds = new Map<string, CompactWindowBounds>();
  private dockThreshold = 50;

  constructor(
    private registry: ModalRegistry,
    private stack: BamStack,
    private presentation: PresentationStore,
    private windowEvents: ModalWindowEvents,
  ) {}

  /** Scope interaction cleanup to its owner; omitted id retains the legacy shared control. */
  setCompactWindowInteracting(active: boolean, modalId = 'legacy') {
    if (!this.controlsEnabled) return;
    const wasInteracting = this.isCompactWindowInteracting();
    if (active) this.interactingCompactWindows.add(modalId);
    else this.interactingCompactWindows.delete(modalId);
    if (wasInteracting !== this.isCompactWindowInteracting()) this.presentation.notify();
  }

  isCompactWindowInteracting() {
    return this.interactingCompactWindows.size > 0;
  }

  groupKey(id?: string) {
    return id ? (this.compactWindowGroups.get(id) ?? 'default') : 'default';
  }

  /** Independent opt-in. Disabling discards custom geometry and restores the existing presentation. */
  setCompactWindowControlsEnabled(enabled: boolean) {
    if (this.controlsEnabled === enabled) return;
    this.controlsEnabled = enabled;
    if (!enabled) {
      this.interactingCompactWindows.clear();
      this.floatingWindows.clear();
      this.compactStackBounds.clear();
      this.compactWindowGroups.clear();
    }
    this.stack.enforceStackLimit();
    this.presentation.notify();
  }

  isCompactWindowControlsEnabled() {
    return this.controlsEnabled;
  }

  canManageCompactWindow(id: string) {
    const component = this.registry.get(id);
    return this.controlsEnabled && !!component?.isCompact && !!component?.isFullscreen;
  }

  isCompactWindowDetached(id: string) {
    return this.canManageCompactWindow(id) && this.floatingWindows.has(id);
  }

  /** Percentage of the smaller window covered before a drop can form a stack. */
  setCompactWindowDockThreshold(percentage: number) {
    if (Number.isFinite(percentage) && percentage > 0 && percentage <= 100) this.dockThreshold = percentage;
  }

  findCompactWindowDropTarget(id: string, candidates: { id: string; bounds: CompactWindowBounds }[], group = false) {
    if (!this.canManageCompactWindow(id)) return undefined;
    if (group && (!this.stack.isStackingEnabled() || this.isCompactWindowDetached(id))) return undefined;
    const source = group ? this.getCompactStackBounds(id) : this.floatingWindows.get(id);
    const members = new Set(group ? this.stack.getStackedBamIds(id) : [id]);
    if (!source) return undefined;
    return candidates
      .filter((candidate) => {
        if (members.has(candidate.id) || !this.canManageCompactWindow(candidate.id)) return false;
        return compactWindowOverlapRatio(source, candidate.bounds) >= this.dockThreshold / 100;
      })
      .sort((a, b) => OverlayStackingService.getZIndex(b.id) - OverlayStackingService.getZIndex(a.id))[0];
  }

  dockCompactWindow(id: string, candidates: { id: string; bounds: CompactWindowBounds }[], group = false) {
    const target = this.findCompactWindowDropTarget(id, candidates, group);
    if (!target) return;
    const sourceMembers = group ? this.stack.getStackedBamIds(id) : [id];
    const targetIsStacked = this.stack.isStackingEnabled() && !this.isCompactWindowDetached(target.id);
    const targetMembers = targetIsStacked ? this.stack.getStackedBamIds(target.id) : [target.id];
    const groupKey = targetIsStacked ? this.groupKey(target.id) : uuidv4();
    const targetBounds = targetIsStacked ? this.getCompactStackBounds(target.id) : target.bounds;

    if (!this.stack.isStackingEnabled()) {
      // Independent windows not participating in the drop must stay independent.
      for (const candidate of candidates) {
        if (
          !sourceMembers.includes(candidate.id) &&
          !targetMembers.includes(candidate.id) &&
          this.canManageCompactWindow(candidate.id)
        ) {
          this.floatingWindows.set(candidate.id, candidate.bounds);
          this.compactWindowGroups.delete(candidate.id);
        }
      }
    }
    const combined = [...targetMembers, ...sourceMembers];
    for (const member of combined) {
      this.floatingWindows.delete(member);
      this.compactWindowGroups.set(member, groupKey);
    }
    if (targetBounds)
      this.compactStackBounds.set(
        groupKey,
        clampCompactWindowBounds(targetBounds, window.innerWidth, window.innerHeight),
      );
    this.stack.enableStacking();
    // Only the participating windows change slots; other stacks keep their order and geometry.
    OverlayStackingService.reorder(combined);
    this.windowEvents.syncActive('dock');
    this.pruneGroups();
    this.stack.enforceStackLimit();
    this.presentation.notify();
  }

  getCompactWindowBounds(id: string) {
    return this.floatingWindows.get(id);
  }
  getCompactStackBounds(id?: string) {
    return this.compactStackBounds.get(this.groupKey(id));
  }

  /** Viewport changes clamp geometry without changing stack membership. */
  fitCompactWindowToViewport(id: string) {
    if (!this.canManageCompactWindow(id)) return;
    const floating = this.floatingWindows.get(id);
    const key = this.groupKey(id);
    const bounds = floating ?? this.compactStackBounds.get(key);
    if (bounds) {
      const fitted = clampCompactWindowBounds(bounds, window.innerWidth, window.innerHeight);
      if (floating) this.floatingWindows.set(id, fitted);
      else this.compactStackBounds.set(key, fitted);
    }
    this.presentation.notify();
  }

  setCompactWindowBounds(id: string, bounds: CompactWindowBounds, group = false) {
    if (!this.canManageCompactWindow(id) || !Object.values(bounds).every(Number.isFinite)) return;
    const next = clampCompactWindowBounds(bounds, window.innerWidth, window.innerHeight);
    if (group && this.stack.isStackingEnabled() && !this.floatingWindows.has(id))
      this.compactStackBounds.set(this.groupKey(id), next);
    else {
      this.floatingWindows.set(id, next);
      this.compactWindowGroups.delete(id);
      this.pruneGroups();
    }
    this.presentation.notify();
  }

  focusCompactWindow(id: string) {
    if (!this.canManageCompactWindow(id)) return;
    const ids = this.stack.getBamIds();
    const members =
      this.stack.isStackingEnabled() && !this.isCompactWindowDetached(id) ? this.stack.getStackedBamIds(id) : [id];
    const next = [...ids.filter((other) => !members.includes(other)), ...members.filter((other) => other !== id), id];
    if (next.every((other, index) => ids[index] === other)) return;
    OverlayStackingService.reorder(next);
    this.windowEvents.syncActive('focus');
    this.presentation.notify();
  }

  returnCompactWindowToStack(id: string) {
    if (!this.canManageCompactWindow(id)) return;
    this.floatingWindows.delete(id);
    this.compactWindowGroups.delete(id);
    this.pruneGroups();
    this.stack.enableStacking();
    this.focusCompactWindow(id);
    this.stack.enforceStackLimit();
    this.presentation.notify();
  }

  stackAllCompactWindows() {
    if (!this.controlsEnabled || !this.stack.isCompactMode()) return;
    this.floatingWindows.clear();
    this.compactWindowGroups.clear();
    this.pruneGroups();
    this.stack.enableStacking();
    this.stack.enforceStackLimit();
    this.presentation.notify();
  }

  handleRemoved(id: string) {
    this.interactingCompactWindows.delete(id);
    this.floatingWindows.delete(id);
    this.compactWindowGroups.delete(id);
    this.pruneGroups();
  }

  reset() {
    this.controlsEnabled = false;
    this.dockThreshold = 50;
    this.interactingCompactWindows.clear();
    this.floatingWindows.clear();
    this.compactStackBounds.clear();
    this.compactWindowGroups.clear();
  }

  private pruneGroups() {
    const used = new Set(this.compactWindowGroups.values());
    for (const key of this.compactStackBounds.keys()) {
      if (key !== 'default' && !used.has(key)) this.compactStackBounds.delete(key);
    }
  }
}
