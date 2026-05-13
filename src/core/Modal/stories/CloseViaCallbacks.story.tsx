import React from "react";
import { fn, userEvent, within, expect, screen, waitFor } from "storybook/test";
import { ModalService } from "@vanguard/Modal/ModalService";
import { Modal } from "@vanguard/Modal/Modal";
import { Button } from "@vanguard/Button/Button";
import { Story, closeAllModals } from "./_Modal.default";

const TestModalCallbacks = ({ close }: { close: () => void }) => {
  return (
    <Modal
      minHeight={"300px"}
      onOutsideClick={close}
      onContentClick={close}
      testId="callback-modal"
    >
      <div style={{ padding: "20px" }}>
        <h3>Test Modal - Callbacks</h3>
        <p>onOutsideClick: Enabled</p>
        <p>onContentClick: Enabled</p>
        <p>Click outside or inside to close</p>
      </div>
    </Modal>
  );
};

export const CloseViaCallbacks: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Close any remaining modals from previous tests
    await closeAllModals();

    // Open modal
    const openButton = canvas.getByRole('button', { name: /open modal/i });
    await userEvent.click(openButton);

    // Modal should open
    await expect(screen.getByText('Test Modal - Callbacks')).toBeInTheDocument();

    // Click outside (on modal overlay)
    const modal = canvas.getByTestId('callback-modal');
    await userEvent.click(modal);

    // Modal should close due to outside click (close is async via setTimeout + exit animation)
    await waitFor(() =>
      expect(screen.queryByText('Test Modal - Callbacks')).not.toBeInTheDocument()
    );

    // Reopen modal
    await userEvent.click(openButton);

    // Modal should open
    await waitFor(() =>
      expect(screen.getByText('Test Modal - Callbacks')).toBeInTheDocument()
    );

    // Click on content (inside modal content)
    const modalContent = screen.getByText('onContentClick: Enabled');
    await userEvent.click(modalContent);

    // Modal should close due to content click
    await waitFor(() =>
      expect(screen.queryByText('Test Modal - Callbacks')).not.toBeInTheDocument()
    );
  },
  render: (args) => {
    const openModal = () => {
      ModalService.open(<TestModalCallbacks close={() => {}} />);
    };

    return (
      <div>
        <Button onClick={openModal}>Open Modal</Button>
      </div>
    );
  },
};