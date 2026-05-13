import React, { useState } from "react";
import { fn, userEvent, within, expect, screen, waitFor } from "storybook/test";
import { ModalService } from "@vanguard/Modal/ModalService";
import { Modal } from "@vanguard/Modal/Modal";
import { Button } from "@vanguard/Button/Button";
import { ModalHeader } from "@vanguard/Modal/Modalheader/ModalHeader";
import { Story } from "./_Modal.default";

const TestModal = ({ close }: { close: () => void }) => {
  return (
    <Modal minHeight={"300px"}>
      <ModalHeader closeFn={close}>
        Test Modal - Close via Service
      </ModalHeader>
      <div style={{ padding: "20px" }}>
        <p>This modal can be closed via ModalService.closeEv()</p>
        <p>Modal ID will be displayed in console</p>
      </div>
    </Modal>
  );
};

const ModalTestComponent = () => {
  const [modalId, setModalId] = useState<string | null>(null);

  const openModal = () => {
    const id = ModalService.open(<TestModal close={() => {}} />);
    setModalId(id);
    console.log('Opened modal with ID:', id);
  };

  const closeViaService = () => {
    if (modalId) {
      ModalService.closeEv(modalId);
      setModalId(null);
    }
  };

  return (
    <div>
      <Button onClick={openModal}>Open Modal</Button>
      <div style={{ marginTop: "10px" }}>
        <Button onClick={closeViaService} disabled={!modalId}>Close via Service</Button>
      </div>
    </div>
  );
};

export const CloseViaService: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open modal
    const openButton = canvas.getByRole('button', { name: /open modal/i });
    await userEvent.click(openButton);

    // Wait for modal to appear
    await expect(screen.getByText('Test Modal - Close via Service')).toBeInTheDocument();

    // Close modal via service
    const closeButton = canvas.getByRole('button', { name: /close via service/i });
    await userEvent.click(closeButton);

    // Verify modal is closed (closeEv is async via setTimeout + exit animation)
    await waitFor(() =>
      expect(screen.queryByText('Test Modal - Close via Service')).not.toBeInTheDocument()
    );
  },
  render: (args) => <ModalTestComponent />,
};
