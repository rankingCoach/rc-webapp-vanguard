import React from "react";
import { userEvent, within, expect, screen, waitFor } from "storybook/test";
import { ModalService } from "@vanguard/Modal/ModalService";
import { Modal } from "@vanguard/Modal/Modal";
import { Button } from "@vanguard/Button/Button";
import { Story, closeAllModals } from "./_Modal.default";

const TestModalEscKey = ({ close }: { close: () => void }) => {
  return (
    <Modal minHeight={"300px"} onClose={close} testId="esc-key-modal">
      <div style={{ padding: "20px" }}>
        <h3>Test Modal - Esc Key</h3>
        <p>Press the Escape key to close this modal</p>
      </div>
    </Modal>
  );
};

export const CloseViaEscKey: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Close any remaining modals from previous tests
    await closeAllModals();

    // Open modal via service
    const openButton = canvas.getByRole("button", { name: /open modal/i });
    await userEvent.click(openButton);

    // Wait for modal to appear
    await expect(screen.getByText("Test Modal - Esc Key")).toBeInTheDocument();

    // Press Escape to close the modal
    await userEvent.keyboard("{Escape}");

    // Verify modal is closed (close is async via setTimeout + exit animation)
    await waitFor(() =>
      expect(screen.queryByText("Test Modal - Esc Key")).not.toBeInTheDocument()
    );
  },
  render: () => {
    const openModal = () => {
      ModalService.open(<TestModalEscKey close={() => {}} />);
    };

    return (
      <div>
        <Button onClick={openModal}>Open Modal</Button>
      </div>
    );
  },
};
