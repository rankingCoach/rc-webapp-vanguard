import React, { useState } from 'react';
import { Button } from '@vanguard/Button/Button';
import { DrawerRoot } from '@vanguard/Drawer/DrawerRoot/DrawerRoot';
import { DrawerService } from '@vanguard/Drawer/DrawerService';
import { Menu } from '@vanguard/Menu/Menu';
import { Modal } from '@vanguard/Modal/Modal';
import { ModalHeader } from '@vanguard/Modal/Modalheader/ModalHeader';
import { ModalService } from '@vanguard/Modal/ModalService';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import { closeAllOverlays, getDrawerLayer, readZ, Story, topmostElAt } from './_OverlayStacking.default';

// Raise the stacking floor so the whole overlay stack sits *above* MUI's static
// `theme.zIndex.modal` (1300). This is the realistic repro: an unfixed Menu
// would paint at MUI's static z-index and would disappear behind this stack.
const HIGH_FLOOR = 9000;

const MENU_ITEM_LABEL = 'Duplicate';

/**
 * Menu on the topmost surface.
 *
 * Stack: drawer (floor raised to 9000) -> modal on top -> the modal owns a
 * Menu. Opening the Menu must register with OverlayStackingService and paint
 * *above* the modal it lives in. Before the fix the MUI Menu used its static
 * `theme.zIndex.modal` (1300) and rendered behind the 9000+ stack.
 */
export const DrawerModalMenu: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await closeAllOverlays();

    // 1. drawer with a raised floor (mimics covering a 3rd-party widget at 9000)
    await userEvent.click(canvas.getByRole('button', { name: /open drawer/i }));
    await waitFor(() => expect(screen.getByTestId('drawer-body-Floor Drawer')).toBeInTheDocument());
    await new Promise((r) => setTimeout(r, 350));

    // 2. modal on top of the drawer — inherits the sticky 9000 floor
    await userEvent.click(screen.getByRole('button', { name: /open menu modal/i }));
    await waitFor(() => expect(screen.getByTestId('modal-body-Menu Modal')).toBeInTheDocument());
    await new Promise((r) => setTimeout(r, 350));

    // 3. open the Menu living inside the topmost modal.
    // NOTE: `hidden: true` is required — see DrawerModalSelect.story.tsx for why
    // (the Drawer's MUI modal-manager stamps aria-hidden on the vanguard Modal's
    // portal root, so this trigger sits outside the default accessibility tree).
    const trigger = within(screen.getByTestId('modal-body-Menu Modal')).getByRole('button', {
      name: /open menu/i,
      hidden: true,
    });
    await waitFor(() => expect(trigger).toBeVisible());
    await userEvent.click(trigger);
    await waitFor(() => expect(screen.getByRole('menu')).toBeVisible());
    await new Promise((r) => setTimeout(r, 250));

    const drawerLayer = getDrawerLayer()!;
    const drawerZ = readZ(drawerLayer);

    const topModalRoot = screen.getByTestId('modal-body-Menu Modal').closest('.modalRoot') as HTMLElement;
    const modalZ = readZ(topModalRoot);

    const menuItem = screen.getByRole('menuitem', { name: MENU_ITEM_LABEL });
    const menuRoot = menuItem.closest('.MuiPopover-root') as HTMLElement;
    const menuZ = readZ(menuRoot);

    // The stack is above MUI's default 1300 — so a menu pinned to 1300 would
    // be buried. Strict ordering: drawer < modal < menu.
    await expect(drawerZ).toBeGreaterThanOrEqual(HIGH_FLOOR);
    await expect(modalZ).toBeGreaterThan(drawerZ);
    await expect(menuZ).toBeGreaterThan(modalZ);

    // Hit-test the menu item — the element painted at its centre belongs to
    // the menu layer, not the modal beneath it.
    const top = topmostElAt(menuItem);
    await expect(top && menuRoot.contains(top)).toBe(true);

    await closeAllOverlays();
  },
  render: () => {
    const MenuTrigger = () => {
      const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
      return (
        <>
          <Button onClick={(e) => setAnchorEl(e.currentTarget as HTMLElement)}>Open Menu</Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            items={[
              { key: 'edit', children: 'Edit' },
              { key: 'duplicate', children: MENU_ITEM_LABEL },
              { key: 'archive', children: 'Archive' },
            ]}
          />
        </>
      );
    };

    const openMenuModal = () => {
      ModalService.open(
        <Modal>
          <ModalHeader closeFn={() => ModalService.closeAllModals()}>Menu Modal</ModalHeader>
          <div data-testid="modal-body-Menu Modal" style={{ padding: 40, minWidth: 480, minHeight: 240, fontSize: 18 }}>
            <div style={{ marginBottom: 16 }}>This modal sits above a high-floor drawer.</div>
            <MenuTrigger />
          </div>
        </Modal>,
        { animation: 'pop' },
      );
    };

    const FloorDrawer = () => (
      <div data-testid="drawer-body-Floor Drawer" style={{ width: 360, padding: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 600 }}>Floor Drawer</div>
        <div>Opened at a raised z-index floor ({HIGH_FLOOR}).</div>
        <Button onClick={openMenuModal}>Open Menu Modal</Button>
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
