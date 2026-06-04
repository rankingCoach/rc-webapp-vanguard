import React from 'react';
import { Button } from '@vanguard/Button/Button';
import { DrawerRoot } from '@vanguard/Drawer/DrawerRoot/DrawerRoot';
import { DrawerService } from '@vanguard/Drawer/DrawerService';
import { Modal } from '@vanguard/Modal/Modal';
import { ModalHeader } from '@vanguard/Modal/Modalheader/ModalHeader';
import { ModalService } from '@vanguard/Modal/ModalService';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import { closeAllOverlays, getDrawerLayer, readZ, Story, topmostElAt } from './_OverlayStacking.default';

const DrawerBody = ({ label }: { label: string }) => (
  <div data-testid={`drawer-body-${label}`} style={{ width: 360, padding: 24 }}>
    <div style={{ fontSize: 20, fontWeight: 600 }}>{label}</div>
    <div>Drawer body content — should sit at its registered layer.</div>
  </div>
);

export const DrawerOverFullscreenModal: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await closeAllOverlays();

    await userEvent.click(canvas.getByRole('button', { name: /open fullscreen modal/i }));
    await waitFor(() => expect(screen.getByTestId('modal-body-Fullscreen Modal')).toBeInTheDocument());
    await new Promise((r) => setTimeout(r, 300));

    // Drawer is opened from within the fullscreen modal.
    await userEvent.click(screen.getByRole('button', { name: /open drawer on top/i }));
    await waitFor(() => expect(screen.getByTestId('drawer-body-Drawer Over Modal')).toBeInTheDocument());
    await new Promise((r) => setTimeout(r, 350));

    const modalBody = screen.getByTestId('modal-body-Fullscreen Modal');
    const modalRoot = modalBody.closest('.modalRoot') as HTMLElement;
    const modalZ = readZ(modalRoot);

    const drawerLayer = getDrawerLayer()!;
    const drawerZ = readZ(drawerLayer);

    await expect(modalZ).toBeGreaterThanOrEqual(1101);
    await expect(drawerZ).toBeGreaterThan(modalZ);

    const drawerBody = screen.getByTestId('drawer-body-Drawer Over Modal');
    const top = topmostElAt(drawerBody);
    await expect(top && drawerLayer.contains(top)).toBe(true);

    await closeAllOverlays();
  },
  render: () => {
    const openFullscreenModal = () => {
      const Body = ({ close }: { close: () => void }) => (
        <Modal fullscreen={true}>
          <ModalHeader closeFn={close}>Fullscreen Modal</ModalHeader>
          <div
            data-testid="modal-body-Fullscreen Modal"
            style={{ padding: 40, minHeight: '80vh', fontSize: 18 }}
          >
            <div>Fullscreen modal body</div>
            <Button onClick={() => DrawerService.open(<DrawerBody label="Drawer Over Modal" />)}>
              Open Drawer On Top
            </Button>
          </div>
        </Modal>
      );
      ModalService.open(<Body close={() => ModalService.closeAllModals()} />);
    };

    return (
      <>
        <DrawerRoot />
        <Button onClick={openFullscreenModal}>Open Fullscreen Modal</Button>
      </>
    );
  },
};
