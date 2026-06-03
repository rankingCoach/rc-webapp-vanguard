import React from 'react';
import { Button } from '@vanguard/Button/Button';
import { DrawerRoot } from '@vanguard/Drawer/DrawerRoot/DrawerRoot';
import { DrawerService } from '@vanguard/Drawer/DrawerService';
import { Modal } from '@vanguard/Modal/Modal';
import { ModalHeader } from '@vanguard/Modal/Modalheader/ModalHeader';
import { ModalService } from '@vanguard/Modal/ModalService';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import { closeAllOverlays, getDrawerLayer, readZ, Story, topmostElAt } from './_OverlayStacking.default';

export const ModalOverDrawer: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await closeAllOverlays();

    await userEvent.click(canvas.getByRole('button', { name: /open drawer/i }));
    await waitFor(() => expect(screen.getByTestId('drawer-body-Drawer A')).toBeInTheDocument());

    // Trigger the modal from inside the drawer — the drawer covers the page so
    // a host-level button would be unreachable to the user.
    await userEvent.click(screen.getByRole('button', { name: /open modal over drawer/i }));
    await waitFor(() => expect(screen.getByTestId('modal-body-Modal Over Drawer')).toBeInTheDocument());
    await new Promise((r) => setTimeout(r, 350));

    const drawerLayer = getDrawerLayer()!;
    const drawerZ = readZ(drawerLayer);

    const modalBody = screen.getByTestId('modal-body-Modal Over Drawer');
    const modalRoot = modalBody.closest('.modalRoot') as HTMLElement;
    const modalZ = readZ(modalRoot);

    await expect(drawerZ).toBeGreaterThanOrEqual(1101);
    await expect(modalZ).toBeGreaterThan(drawerZ);

    // Hit-test the modal body — the topmost element at its coords belongs to the modal layer.
    const top = topmostElAt(modalBody);
    await expect(top && modalRoot.contains(top)).toBe(true);

    await closeAllOverlays();
  },
  render: () => {
    const openModal = () =>
      ModalService.open(
        <Modal>
          <ModalHeader closeFn={() => ModalService.closeAllModals()}>Modal Over Drawer</ModalHeader>
          <div
            data-testid="modal-body-Modal Over Drawer"
            style={{ padding: '40px', minWidth: 480, minHeight: 320, fontSize: 18 }}
          >
            Modal body — Modal Over Drawer
          </div>
        </Modal>,
      );

    const DrawerWithModalTrigger = () => (
      <div data-testid="drawer-body-Drawer A" style={{ width: 360, padding: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 600 }}>Drawer A</div>
        <div>Drawer body content — modal trigger lives in here so it stays reachable.</div>
        <div style={{ marginTop: 16 }}>
          <Button onClick={openModal}>Open Modal Over Drawer</Button>
        </div>
      </div>
    );

    return (
      <>
        <DrawerRoot />
        <Button onClick={() => DrawerService.open(<DrawerWithModalTrigger />)}>Open Drawer</Button>
      </>
    );
  },
};
