import React from "react";
import { fn, userEvent, within, expect, waitFor } from "storybook/test";
import { ModalService } from "@vanguard/Modal/ModalService";
import { Modal } from "@vanguard/Modal/Modal";
import { Button } from "@vanguard/Button/Button";
import { ModalHeader } from "@vanguard/Modal/Modalheader/ModalHeader";
import { ModalResponse } from "@vanguard/Modal/ModalResponse";
import { Story, closeAllModals } from "./_Modal.default";

const ResponseModal = ({
  close
}: {
  close: (response: ModalResponse<{ action: string; data: any }>) => void
}) => {
  return (
    <Modal minHeight={"300px"}>
      <ModalHeader closeFn={() => close({ isOk: true, data: { action: 'cancel', data: null } })}>
        Response Modal
      </ModalHeader>
      <div style={{ padding: "20px" }}>
        <p>Choose an action to close with response data:</p>
        <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
          <Button onClick={() => close({ isOk: true, data: { action: 'confirm', data: { value: 'confirmed' } } })}>
            Confirm
          </Button>
          <Button onClick={() => close({ isOk: true, data: { action: 'save', data: { value: 'saved', timestamp: Date.now() } } })}>
            Save
          </Button>
          <Button onClick={() => close({ isOk: true, data: { action: 'delete', data: { value: 'deleted', id: 123 } } })}>
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export const CloseWithResponseData: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Close any remaining modals from previous tests
    await closeAllModals();

    // Open modal
    const openButton = canvas.getByRole('button', { name: /open response modal/i });
    await userEvent.click(openButton);

    // Verify modal is open
    await expect(canvas.getByText('Response Modal')).toBeInTheDocument();

    // Click confirm button
    const confirmButton = canvas.getByRole('button', { name: /confirm/i });
    await userEvent.click(confirmButton);

    // Verify modal is closed and response is logged (close is async)
    await waitFor(() =>
      expect(canvas.queryByText('Response Modal')).not.toBeInTheDocument()
    );

    // Check if response was captured (would be in console/state in real app)
    await expect(canvas.getByText(/Action: confirm/)).toBeInTheDocument();
  },
  render: (args) => {
    const [response, setResponse] = React.useState<ModalResponse<{ action: string; data: any }> | null>(null);

    const openModal = () => {
      setResponse(null);
      ModalService.open(<ResponseModal close={(resp) => setResponse(resp)} />);
    };

    return (
      <div>
        <Button onClick={openModal}>Open Response Modal</Button>

        {response && (
          <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc" }}>
            <h4>Response Received:</h4>
            <p>Action: {response.data?.action}</p>
            <p>Data: {JSON.stringify(response.data?.data, null, 2)}</p>
          </div>
        )}
      </div>
    );
  },
};