import React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { OVERLAY_BASE_Z_INDEX, OverlayStackingService } from '@vanguard/OverlayStacking/OverlayStackingService';

import { fireEvent, render } from '../../../test-utils/test-utils';
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

describe('PopoverModal dim backdrop', () => {
  afterEach(() => {
    OverlayStackingService.__resetForTests();
  });

  const renderDimmed = (
    props: { renderInPortal?: boolean; onClose?: () => void; disableBackdropClick?: boolean },
    onParentMouseDown?: () => void,
  ) => {
    const anchorEl = document.createElement('button');
    document.body.appendChild(anchorEl);
    const utils = render(
      <div data-testid="mount-point" onMouseDown={onParentMouseDown}>
        <PopoverModal isOpen={true} anchorEl={anchorEl} dimRestOfPage content={<span>{'content'}</span>} {...props} />
      </div>,
    );
    const backdrop = document.querySelector('[data-testid="popover-modal-backdrop"]') as HTMLElement;
    expect(backdrop).not.toBeNull();
    return { ...utils, backdrop, mountPoint: utils.getByTestId('mount-point') };
  };

  test('is portaled to <body> together with the card when `renderInPortal` is set', () => {
    const { backdrop, mountPoint } = renderDimmed({ renderInPortal: true });

    expect(backdrop.parentElement).toBe(document.body);
    expect(mountPoint.contains(backdrop)).toBe(false);
  });

  test('stays inline at the mount point without `renderInPortal`', () => {
    const { backdrop, mountPoint } = renderDimmed({});

    expect(backdrop.parentElement).toBe(mountPoint);
  });

  test('stacks strictly between the parent modal and the card', () => {
    const parentModalZIndex = OverlayStackingService.register('parent-modal', 'modal', 2000);
    const { backdrop } = renderDimmed({ renderInPortal: true });

    const backdropZIndex = Number(getComputedStyle(backdrop).zIndex);
    expect(backdropZIndex).toBeGreaterThan(parentModalZIndex);
    expect(getPopperZIndex()).toBeGreaterThan(backdropZIndex);
  });

  test('later overlays stack above both backdrop and card', () => {
    renderDimmed({ renderInPortal: true });

    expect(OverlayStackingService.register('later-modal', 'modal')).toBeGreaterThan(getPopperZIndex());
  });

  // React portals still bubble through the React tree, so the stopPropagation must keep shielding the host.
  test('closes on backdrop mousedown without propagating to the React parent', () => {
    const onClose = vi.fn();
    const onParentMouseDown = vi.fn();
    const { backdrop } = renderDimmed({ renderInPortal: true, onClose }, onParentMouseDown);

    fireEvent.mouseDown(backdrop);

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onParentMouseDown).not.toHaveBeenCalled();
  });

  test('ignores backdrop mousedown with `disableBackdropClick`', () => {
    const onClose = vi.fn();
    const { backdrop } = renderDimmed({ renderInPortal: true, onClose, disableBackdropClick: true });

    fireEvent.mouseDown(backdrop);

    expect(onClose).not.toHaveBeenCalled();
  });

  test('releases both backdrop and card slots on unmount', () => {
    const { unmount } = renderDimmed({ renderInPortal: true });
    unmount();

    expect(OverlayStackingService.register('after', 'modal')).toBe(OVERLAY_BASE_Z_INDEX + 1);
  });
});
