import React from 'react';
import { Button } from '@vanguard/Button/Button';
import { DrawerRoot } from '@vanguard/Drawer/DrawerRoot/DrawerRoot';
import { DrawerService } from '@vanguard/Drawer/DrawerService';
import { Modal } from '@vanguard/Modal/Modal';
import { ModalHeader } from '@vanguard/Modal/Modalheader/ModalHeader';
import { ModalService } from '@vanguard/Modal/ModalService';
import { Popover } from '@vanguard/Popover/Popover';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import { closeAllOverlays, getDrawerLayer, readZ, Story } from './_OverlayStacking.default';

// Raise the stacking floor so the whole overlay stack sits *above* MUI's static
// `theme.zIndex.modal` (1300). This is the realistic repro: an unfixed Tooltip
// popper paints at MUI's static z-index and would disappear behind this stack.
const HIGH_FLOOR = 9000;

/**
 * Popover (Tooltip) on the topmost surface.
 *
 * Stack: drawer (floor raised to 9000) -> modal on top -> the modal owns a
 * Popover. Hovering the trigger must register with OverlayStackingService and
 * paint *above* the modal it lives in. Before the fix the MUI Tooltip used its
 * static z-index and rendered behind the 9000+ stack.
 */
export const DrawerModalPopover: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await closeAllOverlays();

    // 1. drawer with a raised floor (mimics covering a 3rd-party widget at 9000)
    await userEvent.click(canvas.getByRole('button', { name: /open drawer/i }));
    await waitFor(() => expect(screen.getByTestId('drawer-body-Floor Drawer')).toBeInTheDocument());
    await new Promise((r) => setTimeout(r, 350));

    // 2. modal on top of the drawer — inherits the sticky 9000 floor
    await userEvent.click(screen.getByRole('button', { name: /open popover modal/i }));
    await waitFor(() => expect(screen.getByTestId('modal-body-Popover Modal')).toBeInTheDocument());
    await new Promise((r) => setTimeout(r, 350));

    // 3. hover the trigger living inside the topmost modal to open the Popover.
    const trigger = within(screen.getByTestId('modal-body-Popover Modal')).getByTestId('popover-trigger');
    await waitFor(() => expect(trigger).toBeVisible());
    await userEvent.hover(trigger);
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeVisible());
    await new Promise((r) => setTimeout(r, 250));

    const drawerLayer = getDrawerLayer()!;
    const drawerZ = readZ(drawerLayer);

    const topModalRoot = screen.getByTestId('modal-body-Popover Modal').closest('.modalRoot') as HTMLElement;
    const modalZ = readZ(topModalRoot);

    const tooltipEl = screen.getByRole('tooltip');
    const popperRoot = tooltipEl.closest('.MuiPopper-root') as HTMLElement;
    const popperZ = readZ(popperRoot);

    // The stack is above MUI's default 1300 — so a popper pinned to 1300 (or
    // none) would be buried. Strict ordering: drawer < modal < tooltip popper.
    await expect(drawerZ).toBeGreaterThanOrEqual(HIGH_FLOOR);
    await expect(modalZ).toBeGreaterThan(drawerZ);
    await expect(popperZ).toBeGreaterThan(modalZ);

    // No hit-test here: MUI sets `pointer-events: none` on a non-interactive
    // Tooltip's popper so it never blocks clicks on whatever sits underneath
    // it. That makes the tooltip itself invisible to elementFromPoint — the
    // strict z-index ordering above is the meaningful proof for this surface.

    await userEvent.unhover(trigger);
    await closeAllOverlays();
  },
  render: () => {
    const openPopoverModal = () => {
      ModalService.open(
        <Modal>
          <ModalHeader closeFn={() => ModalService.closeAllModals()}>Popover Modal</ModalHeader>
          <div
            data-testid="modal-body-Popover Modal"
            style={{ padding: 80, minWidth: 480, minHeight: 240, fontSize: 18 }}
          >
            <div style={{ marginBottom: 16 }}>This modal sits above a high-floor drawer.</div>
            <Popover message="Tooltip content">
              <Button testId="popover-trigger">Hover me</Button>
            </Popover>
          </div>
        </Modal>,
        { animation: 'pop' },
      );
    };

    const FloorDrawer = () => (
      <div data-testid="drawer-body-Floor Drawer" style={{ width: 360, padding: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 600 }}>Floor Drawer</div>
        <div>Opened at a raised z-index floor ({HIGH_FLOOR}).</div>
        <Button onClick={openPopoverModal}>Open Popover Modal</Button>
      </div>
    );

    const openDrawer = () => {
      DrawerService.open(<FloorDrawer />, { baseZIndex: HIGH_FLOOR });
    };

    return (
      <>
        <DrawerRoot />
        <Button onClick={openDrawer}>Open Drawer</Button>
      </>
    );
  },
};
