import React from "react";
import { fn, userEvent, within, expect, screen, waitFor } from "storybook/test";
import { ModalService } from "@vanguard/Modal/ModalService";
import { Modal } from "@vanguard/Modal/Modal";
import { Button } from "@vanguard/Button/Button";
import { ModalHeader } from "@vanguard/Modal/Modalheader/ModalHeader";
import { Story, closeAllModals } from "./_Modal.default";

const TestModalWithHeader = ({ close }: { close: () => void }) => {
  return (
    <Modal minHeight={"300px"}>
      <ModalHeader closeFn={close}>
        Test Modal - Header Close Button
      </ModalHeader>
      <div style={{ padding: "20px" }}>
        <p>Click the X button in the header to close this modal</p>
      </div>
    </Modal>
  );
};

export const CloseViaHeaderButton: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Close any remaining modals from previous tests
    await closeAllModals();

    // Open modal via service
    const openButton = canvas.getByRole('button', { name: /open modal/i });
    await userEvent.click(openButton);

    // Wait for modal to appear
    await expect(screen.getByText('Test Modal - Header Close Button')).toBeInTheDocument();

    // Click the header close button (X)
    const closeButton = canvas.getByTestId('modal-close-header-cta');
    await userEvent.click(closeButton);

    // Verify modal is closed (close is async via setTimeout + exit animation)
    await waitFor(() =>
      expect(screen.queryByText('Test Modal - Header Close Button')).not.toBeInTheDocument()
    );
  },
  render: (args) => {
    const openModal = () => {
      ModalService.open(<TestModalWithHeader close={() => {}} />);
    };

    return (
      <div>
        <Button onClick={openModal}>Open Modal</Button>
      </div>
    );
  },
};