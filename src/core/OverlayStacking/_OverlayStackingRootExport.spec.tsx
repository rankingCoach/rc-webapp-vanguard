import { afterEach, describe, expect, it, vi } from 'vitest';

// The package root pulls in lottie, which needs a real canvas that jsdom lacks.
vi.mock('lottie-web', () => ({ default: {} }));
vi.mock('lottie-web/build/player/lottie_light', () => ({ default: {} }));

import { OVERLAY_BASE_Z_INDEX, OverlayStackingService } from '../../index';
import { ModalService } from '../Modal/ModalService';
import { OverlayStackingService as InternalOverlayStackingService } from './OverlayStackingService';

// Apps import the ledger from the package root. It has to be the same object
// ModalService, Drawer and Popover use, or app overlays would not layer with them.
describe('OverlayStackingService root export', () => {
  afterEach(() => {
    ModalService.__resetForTests();
    InternalOverlayStackingService.__resetForTests();
  });

  it('is the same instance the vanguard overlays use', () => {
    expect(OverlayStackingService).toBe(InternalOverlayStackingService);
    expect(OVERLAY_BASE_Z_INDEX).toBe(1100);
  });

  it('gives an app overlay a z-index above an open ModalService modal', () => {
    const base = 2147483004;
    const modalId = ModalService.open(<div />, { baseZIndex: base });
    const modalZ = OverlayStackingService.getZIndex(modalId);

    const popupZ = OverlayStackingService.register('incoming-call', 'popover', base);

    expect(modalZ).toBeGreaterThan(base);
    expect(popupZ).toBeGreaterThan(modalZ);
    expect(OverlayStackingService.getTopmostZIndex()).toBe(popupZ);

    OverlayStackingService.unregister('incoming-call');
    expect(OverlayStackingService.getTopmostZIndex()).toBe(modalZ);
  });
});
