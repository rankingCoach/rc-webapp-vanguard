import React from 'react';
import { Button } from '@vanguard/Button/Button';
import { DatePicker } from '@vanguard/DatePicker/DatePicker';
import { DrawerRoot } from '@vanguard/Drawer/DrawerRoot/DrawerRoot';
import { DrawerService } from '@vanguard/Drawer/DrawerService';
import { Modal } from '@vanguard/Modal/Modal';
import { ModalHeader } from '@vanguard/Modal/Modalheader/ModalHeader';
import { ModalService } from '@vanguard/Modal/ModalService';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import { closeAllOverlays, getDrawerLayer, readZ, Story, topmostElAt } from './_OverlayStacking.default';

// Raise the stacking floor so the whole overlay stack sits *above* MUI's static
// `theme.zIndex.modal` (1300). This is the realistic repro: an unfixed calendar
// popper paints with no z-index (or 1300) and would disappear behind the stack.
const HIGH_FLOOR = 9000;

/**
 * DatePicker on the topmost surface.
 *
 * Stack: drawer (floor raised to 9000) -> modal on top -> the modal owns a
 * DatePicker. Opening the calendar must register with OverlayStackingService and
 * paint *above* the modal it lives in. Before the fix the MUI X popper portaled
 * to <body> with no z-index and rendered behind the 9000+ stack.
 */
export const DrawerModalDatePicker: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await closeAllOverlays();

    // 1. drawer with a raised floor (mimics covering a 3rd-party widget at 9000)
    await userEvent.click(canvas.getByRole('button', { name: /open drawer/i }));
    await waitFor(() => expect(screen.getByTestId('drawer-body-Floor Drawer')).toBeInTheDocument());
    await new Promise((r) => setTimeout(r, 350));

    // 2. modal on top of the drawer — inherits the sticky 9000 floor
    await userEvent.click(screen.getByRole('button', { name: /open date modal/i }));
    await waitFor(() => expect(screen.getByTestId('modal-body-Date Modal')).toBeInTheDocument());
    await new Promise((r) => setTimeout(r, 350));

    // 3. open the calendar by clicking the DatePicker input inside the topmost
    // modal. Query the <input> directly — the MUI wrapper div also exposes
    // role="textbox", so getByRole('textbox') would match two elements.
    const input = screen.getByTestId('modal-body-Date Modal').querySelector('input') as HTMLInputElement;
    await waitFor(() => expect(input).toBeVisible());
    await userEvent.click(input);
    await waitFor(() => expect(document.querySelector('.MuiCalendarPicker-root')).toBeTruthy());
    await new Promise((r) => setTimeout(r, 250));

    const drawerLayer = getDrawerLayer()!;
    const drawerZ = readZ(drawerLayer);

    const topModalRoot = screen.getByTestId('modal-body-Date Modal').closest('.modalRoot') as HTMLElement;
    const modalZ = readZ(topModalRoot);

    const calendarRoot = document.querySelector('.MuiCalendarPicker-root') as HTMLElement;
    const popperRoot = calendarRoot.closest('.MuiPickersPopper-root') as HTMLElement;
    const popperZ = readZ(popperRoot);

    // The stack is above MUI's default 1300 — so a popper pinned to 1300 (or
    // none) would be buried. Strict ordering: drawer < modal < calendar popper.
    await expect(drawerZ).toBeGreaterThanOrEqual(HIGH_FLOOR);
    await expect(modalZ).toBeGreaterThan(drawerZ);
    await expect(popperZ).toBeGreaterThan(modalZ);

    // Hit-test the calendar header (reliably inside the viewport — the full
    // calendar is tall enough that its centre can fall below the fold). The
    // element painted there belongs to the popper layer, not the modal beneath.
    const header = popperRoot.querySelector('.MuiPickersCalendarHeader-root') as HTMLElement;
    const top = topmostElAt(header);
    await expect(top && popperRoot.contains(top)).toBe(true);

    await closeAllOverlays();
  },
  render: () => {
    const openDateModal = () => {
      ModalService.open(
        <Modal>
          <ModalHeader closeFn={() => ModalService.closeAllModals()}>Date Modal</ModalHeader>
          <div data-testid="modal-body-Date Modal" style={{ padding: 40, minWidth: 480, minHeight: 240, fontSize: 18 }}>
            <div style={{ marginBottom: 16 }}>This modal sits above a high-floor drawer.</div>
            <DatePicker label="Start date" locale="en-GB" />
          </div>
        </Modal>,
        { animation: 'pop' },
      );
    };

    const FloorDrawer = () => (
      <div data-testid="drawer-body-Floor Drawer" style={{ width: 360, padding: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 600 }}>Floor Drawer</div>
        <div>Opened at a raised z-index floor ({HIGH_FLOOR}).</div>
        <Button onClick={openDateModal}>Open Date Modal</Button>
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
