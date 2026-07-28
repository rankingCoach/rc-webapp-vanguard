import React from 'react';
import { Button } from '@vanguard/Button/Button';
import { DrawerRoot } from '@vanguard/Drawer/DrawerRoot/DrawerRoot';
import { DrawerService } from '@vanguard/Drawer/DrawerService';
import { Modal } from '@vanguard/Modal/Modal';
import { ModalHeader } from '@vanguard/Modal/Modalheader/ModalHeader';
import { ModalService } from '@vanguard/Modal/ModalService';
import { Textarea } from '@vanguard/Textarea/Textarea';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import { closeAllOverlays, getDrawerLayer, readZ, Story, topmostElAt } from './_OverlayStacking.default';

/**
 * A highlight-URL Textarea living inside a Drawer, with a Modal opened on top:
 * the input's highlight backdrop (absolutely positioned, own z-index) must stay
 * local to the input — never paint above the modal, never block the textarea.
 */
export const ModalOverDrawerWithHighlightInput: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await closeAllOverlays();

    await userEvent.click(canvas.getByRole('button', { name: /open drawer/i }));
    await waitFor(() => expect(screen.getByTestId('drawer-body-highlight-input')).toBeInTheDocument());
    await new Promise((r) => setTimeout(r, 350));

    const drawerLayer = getDrawerLayer()!;
    const textarea = drawerLayer.querySelector('textarea') as HTMLTextAreaElement;
    const backdrop = drawerLayer.querySelector('.vanguard-input-backdrop') as HTMLElement;
    const chip = drawerLayer.querySelector('.vanguard-input-mark-blue') as HTMLElement;

    // Highlighting works inside the portaled drawer
    await expect(chip).not.toBeNull();
    await expect(chip.textContent).toBe('www.google.ro');

    // Backdrop geometry holds inside the drawer (portal + slide transform)
    await expect(backdrop.getBoundingClientRect().height).toBeCloseTo(textarea.getBoundingClientRect().height, 0);

    // The mirror must not leak into the overlay stacking range or block the input
    const backdropZ = readZ(backdrop);
    await expect(Number.isNaN(backdropZ) ? 0 : backdropZ).toBeLessThan(1100);
    await expect(topmostElAt(chip)).toBe(textarea);

    // Typing inside the drawer keeps highlighting alive
    await userEvent.type(textarea, ' and http://second-link.com', { delay: 1 });
    await new Promise((r) => setTimeout(r, 300));
    await expect(drawerLayer.querySelectorAll('.vanguard-input-mark-blue').length).toBe(2);

    // Modal over the drawer
    await userEvent.click(screen.getByRole('button', { name: /open modal over drawer/i }));
    await waitFor(() => expect(screen.getByTestId('modal-body-over-highlight-input')).toBeInTheDocument());
    await new Promise((r) => setTimeout(r, 350));

    const modalBody = screen.getByTestId('modal-body-over-highlight-input');
    const modalRoot = modalBody.closest('.modalRoot') as HTMLElement;
    await expect(readZ(modalRoot)).toBeGreaterThan(readZ(drawerLayer));

    // The fullscreen modal layer covers the input — nothing from the input
    // (chips, backdrop, textarea) may paint above it at the chip's coords
    const topAtChipWithModal = topmostElAt(chip);
    await expect(topAtChipWithModal).not.toBe(textarea);
    await expect(drawerLayer.contains(topAtChipWithModal!)).toBe(false);

    // ...and the modal body itself is hit-testable
    const topAtModal = topmostElAt(modalBody);
    await expect(topAtModal && modalRoot.contains(topAtModal)).toBe(true);

    // Closing the modal hands the input back to the user, highlights intact
    ModalService.closeAllModals();
    await new Promise((r) => setTimeout(r, 350));
    await expect(topmostElAt(chip)).toBe(textarea);
    await expect(drawerLayer.querySelectorAll('.vanguard-input-mark-blue').length).toBe(2);

    await closeAllOverlays();
  },
  render: () => {
    const openModal = () =>
      ModalService.open(
        <Modal>
          <ModalHeader closeFn={() => ModalService.closeAllModals()}>Modal Over Highlight Input</ModalHeader>
          <div
            data-testid="modal-body-over-highlight-input"
            style={{ padding: '40px', minWidth: 480, minHeight: 320, fontSize: 18 }}
          >
            Modal body — must paint above the drawer and the highlight backdrop.
          </div>
        </Modal>,
      );

    const DrawerWithHighlightInput = () => (
      <div data-testid="drawer-body-highlight-input" style={{ width: 400, padding: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 600 }}>Drawer with highlight input</div>
        <div style={{ margin: '16px 0' }}>
          <Textarea
            testId="drawer-highlight-textarea"
            label="Post text"
            highlightUrl={true}
            highlightUrlType="info"
            allowBreakLines={true}
            value="Check this link www.google.ro for details"
            valueAsDefaultValue={true}
          />
        </div>
        <Button onClick={openModal}>Open Modal Over Drawer</Button>
      </div>
    );

    return (
      <>
        <DrawerRoot />
        <Button onClick={() => DrawerService.open(<DrawerWithHighlightInput />)}>Open Drawer</Button>
      </>
    );
  },
};
