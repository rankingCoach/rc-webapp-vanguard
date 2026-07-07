import React from "react";
import { userEvent, within, expect, screen, waitFor } from "storybook/test";
import { ModalService } from "@vanguard/Modal/ModalService";
import { Modal } from "@vanguard/Modal/Modal";
import { Button } from "@vanguard/Button/Button";
import { Story, closeAllModals } from "./_Modal.default";

const TestModalWithCloseButton = ({ close }: { close: () => void }) => {
  return (
    <Modal minHeight={"300px"} onClose={close}>
      <div style={{ padding: "20px" }}>
        <h3>Test Modal - Modal Close Button</h3>
        <p>Click the X button rendered by the modal to close it</p>
      </div>
    </Modal>
  );
};

export const CloseViaModalButton: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Close any remaining modals from previous tests
    await closeAllModals();

    // Open modal via service
    const openButton = canvas.getByRole("button", { name: /open modal/i });
    await userEvent.click(openButton);

    // Wait for modal to appear
    await expect(screen.getByText("Test Modal - Modal Close Button")).toBeInTheDocument();

    // Click the modal-managed close button (X)
    const closeButton = canvas.getByTestId("modal-close-cta");
    await userEvent.click(closeButton);

    // Verify modal is closed (close is async via setTimeout + exit animation)
    await waitFor(() =>
      expect(screen.queryByText("Test Modal - Modal Close Button")).not.toBeInTheDocument()
    );
  },
  render: () => {
    const openModal = () => {
      ModalService.open(<TestModalWithCloseButton close={() => {}} />);
    };

    return (
      <div>
        <Button onClick={openModal}>Open Modal</Button>
      </div>
    );
  },
};
