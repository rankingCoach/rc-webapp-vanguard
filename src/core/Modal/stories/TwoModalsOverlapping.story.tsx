import React from "react";
import { userEvent, within, expect, screen } from "storybook/test";
import { ModalService } from "@vanguard/Modal/ModalService";
import { Modal } from "@vanguard/Modal/Modal";
import { Button } from "@vanguard/Button/Button";
import { ModalHeader } from "@vanguard/Modal/Modalheader/ModalHeader";
import { Story, closeAllModals } from "./_Modal.default";

const OverlapModal = ({ id, close }: { id: string; close: () => void }) => {
  return (
    <Modal fullscreen>
      <ModalHeader closeFn={close}>BIG Modal {id}</ModalHeader>
      <div style={{ padding: "40px", fontSize: "32px" }}>
        <p>This is BIG fullscreen modal {id}</p>
      </div>
    </Modal>
  );
};

export const TwoModalsOverlapping: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await closeAllModals();

    const openFirst = canvas.getByRole('button', { name: /open modal a/i });
    await userEvent.click(openFirst);
    await expect(screen.getByText('BIG Modal A')).toBeInTheDocument();

    const openSecond = canvas.getByRole('button', { name: /open modal b/i });
    await userEvent.click(openSecond);

    // Both open
    await expect(screen.getByText('BIG Modal A')).toBeInTheDocument();
    await expect(screen.getByText('BIG Modal B')).toBeInTheDocument();

    // Wait for animation to settle
    await new Promise((resolve) => setTimeout(resolve, 500));

    const modalA = screen.getByText('BIG Modal A').closest('.modalRoot') as HTMLElement;
    const modalB = screen.getByText('BIG Modal B').closest('.modalRoot') as HTMLElement;
    await expect(modalA).toBeTruthy();
    await expect(modalB).toBeTruthy();

    // Visual stacking: hit-test the viewport center — second modal must be on top
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const topEl = document.elementFromPoint(cx, cy) as HTMLElement | null;
    await expect(topEl).toBeTruthy();
    await expect(modalB.contains(topEl)).toBe(true);

    await closeAllModals();
  },
  render: () => {
    const openModal = (id: string) => {
      ModalService.open(<OverlapModal id={id} close={() => {}} />, { fullscreen: true });
    };

    return (
      <div>
        <div style={{ marginBottom: "10px" }}>
          <Button onClick={() => openModal('A')}>Open Modal A</Button>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <Button onClick={() => openModal('B')}>Open Modal B</Button>
        </div>
      </div>
    );
  },
};
