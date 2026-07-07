import React from 'react';
import { Button } from '@vanguard/Button/Button';
import { DateRangePicker } from '@vanguard/DateRangePicker/DateRangePicker';
import { DrawerRoot } from '@vanguard/Drawer/DrawerRoot/DrawerRoot';
import { DrawerService } from '@vanguard/Drawer/DrawerService';
import { Modal } from '@vanguard/Modal/Modal';
import { ModalHeader } from '@vanguard/Modal/Modalheader/ModalHeader';
import { ModalService } from '@vanguard/Modal/ModalService';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import { closeAllOverlays, getDrawerLayer, readZ, Story, topmostElAt } from './_OverlayStacking.default';

// Raise the stacking floor so the whole overlay stack sits *above* MUI's static
// `theme.zIndex.modal` (1300). This is the realistic repro: an unfixed Popper
// would paint at MUI's default z-index and would disappear behind this stack.
const HIGH_FLOOR = 9000;

const TEST_ID = 'drawer-modal-date-range-picker';

/**
 * DateRangePicker on the topmost surface.
 *
 * Stack: drawer (floor raised to 9000) -> modal on top -> the modal owns a
 * DateRangePicker. Opening its dropdown must register with
 * OverlayStackingService and paint *above* the modal it lives in. Before the
 * fix the bare MUI Popper used no z-index and rendered behind the 9000+ stack.
 */
export const DrawerModalDateRangePicker: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await closeAllOverlays();

    // 1. drawer with a raised floor (mimics covering a 3rd-party widget at 9000)
    await userEvent.click(canvas.getByRole('button', { name: /open drawer/i }));
    await waitFor(() => expect(screen.getByTestId('drawer-body-Floor Drawer')).toBeInTheDocument());
    await new Promise((r) => setTimeout(r, 350));

    // 2. modal on top of the drawer — inherits the sticky 9000 floor
    await userEvent.click(screen.getByRole('button', { name: /open date range modal/i }));
    await waitFor(() => expect(screen.getByTestId('modal-body-Date Range Modal')).toBeInTheDocument());
    await new Promise((r) => setTimeout(r, 350));

    // 3. open the dropdown by clicking the left reference container inside the
    // topmost modal.
    const leftReference = within(screen.getByTestId('modal-body-Date Range Modal')).getByTestId(
      `${TEST_ID}-left-reference-container`,
    );
    await waitFor(() => expect(leftReference).toBeVisible());
    await userEvent.click(leftReference);
    await waitFor(() => expect(document.querySelector('.date-range-picker-popper')).toBeTruthy());
    await new Promise((r) => setTimeout(r, 250));

    const drawerLayer = getDrawerLayer()!;
    const drawerZ = readZ(drawerLayer);

    const topModalRoot = screen.getByTestId('modal-body-Date Range Modal').closest('.modalRoot') as HTMLElement;
    const modalZ = readZ(topModalRoot);

    const popperRoot = document.querySelector('.date-range-picker-popper') as HTMLElement;
    const popperZ = readZ(popperRoot);

    // The stack is above MUI's default 1300 — so a popper with no z-index
    // would be buried. Strict ordering: drawer < modal < dropdown popper.
    await expect(drawerZ).toBeGreaterThanOrEqual(HIGH_FLOOR);
    await expect(modalZ).toBeGreaterThan(drawerZ);
    await expect(popperZ).toBeGreaterThan(modalZ);

    // Hit-test the dropdown — the element painted at its centre belongs to
    // the popper layer, not the modal beneath it.
    const dropdown = popperRoot.querySelector('.date-range-picker-dropdown') as HTMLElement;
    const top = topmostElAt(dropdown);
    await expect(top && popperRoot.contains(top)).toBe(true);

    await closeAllOverlays();
  },
  render: () => {
    const openDateRangeModal = () => {
      ModalService.open(
        <Modal>
          <ModalHeader closeFn={() => ModalService.closeAllModals()}>Date Range Modal</ModalHeader>
          <div
            data-testid="modal-body-Date Range Modal"
            style={{ padding: 40, minWidth: 480, minHeight: 240, fontSize: 18 }}
          >
            <div style={{ marginBottom: 16 }}>This modal sits above a high-floor drawer.</div>
            <DateRangePicker testId={TEST_ID} />
          </div>
        </Modal>,
        { animation: 'pop' },
      );
    };

    const FloorDrawer = () => (
      <div data-testid="drawer-body-Floor Drawer" style={{ width: 360, padding: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 600 }}>Floor Drawer</div>
        <div>Opened at a raised z-index floor ({HIGH_FLOOR}).</div>
        <Button onClick={openDateRangeModal}>Open Date Range Modal</Button>
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
