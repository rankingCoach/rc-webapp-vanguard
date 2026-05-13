import React from "react";
import { fn, userEvent, within, expect, screen, waitFor } from "storybook/test";
import { ModalService } from "@vanguard/Modal/ModalService";
import { Modal } from "@vanguard/Modal/Modal";
import { Button } from "@vanguard/Button/Button";
import { Story, closeAllModals } from "./_Modal.default";

const TestModalOutsideClick = ({ close }: { close: () => void }) => {
  return (
    <Modal minHeight={"300px"} onOutsideClick={close} testId="outside-click-modal">
      <div style={{ padding: "20px" }}>
        <h3>Test Modal - Outside Click</h3>
        <p>Click outside this modal content to close it</p>
        <p>Note: Clicking inside the content area should NOT close the modal</p>
      </div>
    </Modal>
  );
};

export const CloseViaOutsideClick: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Close any remaining modals from previous tests
    await closeAllModals();

    // Open modal via service
    const openButton = canvas.getByRole('button', { name: /open modal/i });
    await userEvent.click(openButton);

    // Wait for modal to appear
    await expect(screen.getByText('Test Modal - Outside Click')).toBeInTheDocument();

    // Click outside the modal content (on the modal overlay)
    const modal = canvas.getByTestId('outside-click-modal');
    await userEvent.click(modal);

    // Verify modal is closed (close is async via setTimeout + exit animation)
    await waitFor(() =>
      expect(screen.queryByText('Test Modal - Outside Click')).not.toBeInTheDocument()
    );
  },
  render: (args) => {
    const openModal = () => {
      ModalService.open(<TestModalOutsideClick close={() => {}} />);
    };

    return (
      <div>
        <Button onClick={openModal}>Open Modal</Button>
      </div>
    );
  },
};