import React from 'react';
import { ActionCard } from '@vanguard/ActionCard/ActionCard';
import { ActionCardActionProps } from '@vanguard/ActionCard/ActionCardActions/ActionCardAction/ActionCardAction';
import { ActionCardHeader } from '@vanguard/ActionCard/ActionCardHeader/ActionCardHeader';
import { Button } from '@vanguard/Button/Button';
import { DrawerRoot } from '@vanguard/Drawer/DrawerRoot/DrawerRoot';
import { DrawerService } from '@vanguard/Drawer/DrawerService';
import { Input } from '@vanguard/Input/Input';
import { Modal } from '@vanguard/Modal/Modal';
import { ModalHeader } from '@vanguard/Modal/Modalheader/ModalHeader';
import { ModalService } from '@vanguard/Modal/ModalService';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import { closeAllOverlays, getDrawerLayer, readZ, Story, topmostElAt } from './_OverlayStacking.default';

const POPOVER_ITEM_LABEL = 'Secondary Popover Action';

export const FullscreenModalDrawerModalPopover: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await closeAllOverlays();

    // 1. fullscreen modal
    await userEvent.click(canvas.getByRole('button', { name: /open fullscreen modal/i }));
    await waitFor(() => expect(screen.getByTestId('modal-body-Fullscreen Base')).toBeInTheDocument());
    await new Promise((r) => setTimeout(r, 300));

    // 2. drawer on top of fullscreen modal
    await userEvent.click(screen.getByRole('button', { name: /open drawer/i }));
    await waitFor(() => expect(screen.getByTestId('drawer-body-Middle Drawer')).toBeInTheDocument());
    await new Promise((r) => setTimeout(r, 350));

    // 3. regular modal on top of drawer
    await userEvent.click(screen.getByRole('button', { name: /open top modal/i }));
    await waitFor(() => expect(screen.getByTestId('modal-body-Top Modal')).toBeInTheDocument());
    await new Promise((r) => setTimeout(r, 350));

    // 4. popover on top of regular modal (ActionCard meatballs menu)
    await userEvent.click(screen.getByTestId('action-card-header-open-menu-cta'));
    await new Promise((r) => setTimeout(r, 350));
    await waitFor(() => expect(screen.getByText(POPOVER_ITEM_LABEL)).toBeVisible());

    const baseModalRoot = screen.getByTestId('modal-body-Fullscreen Base').closest('.modalRoot') as HTMLElement;
    const baseZ = readZ(baseModalRoot);

    const drawerLayer = getDrawerLayer()!;
    const drawerZ = readZ(drawerLayer);

    const topModalRoot = screen.getByTestId('modal-body-Top Modal').closest('.modalRoot') as HTMLElement;
    const topZ = readZ(topModalRoot);

    const popoverItem = screen.getByText(POPOVER_ITEM_LABEL);
    const popoverRoot = popoverItem.closest('.MuiPopper-root') as HTMLElement;
    const popoverZ = readZ(popoverRoot);

    // Strict ordering: base < drawer < top modal < popover.
    await expect(baseZ).toBeGreaterThanOrEqual(1101);
    await expect(drawerZ).toBeGreaterThan(baseZ);
    await expect(topZ).toBeGreaterThan(drawerZ);
    await expect(popoverZ).toBeGreaterThan(topZ);

    // Hit-test the popover item — the element painted at its center belongs to
    // the popover layer, not the modal/drawer beneath it.
    const top = topmostElAt(popoverItem);
    await expect(top && popoverRoot.contains(top)).toBe(true);

    await closeAllOverlays();
  },
  render: () => {
    const popoverActions: ActionCardActionProps[] = [
      { label: 'Primary Action', cta: () => {}, type: 'primary' },
      { label: POPOVER_ITEM_LABEL, cta: () => {}, type: 'secondary' },
      { label: 'Secondary Popover Action B', cta: () => {}, type: 'secondary' },
    ];

    const openTopModal = () => {
      ModalService.open(
        <Modal>
          <ModalHeader closeFn={() => ModalService.closeAllModals()}>Top Modal</ModalHeader>
          <div
            data-testid="modal-body-Top Modal"
            style={{
              padding: '40px',
              minWidth: 480,
              minHeight: 320,
              fontSize: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <Input label="Note" type="text" placeholder="Enter a note" testId="top-modal-note" />
            <ActionCard actions={popoverActions}>
              <ActionCardHeader actions={popoverActions}>
                <span>Card with secondary actions</span>
              </ActionCardHeader>
              <div>Click the meatballs menu to open the popover on top.</div>
            </ActionCard>
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
