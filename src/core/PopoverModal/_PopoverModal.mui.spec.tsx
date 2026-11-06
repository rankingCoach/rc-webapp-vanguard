/**
 * MUI contract (characterization) spec for PopoverModal (MUI Popper + Backdrop + Portal).
 *
 * Locks CURRENT behaviour on MUI v5.16 so the MUI v6/v7/v9 bumps go red where MUI changed behaviour.
 * Do not edit these assertions to make a bump pass; see agentic-plans/mui-upgrade-plan.md "TDD contract".
 * Complements _PopoverModal.spec.tsx (z-index ledger + backdrop portal/stopPropagation).
 *
 * No MUI class is asserted (no production selector on them). The popper is located as the parent of
 * Vanguard's own content wrapper span; the backdrop via its Vanguard `data-testid="popover-modal-backdrop"`.
 * Tags: `[bug-lock]` / `[v5-quirk]` = baseline characterization, not a promised contract.
 */
import '@testing-library/jest-dom/vitest';

import userEvent from '@testing-library/user-event';
import { OVERLAY_BASE_Z_INDEX, OverlayStackingService } from '@vanguard/OverlayStacking/OverlayStackingService';
import { PopoverModal, PopoverModalProps } from '@vanguard/PopoverModal/PopoverModal';
import React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { fireEvent, render, screen, waitFor } from '../../../test-utils/test-utils';

const LEGACY_STATIC_BASE = 1030;

const anchors: HTMLElement[] = [];
const makeAnchor = () => {
  const anchor = document.createElement('button');
  anchor.textContent = 'anchor';
  document.body.appendChild(anchor);
  anchors.push(anchor);
  return anchor;
};

// popper = parent of Vanguard's `<span ref={containerRef}>` wrapper around `content`
const getPopper = () => (screen.queryByText('content')?.parentElement?.parentElement ?? null) as HTMLElement | null;
const getBackdrop = () => screen.queryByTestId('popover-modal-backdrop');

const renderModal = (props: Partial<PopoverModalProps> = {}) =>
  render(
    <div data-testid={'mount-point'}>
      <PopoverModal isOpen content={<span>{'content'}</span>} {...props} />
    </div>,
  );

describe('PopoverModal (MUI Popper/Backdrop/Portal) contract', () => {
  afterEach(() => {
    OverlayStackingService.__resetForTests();
    anchors.splice(0).forEach((anchor) => { anchor.remove(); });
    vi.restoreAllMocks();
  });

  describe('open state is derived from anchorEl', () => {
    // CURRENT BEHAVIOUR (suspected bug): without an anchorEl the component returns null even when isOpen=true.
    test('[bug-lock] isOpen=true without anchorEl renders nothing', () => {
      // Baseline characterization: not a promised contract.
      renderModal({ anchorEl: null });

      expect(getPopper()).toBeNull();
      expect(screen.queryByText('content')).not.toBeInTheDocument();
    });

    // CURRENT BEHAVIOUR (suspected bug): `open = isOpen || Boolean(anchorEl)`, so an anchorEl alone opens it.
    test('[bug-lock] isOpen=false with an anchorEl still renders the popper open', () => {
      // Baseline characterization: not a promised contract.
      renderModal({ isOpen: false, anchorEl: makeAnchor() });

      expect(getPopper()).not.toBeNull();
      expect(screen.getByText('content')).toBeInTheDocument();
    });

    test('anchorEl prop change to null removes the popper', () => {
      const anchor = makeAnchor();
      const { rerender } = renderModal({ anchorEl: anchor });
      expect(getPopper()).not.toBeNull();

      rerender(
        <div data-testid={'mount-point'}>
          <PopoverModal isOpen content={<span>{'content'}</span>} anchorEl={null} />
        </div>,
      );

      expect(getPopper()).toBeNull();
    });
  });

  describe('Popper', () => {
    test('default: inline (disablePortal) at the mount point with role="tooltip"', () => {
      renderModal({ anchorEl: makeAnchor() });

      const popper = getPopper() as HTMLElement;
      expect(screen.getByTestId('mount-point')).toContainElement(popper);
      expect(popper).toHaveAttribute('role', 'tooltip');
    });

    test('renderInPortal: popper is portaled to body', () => {
      renderModal({ anchorEl: makeAnchor(), renderInPortal: true });

      const popper = getPopper() as HTMLElement;
      expect(popper.parentElement).toBe(document.body);
      expect(screen.getByTestId('mount-point')).not.toContainElement(popper);
    });

    test('content is wrapped in a relative span with z-index zIndex+1', () => {
      renderModal({ anchorEl: makeAnchor(), zIndex: 5 });

      const wrapper = screen.getByText('content').parentElement as HTMLElement;
      expect(wrapper.tagName).toBe('SPAN');
      expect(wrapper.style.position).toBe('relative');
      expect(wrapper.style.zIndex).toBe('6');
    });

    test('default placement is top', async () => {
      renderModal({ anchorEl: makeAnchor() });

      await waitFor(() => expect(getPopper()).toHaveAttribute('data-popper-placement', 'top'));
    });

    test.each(['bottom', 'bottom-start', 'top-end'] as const)(
      'placement=%s is forwarded to Popper',
      async (placement) => {
        renderModal({ anchorEl: makeAnchor(), placement });

        await waitFor(() => expect(getPopper()).toHaveAttribute('data-popper-placement', placement));
      },
    );

    test('centerPopover: renders with the custom modifiers (no crash) and keeps the placement', async () => {
      renderModal({ anchorEl: makeAnchor(), centerPopover: true, placement: 'bottom' });

      await waitFor(() => expect(getPopper()).toHaveAttribute('data-popper-placement', 'bottom'));
      // computeStyles gpuAcceleration:false -> popper.js positions with top/left instead of transform
      expect((getPopper() as HTMLElement).style.transform).toBe('');
    });

    test('without centerPopover popper.js positions with a transform (gpuAcceleration on)', async () => {
      renderModal({ anchorEl: makeAnchor() });

      await waitFor(() => expect((getPopper() as HTMLElement).style.transform).toContain('translate'));
    });

    test('popper z-index: max(zIndex + 1031, ledger slot)', () => {
      renderModal({ anchorEl: makeAnchor() });

      expect(Number((getPopper() as HTMLElement).style.zIndex)).toBe(
        Math.max(LEGACY_STATIC_BASE + 1, OVERLAY_BASE_Z_INDEX + 1),
      );
    });

    // CURRENT BEHAVIOUR: no keyboard dismissal at all, even with the dim backdrop.
    test('[v5-quirk] Escape does nothing (no keyboard close)', async () => {
      // Baseline characterization: not a promised contract.
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderModal({ anchorEl: makeAnchor(), onClose });

      await user.keyboard('{Escape}');

      expect(onClose).not.toHaveBeenCalled();
      expect(getPopper()).not.toBeNull();
    });

    test('click outside without dimRestOfPage does nothing (no ClickAwayListener)', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderModal({ anchorEl: makeAnchor(), onClose });

      await user.click(document.body);

      expect(onClose).not.toHaveBeenCalled();
      expect(getPopper()).not.toBeNull();
    });

    test('unmount (portaled) leaves no popper/backdrop in body and releases slots', () => {
      const { unmount } = renderModal({ anchorEl: makeAnchor(), renderInPortal: true, dimRestOfPage: true });

      unmount();

      expect(getPopper()).toBeNull();
      expect(document.querySelector('[role="tooltip"]')).toBeNull();
      expect(getBackdrop()).toBeNull();
      expect(OverlayStackingService.getTopmostZIndex()).toBe(OVERLAY_BASE_Z_INDEX);
    });
  });

  describe('Backdrop (dimRestOfPage)', () => {
    test('no dimRestOfPage -> no backdrop', () => {
      renderModal({ anchorEl: makeAnchor() });

      expect(getBackdrop()).toBeNull();
    });

    test('backdrop is shown (opacity 1) with a 225ms fade', () => {
      renderModal({ anchorEl: makeAnchor(), dimRestOfPage: true });

      const backdrop = getBackdrop() as HTMLElement;
      expect(backdrop.style.opacity).toBe('1');
      expect(backdrop.style.transition).toContain('225ms');
    });

    // MUI v5 Backdrop sets aria-hidden itself; v9 drops it. Vanguard does not rely on it (no production hit).
    test("[v5-quirk] the backdrop adds no aria-hidden attribute by default (v9)", () => {
      // Baseline characterization: not a promised contract.
      renderModal({ anchorEl: makeAnchor(), dimRestOfPage: true });

      expect(getBackdrop()).not.toHaveAttribute('aria-hidden');
    });

    test('backdrop z-index is strictly below the popper', () => {
      renderModal({ anchorEl: makeAnchor(), dimRestOfPage: true });

      const backdropZ = Number(getComputedStyle(getBackdrop() as HTMLElement).zIndex);
      expect(backdropZ).toBe(Math.max(LEGACY_STATIC_BASE, OVERLAY_BASE_Z_INDEX + 1));
      expect(Number((getPopper() as HTMLElement).style.zIndex)).toBeGreaterThan(backdropZ);
    });

    test('backdrop mousedown calls onClose once (no arguments)', () => {
      const onClose = vi.fn();
      renderModal({ anchorEl: makeAnchor(), dimRestOfPage: true, onClose });

      fireEvent.mouseDown(getBackdrop() as HTMLElement);

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledWith();
    });

    // CURRENT BEHAVIOUR (suspected bug): the internal anchor is cleared, so the popper disappears immediately even
    // though the parent still passes isOpen=true (controlled `isOpen` is not the source of truth).
    test('[bug-lock] after backdrop mousedown popper and backdrop disappear while the parent keeps isOpen=true', () => {
      // Baseline characterization: not a promised contract.
      renderModal({ anchorEl: makeAnchor(), dimRestOfPage: true, onClose: vi.fn() });

      fireEvent.mouseDown(getBackdrop() as HTMLElement);

      expect(getPopper()).toBeNull();
      expect(getBackdrop()).toBeNull();
    });

    test('backdrop mousedown without onClose still closes', () => {
      renderModal({ anchorEl: makeAnchor(), dimRestOfPage: true });

      fireEvent.mouseDown(getBackdrop() as HTMLElement);

      expect(getPopper()).toBeNull();
    });

    test('backdrop click (not mousedown) alone does not close', () => {
      const onClose = vi.fn();
      renderModal({ anchorEl: makeAnchor(), dimRestOfPage: true, onClose });

      fireEvent.click(getBackdrop() as HTMLElement);

      expect(onClose).not.toHaveBeenCalled();
      expect(getPopper()).not.toBeNull();
    });

    test('disableBackdropClick: mousedown keeps it open', () => {
      const onClose = vi.fn();
      renderModal({ anchorEl: makeAnchor(), dimRestOfPage: true, disableBackdropClick: true, onClose });

      fireEvent.mouseDown(getBackdrop() as HTMLElement);

      expect(onClose).not.toHaveBeenCalled();
      expect(getPopper()).not.toBeNull();
    });

    test('toggling dimRestOfPage off releases the backdrop slot and removes the backdrop', () => {
      const anchor = makeAnchor();
      const { rerender } = renderModal({ anchorEl: anchor, dimRestOfPage: true });
      expect(OverlayStackingService.getTopmostZIndex()).toBe(OVERLAY_BASE_Z_INDEX + 2);

      rerender(
        <div data-testid={'mount-point'}>
          <PopoverModal isOpen content={<span>{'content'}</span>} anchorEl={anchor} dimRestOfPage={false} />
        </div>,
      );

      expect(getBackdrop()).toBeNull();
      expect(OverlayStackingService.getTopmostZIndex()).toBe(OVERLAY_BASE_Z_INDEX + 1);
    });

    test('closing (isOpen false + anchor null) releases every slot', () => {
      const anchor = makeAnchor();
      const { rerender } = renderModal({ anchorEl: anchor, dimRestOfPage: true });

      rerender(
        <div data-testid={'mount-point'}>
          <PopoverModal isOpen={false} content={<span>{'content'}</span>} anchorEl={null} dimRestOfPage />
        </div>,
      );

      expect(getPopper()).toBeNull();
      expect(OverlayStackingService.getTopmostZIndex()).toBe(OVERLAY_BASE_Z_INDEX);
    });
  });
});
