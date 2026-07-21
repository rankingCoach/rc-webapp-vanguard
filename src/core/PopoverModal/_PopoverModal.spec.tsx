import React from 'react';
import { afterEach, describe, expect, test } from 'vitest';

import { OVERLAY_BASE_Z_INDEX, OverlayStackingService } from '@vanguard/OverlayStacking/OverlayStackingService';

import { render } from '../../../test-utils/test-utils';
import { PopoverModal } from './PopoverModal';

const LEGACY_STATIC_BASE = 1030; // Z_INDEX_TO_APPEAR_ABOVE_ALL_ELEMENTS inside PopoverModal

const renderOpenPopoverModal = (zIndex?: number) => {
  const anchorEl = document.createElement('button');
  document.body.appendChild(anchorEl);
  return render(
    <PopoverModal isOpen={true} anchorEl={anchorEl} content={<span>{'content'}</span>} zIndex={zIndex} />,
  );
};

const getPopperZIndex = (): number => {
  const popperRoot = document.querySelector('.MuiPopper-root') as HTMLElement;
  expect(popperRoot).not.toBeNull();
  return Number(popperRoot.style.zIndex);
};

describe('PopoverModal overlay-stacking z-index', () => {
  afterEach(() => {
    OverlayStackingService.__resetForTests();
  });

  // The bug this pins: a PopoverModal opened INSIDE a modal that raised the stacking floor (e.g. a widget
  // opened with baseZIndex ~2147483004) painted at its static 1031 and landed BEHIND that modal.
  test('stacks above a modal that raised the stacking floor', () => {
    const hostModalZIndex = OverlayStackingService.register('host-widget-modal', 'modal', 2147483004);

    renderOpenPopoverModal();

    expect(getPopperZIndex()).toBeGreaterThan(hostModalZIndex);
  });

  test('keeps the legacy `zIndex + 1031` minimum when it exceeds the ledger slot', () => {
    renderOpenPopoverModal(9000);

    expect(getPopperZIndex()).toBe(9000 + LEGACY_STATIC_BASE + 1);
  });

  test('releases its ledger slot on unmount so the floor falls back', () => {
    const { unmount } = renderOpenPopoverModal();
    unmount();

    expect(OverlayStackingService.register('after', 'modal')).toBe(OVERLAY_BASE_Z_INDEX + 1);
  });
});
