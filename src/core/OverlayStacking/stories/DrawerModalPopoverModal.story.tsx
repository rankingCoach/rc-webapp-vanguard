import React, { useRef, useState } from 'react';
import { Button } from '@vanguard/Button/Button';
import { DrawerRoot } from '@vanguard/Drawer/DrawerRoot/DrawerRoot';
import { DrawerService } from '@vanguard/Drawer/DrawerService';
import { Modal } from '@vanguard/Modal/Modal';
import { ModalHeader } from '@vanguard/Modal/Modalheader/ModalHeader';
import { ModalService } from '@vanguard/Modal/ModalService';
import { PopoverModal } from '@vanguard/PopoverModal/PopoverModal';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import { closeAllOverlays, getDrawerLayer, readZ, Story } from './_OverlayStacking.default';

// Raise the stacking floor so the whole overlay stack sits *above* the legacy
// `zIndex + 1031` floor PopoverModal guarantees on its own. This is the repro:
// before registering with OverlayStackingService the popper was pinned to that
// static floor and painted behind a 9000+ stack.
const HIGH_FLOOR = 9000;

const PopoverModalOwner = () => {
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);

  return (
    <div ref={anchorRef} style={{ display: 'inline-block' }}>
      <Button testId="popover-modal-trigger" onClick={() => setIsOpen(true)}>
        Open PopoverModal
      </Button>
      <PopoverModal
        isOpen={isOpen}
        anchorEl={anchorRef.current}
        renderInPortal
        dimRestOfPage
        onClose={() => setIsOpen(false)}
        content={
          <div
            data-testid="popover-modal-content"
            style={{ background: 'white', padding: 16, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
          >
            PopoverModal content
          </div>
        }
      />
    </div>
  );
};

/**
 * PopoverModal on the topmost surface.
 *
 * Stack: drawer (floor raised to 9000) -> modal on top -> the modal owns a
 * PopoverModal rendered in a portal. Opening it must register a 'popover' slot
 * with OverlayStackingService and paint *above* the modal it lives in. Before
 * the fix the popper used only its static `zIndex + 1031` floor and rendered
 * behind the 9000+ stack.
 */
export const DrawerModalPopoverModal: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await closeAllOverlays();

    // 1. drawer with a raised floor (mimics covering a 3rd-party widget at 9000)
    await userEvent.click(canvas.getByRole('button', { name: /open drawer/i }));
    await waitFor(() => expect(screen.getByTestId('drawer-body-Floor Drawer')).toBeInTheDocument());
    await new Promise((r) => setTimeout(r, 350));

    // 2. modal on top of the drawer — inherits the sticky 9000 floor
    await userEvent.click(screen.getByRole('button', { name: /open popovermodal modal/i }));
    await waitFor(() => expect(screen.getByTestId('modal-body-PopoverModal Modal')).toBeInTheDocument());
    await new Promise((r) => setTimeout(r, 350));

    // 3. click the trigger living inside the topmost modal to open the PopoverModal
    const trigger = within(screen.getByTestId('modal-body-PopoverModal Modal')).getByTestId('popover-modal-trigger');
    await waitFor(() => expect(trigger).toBeVisible());
    await userEvent.click(trigger);
    await waitFor(() => expect(screen.getByTestId('popover-modal-content')).toBeVisible());
    await new Promise((r) => setTimeout(r, 250));

    const drawerLayer = getDrawerLayer()!;
    const drawerZ = readZ(drawerLayer);

    const topModalRoot = screen.getByTestId('modal-body-PopoverModal Modal').closest('.modalRoot') as HTMLElement;
    const modalZ = readZ(topModalRoot);

    const popperRoot = screen.getByTestId('popover-modal-content').closest('.MuiPopper-root') as HTMLElement;
    const popperZ = readZ(popperRoot);

    // The stack is above PopoverModal's static 1031 floor — so a popper pinned
    // to it would be buried. Strict ordering: drawer < modal < popper.
    await expect(drawerZ).toBeGreaterThanOrEqual(HIGH_FLOOR);
    await expect(modalZ).toBeGreaterThan(drawerZ);
    await expect(popperZ).toBeGreaterThan(modalZ);

    await closeAllOverlays();
  },
  render: () => {
    const openPopoverModalModal = () => {
      ModalService.open(
        <Modal>
          <ModalHeader closeFn={() => ModalService.closeAllModals()}>PopoverModal Modal</ModalHeader>
          <div
            data-testid="modal-body-PopoverModal Modal"
            style={{ padding: 80, minWidth: 480, minHeight: 240, fontSize: 18 }}
          >
            <div style={{ marginBottom: 16 }}>This modal sits above a high-floor drawer.</div>
            <PopoverModalOwner />
          </div>
        </Modal>,
        { animation: 'pop' },
      );
    };

    const FloorDrawer = () => (
      <div data-testid="drawer-body-Floor Drawer" style={{ width: 360, padding: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 600 }}>Floor Drawer</div>
        <div>Opened at a raised z-index floor ({HIGH_FLOOR}).</div>
        <Button onClick={openPopoverModalModal}>Open PopoverModal Modal</Button>
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
