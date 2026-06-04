import { beforeEach, describe, expect, it } from 'vitest';

import { OVERLAY_BASE_Z_INDEX, OverlayStackingService } from './OverlayStackingService';

const BASE = OVERLAY_BASE_Z_INDEX;

describe('OverlayStackingService.register / unregister', () => {
  beforeEach(() => {
    OverlayStackingService.__resetForTests();
  });

  it('assigns slot 1 (z = BASE + 1) to the first overlay', () => {
    expect(OverlayStackingService.register('a', 'modal')).toBe(BASE + 1);
  });

  it('increments per call so newer overlays paint above older ones', () => {
    OverlayStackingService.register('a', 'modal');
    OverlayStackingService.register('b', 'popover');
    expect(OverlayStackingService.register('c', 'drawer')).toBe(BASE + 3);
  });

  it('reuses the freed topmost slot — orders compact downward', () => {
    OverlayStackingService.register('a', 'modal'); // 1
    OverlayStackingService.register('b', 'modal'); // 2
    OverlayStackingService.unregister('b');
    expect(OverlayStackingService.register('c', 'modal')).toBe(BASE + 2);
  });

  it('a non-topmost unregister does NOT lower the topmost — next opener slots above the current max', () => {
    const a = 'a';
    OverlayStackingService.register(a, 'modal'); // 1
    OverlayStackingService.register('b', 'modal'); // 2
    OverlayStackingService.register('c', 'modal'); // 3
    OverlayStackingService.unregister(a);
    expect(OverlayStackingService.register('d', 'modal')).toBe(BASE + 4);
  });

  it('falls back to BASE when all overlays close', () => {
    OverlayStackingService.register('a', 'modal');
    OverlayStackingService.register('b', 'modal');
    OverlayStackingService.unregister('a');
    OverlayStackingService.unregister('b');
    expect(OverlayStackingService.getTopmostZIndex()).toBe(BASE);
  });
});

describe('OverlayStackingService.getTopmostZIndex', () => {
  beforeEach(() => {
    OverlayStackingService.__resetForTests();
  });

  it('returns BASE when nothing is registered', () => {
    expect(OverlayStackingService.getTopmostZIndex()).toBe(BASE);
  });

  it('without kind: returns the max across all kinds', () => {
    OverlayStackingService.register('m', 'modal'); // 1
    OverlayStackingService.register('p', 'popover'); // 2
    OverlayStackingService.register('d', 'drawer'); // 3
    expect(OverlayStackingService.getTopmostZIndex()).toBe(BASE + 3);
  });

  it('with kind: ignores other kinds and reports the max within the requested one', () => {
    OverlayStackingService.register('m1', 'modal'); // 1
    OverlayStackingService.register('p1', 'popover'); // 2
    OverlayStackingService.register('m2', 'modal'); // 3
    OverlayStackingService.register('p2', 'popover'); // 4
    expect(OverlayStackingService.getTopmostZIndex('modal')).toBe(BASE + 3);
    expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(BASE + 4);
    expect(OverlayStackingService.getTopmostZIndex('drawer')).toBe(BASE);
  });

  it('handles a deep stack of 10 without gaps', () => {
    const ids: string[] = [];
    for (let i = 0; i < 10; i++) {
      const id = `m${i}`;
      ids.push(id);
      OverlayStackingService.register(id, 'modal');
    }
    expect(OverlayStackingService.getTopmostZIndex()).toBe(BASE + 10);

    for (let i = 9; i >= 0; i--) {
      expect(OverlayStackingService.getTopmostZIndex()).toBe(BASE + i + 1);
      OverlayStackingService.unregister(ids[i]);
    }
    expect(OverlayStackingService.getTopmostZIndex()).toBe(BASE);
  });
});

describe('OverlayStackingService.getOrder', () => {
  beforeEach(() => {
    OverlayStackingService.__resetForTests();
  });

  it('returns 0 for an unknown id', () => {
    expect(OverlayStackingService.getOrder('nope')).toBe(0);
  });

  it('returns the assigned order for a registered overlay', () => {
    OverlayStackingService.register('a', 'modal');
    OverlayStackingService.register('b', 'modal');
    expect(OverlayStackingService.getOrder('b')).toBe(2);
  });

  it('returns 0 after the overlay is unregistered', () => {
    OverlayStackingService.register('a', 'modal');
    OverlayStackingService.unregister('a');
    expect(OverlayStackingService.getOrder('a')).toBe(0);
  });
});

// Mixed-kind interactions — these encode the original VAN-52 invariant: a
// modal opened AFTER a popover must paint above it (so the new modal covers
// the stale popover), and unregistering a popover frees its slot for reuse.
describe('OverlayStackingService — mixed-kind stacking', () => {
  beforeEach(() => {
    OverlayStackingService.__resetForTests();
  });

  it('a modal opened after a popover slots above the popover', () => {
    OverlayStackingService.register('host', 'modal'); // 1
    OverlayStackingService.register('p', 'popover'); // 2
    OverlayStackingService.register('overlay', 'modal'); // 3
    expect(OverlayStackingService.getOrder('overlay')).toBe(3);
  });

  it('unregistering a popover frees the slot for the next overlay (any kind)', () => {
    OverlayStackingService.register('p', 'popover'); // 1
    OverlayStackingService.unregister('p');
    expect(OverlayStackingService.register('m', 'modal')).toBe(BASE + 1);
  });

  it('drawer registered above modal — topmost("modal") still reports the modal', () => {
    OverlayStackingService.register('m', 'modal'); // 1
    OverlayStackingService.register('d', 'drawer'); // 2
    expect(OverlayStackingService.getTopmostZIndex('modal')).toBe(BASE + 1);
    expect(OverlayStackingService.getTopmostZIndex('drawer')).toBe(BASE + 2);
    expect(OverlayStackingService.getTopmostZIndex()).toBe(BASE + 2);
  });
});
