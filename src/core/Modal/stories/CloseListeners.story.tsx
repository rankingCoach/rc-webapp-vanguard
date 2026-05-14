import React from "react";
import { fn, userEvent, within, expect, screen, waitFor } from "storybook/test";
import { ModalService } from "@vanguard/Modal/ModalService";
import { Modal } from "@vanguard/Modal/Modal";
import { Button } from "@vanguard/Button/Button";
import { ModalHeader } from "@vanguard/Modal/Modalheader/ModalHeader";
import { ModalResponse } from "@vanguard/Modal/ModalResponse";
import { Story, closeAllModals } from "./_Modal.default";

const ListenerModal = ({ close }: { close: () => void }) => {
  return (
    <Modal minHeight={"300px"}>
      <ModalHeader closeFn={close}>
        Listener Modal
      </ModalHeader>
      <div style={{ padding: "20px" }}>
        <p>This modal has close listeners attached</p>
        <p>Close listeners will be triggered when modal closes</p>
      </div>
    </Modal>
  );
};

export const CloseListeners: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Close any remaining modals from previous tests
    await closeAllModals();

    // Open modal
    const openButton = canvas.getByRole('button', { name: /open modal with listeners/i });
    await userEvent.click(openButton);

    // Verify modal is open
    await expect(screen.getByText('Listener Modal')).toBeInTheDocument();

    // Close modal
    const closeButton = canvas.getByTestId('modal-close-header-cta');
    await userEvent.click(closeButton);

    // Verify modal is closed (close is async via setTimeout + exit animation)
    await waitFor(() =>
      expect(screen.queryByText('Listener Modal')).not.toBeInTheDocument()
    );

    // Verify listener was called (check for logged message)
    await waitFor(() =>
      expect(canvas.getByText(/Listener called/)).toBeInTheDocument()
    );
  },
  render: (args) => {
    const [listenerCalls, setListenerCalls] = React.useState<string[]>([]);

    const openModal = () => {
      setListenerCalls([]);
      const modalId = ModalService.open(<ListenerModal close={() => {}} />);
      ModalService.onModalClose(modalId, (response?: ModalResponse<any>) => {
        setListenerCalls(prev => [...prev, `Listener called with response: ${JSON.stringify(response)}`]);
      });
    };

    return (
      <div>
        <Button onClick={openModal}>Open Modal with Listeners</Button>

        {listenerCalls.length > 0 && (
          <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc" }}>
            <h4>Listener Calls:</h4>
            {listenerCalls.map((call, index) => (
              <p key={index}>{call}</p>
            ))}
          </div>
        )}
      </div>
    );
  },
};