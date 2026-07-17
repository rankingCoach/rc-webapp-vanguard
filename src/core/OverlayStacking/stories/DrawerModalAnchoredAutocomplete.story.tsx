import React from 'react';
import { AutocompleteWithAnchor } from '@vanguard/AutocompleteWithAnchor/AutocompleteWithAnchor';
import { Button } from '@vanguard/Button/Button';
import { DrawerRoot } from '@vanguard/Drawer/DrawerRoot/DrawerRoot';
import { DrawerService } from '@vanguard/Drawer/DrawerService';
import { Input } from '@vanguard/Input/Input';
import { Modal } from '@vanguard/Modal/Modal';
import { ModalHeader } from '@vanguard/Modal/Modalheader/ModalHeader';
import { ModalService } from '@vanguard/Modal/ModalService';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import { closeAllOverlays, getDrawerLayer, readZ, Story, topmostElAt } from './_OverlayStacking.default';

// Raise the stacking floor so the whole overlay stack sits *above* MUI's static
// `theme.zIndex.modal` (1300). This is the realistic repro: an unfixed listbox
// would paint at MUI's static z-index and disappear behind this stack.
const HIGH_FLOOR = 9000;

const OPTION_LABEL = 'Plum';
const options = ['Apple', OPTION_LABEL, 'Cherry'];

/**
 * AutocompleteWithAnchor on the topmost surface.
 *
 * Stack: drawer (floor raised to 9000) -> modal on top -> the modal owns an
 * AutocompleteWithAnchor. Clicking its trigger opens a portaled popover (the
 * search box) which in turn opens the inner listbox — TWO nested portaled
 * surfaces. Both must register with OverlayStackingService and paint above the
 * modal they live in. The inner listbox is force-open (`open: true`), the case
 * that previously left it stuck at the base z-index because it never fired
 * MUI's onOpen. Strict ordering: drawer < modal < listbox.
 */
export const DrawerModalAnchoredAutocomplete: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await closeAllOverlays();

    // 1. drawer with a raised floor (mimics covering a 3rd-party widget at 9000)
    await userEvent.click(canvas.getByRole('button', { name: /open drawer/i }));
    await waitFor(() => expect(screen.getByTestId('drawer-body-Floor Drawer')).toBeInTheDocument());
    await new Promise((r) => setTimeout(r, 350));

    // 2. modal on top of the drawer — inherits the sticky 9000 floor
    await userEvent.click(screen.getByRole('button', { name: /open anchored autocomplete modal/i }));
    await waitFor(() => expect(screen.getByTestId('modal-body-Anchored Autocomplete Modal')).toBeInTheDocument());
    await new Promise((r) => setTimeout(r, 350));

    // 3. open the anchored popover by clicking the trigger inside the topmost modal.
    const trigger = screen.getByTestId('anchored-trigger').querySelector('input') as HTMLInputElement;
    await waitFor(() => expect(trigger).toBeVisible());
    await userEvent.click(trigger);
    await waitFor(() => expect(screen.getByRole('option', { name: OPTION_LABEL })).toBeVisible());
    await new Promise((r) => setTimeout(r, 250));

    const drawerZ = readZ(getDrawerLayer()!);

    const topModalRoot = screen
      .getByTestId('modal-body-Anchored Autocomplete Modal')
      .closest('.modalRoot') as HTMLElement;
    const modalZ = readZ(topModalRoot);

    const optionEl = screen.getByRole('option', { name: OPTION_LABEL });
    const listboxPopper = optionEl.closest('.MuiAutocomplete-popper') as HTMLElement;
    const listboxZ = readZ(listboxPopper);

    // The stack is above MUI's default 1300 — so a listbox pinned to 1300 would
    // be buried. Strict ordering: drawer < modal < listbox.
    await expect(drawerZ).toBeGreaterThanOrEqual(HIGH_FLOOR);
    await expect(modalZ).toBeGreaterThan(drawerZ);
    await expect(listboxZ).toBeGreaterThan(modalZ);

    // Hit-test the option — the element painted at its centre belongs to the
    // listbox layer, not the modal/drawer beneath it.
    const top = topmostElAt(optionEl);
    await expect(top && listboxPopper.contains(top)).toBe(true);

    await closeAllOverlays();
  },
  render: () => {
    const openAnchoredModal = () => {
      ModalService.open(
        <Modal>
          <ModalHeader closeFn={() => ModalService.closeAllModals()}>Anchored Autocomplete Modal</ModalHeader>
          <div
            data-testid="modal-body-Anchored Autocomplete Modal"
            style={{ padding: 40, minWidth: 480, minHeight: 240, fontSize: 18 }}
          >
            <div style={{ marginBottom: 16 }}>This modal sits above a high-floor drawer.</div>
            <AutocompleteWithAnchor autocompleteProps={{ options, open: true }}>
              <Input
                testId="anchored-trigger"
                textFieldProps={{ placeholder: 'Search…', InputProps: { readOnly: true } }}
              />
            </AutocompleteWithAnchor>
          </div>
        </Modal>,
        { animation: 'pop' },
      );
    };

    const FloorDrawer = () => (
      <div data-testid="drawer-body-Floor Drawer" style={{ width: 360, padding: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 600 }}>Floor Drawer</div>
        <div>Opened at a raised z-index floor ({HIGH_FLOOR}).</div>
        <Button onClick={openAnchoredModal}>Open Anchored Autocomplete Modal</Button>
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
