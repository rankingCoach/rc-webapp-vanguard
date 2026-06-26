import React from 'react';
import { Button } from '@vanguard/Button/Button';
import { DrawerRoot } from '@vanguard/Drawer/DrawerRoot/DrawerRoot';
import { DrawerService } from '@vanguard/Drawer/DrawerService';
import { Modal } from '@vanguard/Modal/Modal';
import { ModalHeader } from '@vanguard/Modal/Modalheader/ModalHeader';
import { ModalService } from '@vanguard/Modal/ModalService';
import { Select } from '@vanguard/Select/Select';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import { closeAllOverlays, getDrawerLayer, readZ, Story, topmostElAt } from './_OverlayStacking.default';

// Raise the stacking floor so the whole overlay stack sits *above* MUI's static
// `theme.zIndex.modal` (1300). This is the realistic repro: an unfixed Select
// dropdown paints at 1300 and would disappear behind every surface here.
const HIGH_FLOOR = 9000;

const SELECT_OPTION_LABEL = 'Berlin';

const selectOptions = [
  { key: 1, value: 'lon', title: 'London' },
  { key: 2, value: 'ber', title: SELECT_OPTION_LABEL },
  { key: 3, value: 'par', title: 'Paris' },
];

/**
 * Select on the topmost surface.
 *
 * Stack: drawer (floor raised to 9000) -> modal on top -> the modal owns a
 * Select. Opening the Select dropdown must register with OverlayStackingService
 * and paint *above* the modal it lives in. Before the fix the dropdown used
 * MUI's fixed `theme.zIndex.modal` (1300) and rendered behind the 9000+ stack.
 */
export const DrawerModalSelect: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await closeAllOverlays();

    // 1. drawer with a raised floor (mimics covering a 3rd-party widget at 9000)
    await userEvent.click(canvas.getByRole('button', { name: /open drawer/i }));
    await waitFor(() => expect(screen.getByTestId('drawer-body-Floor Drawer')).toBeInTheDocument());
    await new Promise((r) => setTimeout(r, 350));

    // 2. modal on top of the drawer — inherits the sticky 9000 floor
    await userEvent.click(screen.getByRole('button', { name: /open select modal/i }));
    await waitFor(() => expect(screen.getByTestId('modal-body-Select Modal')).toBeInTheDocument());
    await new Promise((r) => setTimeout(r, 350));

    // 3. open the Select dropdown living inside the topmost modal.
    // NOTE: `hidden: true` is required. The drawer underneath is a MUI Modal; its
    // modal-manager stamps `aria-hidden="true"` onto the sibling portal roots to
    // hide background content. The vanguard modal (custom, not MUI-managed) renders
    // into one of those roots, so its combobox sits inside an aria-hidden subtree —
    // visible and clickable on screen, but outside the accessibility tree that the
    // default `getByRole` (hidden:false) searches. `getByText`/`getByTestId` ignore
    // aria-hidden, which is why the other stacking stories don't hit this.
    const combobox = within(
      screen.getByTestId('modal-body-Select Modal'),
    ).getByRole('combobox', { hidden: true });
    await waitFor(() => expect(combobox).toBeVisible());
    await userEvent.click(combobox);
    await waitFor(() => expect(screen.getByRole('listbox')).toBeVisible());
    await new Promise((r) => setTimeout(r, 250));

    const drawerLayer = getDrawerLayer()!;
    const drawerZ = readZ(drawerLayer);

    const topModalRoot = screen.getByTestId('modal-body-Select Modal').closest('.modalRoot') as HTMLElement;
    const modalZ = readZ(topModalRoot);

    const optionEl = screen.getByRole('option', { name: SELECT_OPTION_LABEL });
    const selectMenuRoot = optionEl.closest('.MuiPopover-root') as HTMLElement;
    const selectZ = readZ(selectMenuRoot);

    // The stack is above MUI's default 1300 — so a dropdown pinned to 1300 would
    // be buried. Strict ordering: drawer < modal < select dropdown.
    await expect(drawerZ).toBeGreaterThanOrEqual(HIGH_FLOOR);
    await expect(modalZ).toBeGreaterThan(drawerZ);
    await expect(selectZ).toBeGreaterThan(modalZ);

    // Hit-test the option — the element painted at its centre belongs to the
    // dropdown layer, not the modal beneath it.
    const top = topmostElAt(optionEl);
    await expect(top && selectMenuRoot.contains(top)).toBe(true);

    await closeAllOverlays();
  },
  render: () => {
    const openSelectModal = () => {
      ModalService.open(
        <Modal>
          <ModalHeader closeFn={() => ModalService.closeAllModals()}>Select Modal</ModalHeader>
          <div
            data-testid="modal-body-Select Modal"
            style={{ padding: 40, minWidth: 480, minHeight: 240, fontSize: 18 }}
          >
            <div style={{ marginBottom: 16 }}>This modal sits above a high-floor drawer.</div>
            <Select label="City" options={selectOptions} value="lon" translateOptions={false} testId="city-select" />
          </div>
        </Modal>,
        { animation: 'pop' },
      );
    };

    const FloorDrawer = () => (
      <div data-testid="drawer-body-Floor Drawer" style={{ width: 360, padding: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 600 }}>Floor Drawer</div>
        <div>Opened at a raised z-index floor ({HIGH_FLOOR}).</div>
        <Button onClick={openSelectModal}>Open Select Modal</Button>
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
