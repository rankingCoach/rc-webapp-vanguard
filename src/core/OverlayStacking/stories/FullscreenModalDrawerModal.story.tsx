import React from 'react';
import { Button } from '@vanguard/Button/Button';
import { DrawerRoot } from '@vanguard/Drawer/DrawerRoot/DrawerRoot';
import { DrawerService } from '@vanguard/Drawer/DrawerService';
import { Input } from '@vanguard/Input/Input';
import { Modal } from '@vanguard/Modal/Modal';
import { ModalHeader } from '@vanguard/Modal/Modalheader/ModalHeader';
import { ModalService } from '@vanguard/Modal/ModalService';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import { closeAllOverlays, getDrawerLayer, readZ, Story, topmostElAt } from './_OverlayStacking.default';

export const FullscreenModalDrawerModal: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await closeAllOverlays();

    // 1. fullscreen modal
    await userEvent.click(canvas.getByRole('button', { name: /open fullscreen modal/i }));
    await waitFor(() => expect(screen.getByTestId('modal-body-Fullscreen Base')).toBeInTheDocument());
    await new Promise((r) => setTimeout(r, 300));

    // 2. drawer on top of fullscreen modal (opened from inside it)
    await userEvent.click(screen.getByRole('button', { name: /open drawer/i }));
    await waitFor(() => expect(screen.getByTestId('drawer-body-Middle Drawer')).toBeInTheDocument());
    await new Promise((r) => setTimeout(r, 350));

    // 3. regular modal on top of drawer (opened from inside the drawer)
    await userEvent.click(screen.getByRole('button', { name: /open top modal/i }));
    await waitFor(() => expect(screen.getByTestId('modal-body-Top Modal')).toBeInTheDocument());
    await new Promise((r) => setTimeout(r, 350));

    const baseModalRoot = screen.getByTestId('modal-body-Fullscreen Base').closest('.modalRoot') as HTMLElement;
    const baseZ = readZ(baseModalRoot);

    const drawerLayer = getDrawerLayer()!;
    const drawerZ = readZ(drawerLayer);

    const topModalRoot = screen.getByTestId('modal-body-Top Modal').closest('.modalRoot') as HTMLElement;
    const topZ = readZ(topModalRoot);

    // Strict ordering: base < drawer < top.
    await expect(baseZ).toBeGreaterThanOrEqual(1101);
    await expect(drawerZ).toBeGreaterThan(baseZ);
    await expect(topZ).toBeGreaterThan(drawerZ);

    // Hit-test the topmost surface. The element painted at its center must
    // belong to the top modal — not the drawer, not the base modal.
    const topBody = screen.getByTestId('modal-body-Top Modal');
    const top = topmostElAt(topBody);
    await expect(top && topModalRoot.contains(top)).toBe(true);

    await closeAllOverlays();
  },
  render: () => {
    const openTopModal = () => {
      ModalService.open(
        <Modal>
          <ModalHeader closeFn={() => ModalService.closeAllModals()}>Top Modal</ModalHeader>
          <div
            data-testid="modal-body-Top Modal"
            style={{ padding: '40px', minWidth: 480, minHeight: 320, fontSize: 18, display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            <div>Modal body — Top Modal</div>
            <Input label="Name" type="text" placeholder="Enter your name" testId="top-modal-name" />
            <Input label="Email" type="email" placeholder="Enter your email" testId="top-modal-email" />
          </div>
        </Modal>,
        { animation: 'pop' },
      );
    };

    const MiddleDrawer = () => (
      <div data-testid="drawer-body-Middle Drawer" style={{ width: 360, padding: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 600 }}>Middle Drawer</div>
        <div>Opened from inside the fullscreen modal.</div>
        <Button onClick={openTopModal}>Open Top Modal</Button>
      </div>
    );

    const openDrawer = () => {
      DrawerService.open(<MiddleDrawer />);
    };

    const openFullscreenModal = () => {
      const Body = ({ close }: { close: () => void }) => (
        <Modal fullscreen={true}>
          <ModalHeader closeFn={close}>Fullscreen Base</ModalHeader>
          <div
            data-testid="modal-body-Fullscreen Base"
            style={{ padding: 40, minHeight: '80vh', fontSize: 18 }}
          >
            <div>Fullscreen base modal body</div>
            <Button onClick={openDrawer}>Open Drawer</Button>
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
