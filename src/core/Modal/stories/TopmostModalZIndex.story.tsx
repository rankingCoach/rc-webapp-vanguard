import React, { useState } from 'react';
import { userEvent, within, expect, screen } from 'storybook/test';
import { MODAL_BASE_Z_INDEX, ModalService } from '@vanguard/Modal/ModalService';
import { Modal } from '@vanguard/Modal/Modal';
import { Button } from '@vanguard/Button/Button';
import { ModalHeader } from '@vanguard/Modal/Modalheader/ModalHeader';
import { Story, closeAllModals } from './_Modal.default';

const SampleModal = ({ id, close }: { id: string; close: () => void }) => {
  return (
    <Modal>
      <ModalHeader closeFn={close}>Modal {id}</ModalHeader>
      <div style={{ padding: '20px', minWidth: '300px' }}>Modal body {id}</div>
    </Modal>
  );
};

const getModalIds = () => Array.from((ModalService as any).modalOrder.keys()) as string[];

const Panel = () => {
  const [, force] = useState(0);
  const refresh = () => force((n) => n + 1);

  const open = () => {
    ModalService.open(<SampleModal id={String(Date.now())} close={() => {}} />);
    refresh();
  };
  const closeAll = () => {
    const ids = getModalIds();
    ModalService.closeAllModals();
    ids.forEach((id) => ModalService.removeModalComponent(id));
    refresh();
  };
  const closeTopmost = () => {
    const ids = getModalIds();
    if (ids.length) {
      const topId = ids[ids.length - 1];
      ModalService.closeEv(topId);
      ModalService.removeModalComponent(topId);
    }
    refresh();
  };
  const closeBottom = () => {
    const ids = getModalIds();
    if (ids.length) {
      const bottomId = ids[0];
      ModalService.closeEv(bottomId);
      ModalService.removeModalComponent(bottomId);
    }
    refresh();
  };

  const z = ModalService.getTopmostModalZIndex();
  const count = getModalIds().length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div data-testid="z-readout">Topmost z-index: {z}</div>
      <div data-testid="count-readout">Open modals: {count}</div>
      <Button onClick={open}>Open Modal</Button>
      <Button onClick={closeTopmost}>Close Topmost</Button>
      <Button onClick={closeBottom}>Close Bottom</Button>
      <Button onClick={closeAll}>Close All</Button>
    </div>
  );
};

const readZ = () => {
  const el = screen.getByTestId('z-readout');
  const m = el.textContent?.match(/-?\d+/);
  return m ? parseInt(m[0], 10) : NaN;
};

const getControls = (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  return {
    openBtn: canvas.getByRole('button', { name: /open modal/i }),
    closeTopBtn: canvas.getByRole('button', { name: /close topmost/i }),
    closeBottomBtn: canvas.getByRole('button', { name: /close bottom/i }),
    closeAllBtn: canvas.getByRole('button', { name: /close all/i }),
  };
};

export const TopmostModalZIndex: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    await closeAllModals();
    const { openBtn, closeTopBtn, closeAllBtn } = getControls(canvasElement);

    await expect(readZ()).toBe(MODAL_BASE_Z_INDEX);

    await userEvent.click(openBtn);
    await expect(readZ()).toBe(MODAL_BASE_Z_INDEX + 1);

    await userEvent.click(openBtn);
    await userEvent.click(openBtn);
    await expect(readZ()).toBe(MODAL_BASE_Z_INDEX + 3);

    await userEvent.click(closeTopBtn);
    await expect(readZ()).toBe(MODAL_BASE_Z_INDEX + 2);

    await userEvent.click(closeAllBtn);
    await expect(readZ()).toBe(MODAL_BASE_Z_INDEX);

    await userEvent.click(openBtn);
    await expect(readZ()).toBe(MODAL_BASE_Z_INDEX + 1);

    await closeAllModals();
  },
  render: () => <Panel />,
};

// Removing a non-topmost modal must NOT lower the topmost z-index;
// a new modal then slots above the current max.
export const TopmostUnaffectedByBottomClose: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    await closeAllModals();
    const { openBtn, closeBottomBtn } = getControls(canvasElement);

    await userEvent.click(openBtn); // order 1
    await userEvent.click(openBtn); // order 2
    await userEvent.click(openBtn); // order 3
    await expect(readZ()).toBe(MODAL_BASE_Z_INDEX + 3);

    await userEvent.click(closeBottomBtn);
    await expect(readZ()).toBe(MODAL_BASE_Z_INDEX + 3);

    await userEvent.click(openBtn);
    await expect(readZ()).toBe(MODAL_BASE_Z_INDEX + 4);

    await closeAllModals();
  },
  render: () => <Panel />,
};

// Stack 10 deep, then tear down from the top — each pop should drop topmost by exactly 1.
export const DeepStackTearDown: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    await closeAllModals();
    const { openBtn, closeTopBtn } = getControls(canvasElement);

    for (let i = 0; i < 10; i++) await userEvent.click(openBtn);
    await expect(readZ()).toBe(MODAL_BASE_Z_INDEX + 10);

    for (let i = 10; i >= 1; i--) {
      await expect(readZ()).toBe(MODAL_BASE_Z_INDEX + i);
      await userEvent.click(closeTopBtn);
    }
    await expect(readZ()).toBe(MODAL_BASE_Z_INDEX);

    await closeAllModals();
  },
  render: () => <Panel />,
};

// Tracked modals (confirm/accept/loading) go through the same accounting path as `open()`.
export const TrackedModalsCountedSame: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    await closeAllModals();
    const { openBtn } = getControls(canvasElement);

    await userEvent.click(openBtn);
    await expect(readZ()).toBe(MODAL_BASE_Z_INDEX + 1);

    // Open a confirm modal directly via the service
    ModalService.openConfirmModal({ closeFn: () => {}, message: 'Confirm body' });
    // Wait for the open pub/sub round-trip
    await new Promise((resolve) => setTimeout(resolve, 50));
    await expect(ModalService.getTopmostModalZIndex()).toBe(MODAL_BASE_Z_INDEX + 2);

    ModalService.closeConfirmModal();
    await new Promise((resolve) => setTimeout(resolve, 50));
    await expect(ModalService.getTopmostModalZIndex()).toBe(MODAL_BASE_Z_INDEX + 1);

    await closeAllModals();
  },
  render: () => <Panel />,
};
