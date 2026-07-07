import React from 'react';
import { Autocomplete } from '@vanguard/Autocomplete/Autocomplete';
import { Button } from '@vanguard/Button/Button';
import { DrawerRoot } from '@vanguard/Drawer/DrawerRoot/DrawerRoot';
import { DrawerService } from '@vanguard/Drawer/DrawerService';
import { Modal } from '@vanguard/Modal/Modal';
import { ModalHeader } from '@vanguard/Modal/Modalheader/ModalHeader';
import { ModalService } from '@vanguard/Modal/ModalService';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import { closeAllOverlays, getDrawerLayer, readZ, Story, topmostElAt } from './_OverlayStacking.default';

// Raise the stacking floor so the whole overlay stack sits *above* MUI's static
// `theme.zIndex.modal` (1300). This is the realistic repro: an unfixed listbox
// would paint at MUI's static z-index and would disappear behind this stack.
const HIGH_FLOOR = 9000;

const OPTION_LABEL = 'Plum';

const fruitOptions = [
  { key: 0, value: 'apple', title: 'Apple' },
  { key: 1, value: 'plum', title: OPTION_LABEL },
  { key: 2, value: 'cherry', title: 'Cherry' },
];

/**
 * Autocomplete on the topmost surface.
 *
 * Stack: drawer (floor raised to 9000) -> modal on top -> the modal owns an
 * Autocomplete. Opening its listbox must register with OverlayStackingService
 * and paint *above* the modal it lives in. Before the fix the MUI Autocomplete
 * listbox used its static z-index and rendered behind the 9000+ stack.
 */
export const DrawerModalAutocomplete: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await closeAllOverlays();

    // 1. drawer with a raised floor (mimics covering a 3rd-party widget at 9000)
    await userEvent.click(canvas.getByRole('button', { name: /open drawer/i }));
    await waitFor(() => expect(screen.getByTestId('drawer-body-Floor Drawer')).toBeInTheDocument());
    await new Promise((r) => setTimeout(r, 350));

    // 2. modal on top of the drawer — inherits the sticky 9000 floor
    await userEvent.click(screen.getByRole('button', { name: /open autocomplete modal/i }));
    await waitFor(() => expect(screen.getByTestId('modal-body-Autocomplete Modal')).toBeInTheDocument());
    await new Promise((r) => setTimeout(r, 350));

    // 3. open the listbox by clicking the input inside the topmost modal.
    const input = screen.getByTestId('modal-body-Autocomplete Modal').querySelector('input') as HTMLInputElement;
    await waitFor(() => expect(input).toBeVisible());
    await userEvent.click(input);
    await waitFor(() => expect(screen.getByRole('listbox')).toBeVisible());
    await new Promise((r) => setTimeout(r, 250));

    const drawerLayer = getDrawerLayer()!;
    const drawerZ = readZ(drawerLayer);

    const topModalRoot = screen.getByTestId('modal-body-Autocomplete Modal').closest('.modalRoot') as HTMLElement;
    const modalZ = readZ(topModalRoot);

    const optionEl = screen.getByRole('option', { name: OPTION_LABEL });
    const popperRoot = optionEl.closest('.MuiAutocomplete-popper') as HTMLElement;
    const popperZ = readZ(popperRoot);

    // The stack is above MUI's default 1300 — so a listbox pinned to 1300
    // would be buried. Strict ordering: drawer < modal < listbox.
    await expect(drawerZ).toBeGreaterThanOrEqual(HIGH_FLOOR);
    await expect(modalZ).toBeGreaterThan(drawerZ);
    await expect(popperZ).toBeGreaterThan(modalZ);

    // Hit-test the option — the element painted at its centre belongs to the
    // listbox layer, not the modal beneath it.
    const top = topmostElAt(optionEl);
    await expect(top && popperRoot.contains(top)).toBe(true);

    await closeAllOverlays();
  },
  render: () => {
    const openAutocompleteModal = () => {
      ModalService.open(
        <Modal>
          <ModalHeader closeFn={() => ModalService.closeAllModals()}>Autocomplete Modal</ModalHeader>
          <div
            data-testid="modal-body-Autocomplete Modal"
            style={{ padding: 40, minWidth: 480, minHeight: 240, fontSize: 18 }}
          >
            <div style={{ marginBottom: 16 }}>This modal sits above a high-floor drawer.</div>
            <Autocomplete
              label="Fruit"
              options={fruitOptions}
              optionKey="title"
              testId="fruit-autocomplete"
              onChange={() => {}}
            />
          </div>
        </Modal>,
        { animation: 'pop' },
      );
    };

    const FloorDrawer = () => (
      <div data-testid="drawer-body-Floor Drawer" style={{ width: 360, padding: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 600 }}>Floor Drawer</div>
        <div>Opened at a raised z-index floor ({HIGH_FLOOR}).</div>
        <Button onClick={openAutocompleteModal}>Open Autocomplete Modal</Button>
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
