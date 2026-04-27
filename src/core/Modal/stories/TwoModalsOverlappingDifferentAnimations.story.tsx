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

export const TwoModalsOverlappingDifferentAnimations: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await closeAllModals();

    // Open modal A with grow (top → bottom enter)
    const openFirst = canvas.getByRole('button', { name: /open modal a \(top → bottom\)/i });
    await userEvent.click(openFirst);
    await expect(screen.getByText('BIG Modal A')).toBeInTheDocument();

    // Open modal B with slide (right → left enter)
    const openSecond = canvas.getByRole('button', { name: /open modal b \(right → left\)/i });
    await userEvent.click(openSecond);

    // Wait for slide animation (400ms)
    await new Promise((resolve) => setTimeout(resolve, 500));

    await expect(screen.getByText('BIG Modal A')).toBeInTheDocument();
    await expect(screen.getByText('BIG Modal B')).toBeInTheDocument();

    const modalB = screen.getByText('BIG Modal B').closest('.modalRoot') as HTMLElement;
    await expect(modalB).toBeTruthy();

    // Visual stacking: second modal (slide) must be on top of first modal (grow)
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const topEl = document.elementFromPoint(cx, cy) as HTMLElement | null;
    await expect(topEl).toBeTruthy();
    await expect(modalB.contains(topEl)).toBe(true);

    await closeAllModals();
  },
  render: () => {
    const openGrow = () => {
      ModalService.open(<OverlapModal id={'A'} close={() => {}} />, { animation: 'grow', fullscreen: true });
    };
    const openSlide = () => {
      ModalService.open(<OverlapModal id={'B'} close={() => {}} />, { animation: 'slide', fullscreen: true });
    };

    return (
      <div>
        <div style={{ marginBottom: "10px" }}>
          <Button onClick={openGrow}>Open Modal A (top → bottom)</Button>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <Button onClick={openSlide}>Open Modal B (right → left)</Button>
        </div>
      </div>
    );
  },
};
