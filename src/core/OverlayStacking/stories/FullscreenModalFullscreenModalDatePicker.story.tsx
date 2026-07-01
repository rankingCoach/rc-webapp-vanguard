import React from 'react';
import { Button } from '@vanguard/Button/Button';
import { DatePicker } from '@vanguard/DatePicker/DatePicker';
import { Modal } from '@vanguard/Modal/Modal';
import { ModalHeader } from '@vanguard/Modal/Modalheader/ModalHeader';
import { ModalService } from '@vanguard/Modal/ModalService';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import { closeAllOverlays, readZ, Story } from './_OverlayStacking.default';

/**
 * Two stacked fullscreen modals with distinct entrance animations, the
 * topmost one owning a DatePicker.
 *
 * Stack: fullscreen modal #1 ('grow' — animates top to bottom) -> fullscreen
 * modal #2 on top ('slide' — animates right to left) -> the topmost modal
 * owns a DatePicker. Opening the calendar must register with
 * OverlayStackingService and remain visible above both fullscreen modals.
 */
export const FullscreenModalFullscreenModalDatePicker: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await closeAllOverlays();

    // 1. first fullscreen modal, animates top -> down
    await userEvent.click(canvas.getByRole('button', { name: /open top-down modal/i }));
    await waitFor(() => expect(screen.getByTestId('modal-body-Top Down Modal')).toBeInTheDocument());
    await new Promise((r) => setTimeout(r, 450));

    // 2. second fullscreen modal on top, animates right -> left
    await userEvent.click(screen.getByRole('button', { name: /open right-to-left modal/i }));
    await waitFor(() => expect(screen.getByTestId('modal-body-Right Left Modal')).toBeInTheDocument());
    await new Promise((r) => setTimeout(r, 450));

    // 3. open the calendar living inside the topmost fullscreen modal.
    const input = screen.getByTestId('modal-body-Right Left Modal').querySelector('input') as HTMLInputElement;
    await waitFor(() => expect(input).toBeVisible());
    await userEvent.click(input);
    await waitFor(() => expect(document.querySelector('.MuiCalendarPicker-root')).toBeTruthy());
    await new Promise((r) => setTimeout(r, 250));

    const bottomModalRoot = screen.getByTestId('modal-body-Top Down Modal').closest('.modalRoot') as HTMLElement;
    const bottomModalZ = readZ(bottomModalRoot);

    const topModalRoot = screen.getByTestId('modal-body-Right Left Modal').closest('.modalRoot') as HTMLElement;
    const topModalZ = readZ(topModalRoot);

    const calendarRoot = document.querySelector('.MuiCalendarPicker-root') as HTMLElement;
    const popperRoot = calendarRoot.closest('.MuiPickersPopper-root') as HTMLElement;
    const popperZ = readZ(popperRoot);

    // Strict ordering: bottom fullscreen modal < top fullscreen modal < calendar popper.
    await expect(topModalZ).toBeGreaterThan(bottomModalZ);
    await expect(popperZ).toBeGreaterThan(topModalZ);

    // The calendar must actually be visible on screen (not just z-ordered
    // correctly) — confirm it has a non-zero painted size.
    const rect = calendarRoot.getBoundingClientRect();
    await expect(rect.width).toBeGreaterThan(0);
    await expect(rect.height).toBeGreaterThan(0);
    await expect(getComputedStyle(popperRoot).visibility).not.toBe('hidden');
    await expect(getComputedStyle(popperRoot).display).not.toBe('none');

    await closeAllOverlays();
  },
  render: () => {
    const openRightLeftModal = () => {
      ModalService.open(
        <Modal>
          <ModalHeader closeFn={() => ModalService.closeAllModals()}>Right Left Modal</ModalHeader>
          <div
            data-testid="modal-body-Right Left Modal"
            style={{ padding: 40, minWidth: 480, minHeight: 240, fontSize: 18 }}
          >
            <div style={{ marginBottom: 16 }}>Fullscreen modal #2 — slides in right to left.</div>
            <DatePicker label="Start date" locale="en-GB" />
          </div>
        </Modal>,
        { animation: 'slide', fullscreen: true },
      );
    };

    const openTopDownModal = () => {
      ModalService.open(
        <Modal>
          <ModalHeader closeFn={() => ModalService.closeAllModals()}>Top Down Modal</ModalHeader>
          <div
            data-testid="modal-body-Top Down Modal"
            style={{ padding: 40, minWidth: 480, minHeight: 240, fontSize: 18 }}
          >
            <div style={{ marginBottom: 16 }}>Fullscreen modal #1 — grows in top to bottom.</div>
            <Button onClick={openRightLeftModal}>Open Right-to-Left Modal</Button>
          </div>
        </Modal>,
        { animation: 'grow', fullscreen: true },
      );
    };

    return <Button onClick={openTopDownModal}>Open Top-Down Modal</Button>;
  },
};
