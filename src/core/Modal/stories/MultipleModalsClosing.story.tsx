import React from "react";
import { fn, userEvent, within, expect, screen, waitFor } from "storybook/test";
import { ModalService } from "@vanguard/Modal/ModalService";
import { Modal } from "@vanguard/Modal/Modal";
import { Button } from "@vanguard/Button/Button";
import { ModalHeader } from "@vanguard/Modal/Modalheader/ModalHeader";
import { Story, closeAllModals } from "./_Modal.default";

const MultiModal = ({ id, close }: { id: string; close: () => void }) => {
  return (
    <Modal minHeight={"200px"}>
      <ModalHeader closeFn={close}>
        Modal {id}
      </ModalHeader>
      <div style={{ padding: "20px" }}>
        <p>This is modal {id}</p>
        <p>Multiple modals can be open simultaneously</p>
      </div>
    </Modal>
  );
};

export const MultipleModalsClosing: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Close any remaining modals from previous tests
    await closeAllModals();

    // Open first modal
    const openFirstButton = canvas.getByRole('button', { name: /open modal 1/i });
    await userEvent.click(openFirstButton);

    // Verify first modal is open
    await expect(screen.getByText('Modal 1')).toBeInTheDocument();

    // Open second modal
    const openSecondButton = canvas.getByRole('button', { name: /open modal 2/i });
    await userEvent.click(openSecondButton);

    // Verify both modals are open
    await expect(screen.getByText('Modal 1')).toBeInTheDocument();
    await expect(screen.getByText('Modal 2')).toBeInTheDocument();

    // Close first modal
    const closeFirstButton = canvas.getAllByTestId('modal-close-header-cta')[0];
    await userEvent.click(closeFirstButton);

    // Verify first modal is closed, second remains (close is async via setTimeout + exit animation)
    await waitFor(() =>
      expect(screen.queryByText('Modal 1')).not.toBeInTheDocument()
    );
    await expect(screen.getByText('Modal 2')).toBeInTheDocument();

    // Close second modal
    const closeSecondButton = canvas.getByTestId('modal-close-header-cta');
    await userEvent.click(closeSecondButton);

    // Verify second modal is also closed (Modal 1 already closed above).
    await waitFor(() =>
      expect(screen.queryByText('Modal 2')).not.toBeInTheDocument()
    );
  },
  render: (args) => {
    const openModal = (id: string) => {
      ModalService.open(<MultiModal id={id} close={() => {}} />);
    };

    return (
      <div>
        <div style={{ marginBottom: "10px" }}>
          <Button onClick={() => openModal('1')}>Open Modal 1</Button>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <Button onClick={() => openModal('2')}>Open Modal 2</Button>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <Button onClick={() => openModal('3')}>Open Modal 3</Button>
        </div>
      </div>
    );
  },
};