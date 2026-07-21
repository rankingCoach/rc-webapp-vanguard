import React from 'react';
import { Button } from '@vanguard/Button/Button';
import { DrawerRoot } from '@vanguard/Drawer/DrawerRoot/DrawerRoot';
import { DrawerService } from '@vanguard/Drawer/DrawerService';
import { Modal } from '@vanguard/Modal/Modal';
import { ModalHeader } from '@vanguard/Modal/Modalheader/ModalHeader';
import { ModalService } from '@vanguard/Modal/ModalService';
import { SearchableSelect } from '@vanguard/SearchableSelect/SearchableSelect';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import { closeAllOverlays, getDrawerLayer, readZ, Story, topmostElAt } from './_OverlayStacking.default';

// Raise the stacking floor so the whole overlay stack sits *above* MUI's static
// `theme.zIndex.modal` (1300). This is the realistic repro: an unfixed Select
// menu would paint at MUI's static z-index and would disappear behind this stack.
const HIGH_FLOOR = 9000;

const OPTION_LABEL = 'marvel.com';

const domainOptions = [
  { key: 'grenierbrasserie.com', value: 'grenierbrasserie.com', title: 'grenierbrasserie.com' },
  { key: 'marvel.com', value: 'marvel.com', title: OPTION_LABEL },
  { key: 'image.com', value: 'image.com', title: 'image.com' },
];

/**
 * SearchableSelect on the topmost surface.
 *
 * Stack: drawer (floor raised to 9000) -> modal on top -> the modal owns a
 * SearchableSelect. Opening its menu must register with OverlayStackingService
 * and paint *above* the modal it lives in. Before the fix the MUI Select menu
 * used its static `theme.zIndex.modal` (1300) and rendered behind the 9000+ stack.
 */
export const DrawerModalSearchableSelect: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await closeAllOverlays();

    // 1. drawer with a raised floor (mimics covering a 3rd-party widget at 9000)
    await userEvent.click(canvas.getByRole('button', { name: /open drawer/i }));
    await waitFor(() => expect(screen.getByTestId('drawer-body-Floor Drawer')).toBeInTheDocument());
    await new Promise((r) => setTimeout(r, 350));

    // 2. modal on top of the drawer — inherits the sticky 9000 floor
    await userEvent.click(screen.getByRole('button', { name: /open searchable select modal/i }));
    await waitFor(() => expect(screen.getByTestId('modal-body-Searchable Select Modal')).toBeInTheDocument());
    await new Promise((r) => setTimeout(r, 350));

    // 3. open the menu living inside the topmost modal.
    // NOTE: `vanguard-searchable-select-input` lands on MUI's hidden native
    // <input> (unknown props are spread there), not the clickable combobox —
    // so we query by role instead. `hidden: true` is required — see
    // DrawerModalSelect.story.tsx for why (the Drawer's MUI modal-manager
    // stamps aria-hidden on the vanguard Modal's portal root).
    const select = within(screen.getByTestId('modal-body-Searchable Select Modal')).getByRole('combobox', {
      hidden: true,
    });
    await waitFor(() => expect(select).toBeVisible());
    await userEvent.click(select);
    await waitFor(() => expect(screen.getByRole('listbox')).toBeVisible());
    await new Promise((r) => setTimeout(r, 250));

    const drawerLayer = getDrawerLayer()!;
    const drawerZ = readZ(drawerLayer);

    const topModalRoot = screen.getByTestId('modal-body-Searchable Select Modal').closest('.modalRoot') as HTMLElement;
    const modalZ = readZ(topModalRoot);

    const optionEl = screen.getByText(OPTION_LABEL);
    const menuRoot = optionEl.closest('.MuiPopover-root') as HTMLElement;
    const menuZ = readZ(menuRoot);

    // The stack is above MUI's default 1300 — so a menu pinned to 1300 would
    // be buried. Strict ordering: drawer < modal < menu.
    await expect(drawerZ).toBeGreaterThanOrEqual(HIGH_FLOOR);
    await expect(modalZ).toBeGreaterThan(drawerZ);
    await expect(menuZ).toBeGreaterThan(modalZ);

    // Hit-test the option — the element painted at its centre belongs to the
    // menu layer, not the modal beneath it.
    const top = topmostElAt(optionEl);
    await expect(top && menuRoot.contains(top)).toBe(true);

    await closeAllOverlays();
  },
  render: () => {
    const openSelectModal = () => {
      ModalService.open(
        <Modal>
          <ModalHeader closeFn={() => ModalService.closeAllModals()}>Searchable Select Modal</ModalHeader>
          <div data-testid="modal-body-Searchable Select Modal" style={{ padding: 40, minWidth: 480, minHeight: 240, fontSize: 18 }}>
            <div style={{ marginBottom: 16 }}>This modal sits above a high-floor drawer.</div>
            <SearchableSelect options={domainOptions} />
          </div>
        </Modal>,
        { animation: 'pop' },
      );
    };

    const FloorDrawer = () => (
      <div data-testid="drawer-body-Floor Drawer" style={{ width: 360, padding: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 600 }}>Floor Drawer</div>
        <div>Opened at a raised z-index floor ({HIGH_FLOOR}).</div>
        <Button onClick={openSelectModal}>Open Searchable Select Modal</Button>
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
