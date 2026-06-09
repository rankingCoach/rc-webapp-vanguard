import React, { useState } from 'react';
import { userEvent, within, expect, screen } from 'storybook/test';
import { ModalService } from '@vanguard/Modal/ModalService';
import { Modal } from '@vanguard/Modal/Modal';
import { ModalHeader } from '@vanguard/Modal/Modalheader/ModalHeader';
import { Button } from '@vanguard/Button/Button';
import { ModalResponse } from '@vanguard/Modal/ModalResponse';
import { Story, closeAllModals } from './_Modal.default';

const TestModalWithResponse = ({ close }: { close: (r: ModalResponse<any>) => void }) => {
  return (
    <Modal minHeight={'300px'}>
      <ModalHeader closeFn={close}>Header close with response</ModalHeader>
      <div style={{ padding: '20px' }}>
        <p>Click the X button — the callback should receive isOk: false</p>
      </div>
    </Modal>
  );
};

export const CloseViaHeaderButtonWithResponse: Story = {
  render: () => {
    const [response, setResponse] = useState<string | null>(null);

    const openModal = () => {
      setResponse(null);
      ModalService.open(
        <TestModalWithResponse close={({ isOk }) => setResponse(`isOk: ${isOk}`)} />,
      );
    };

    return (
      <div>
        <Button onClick={openModal}>Open Modal</Button>
        {response && <p data-testid="response-output">Response received — {response}</p>}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await closeAllModals();

    const openButton = canvas.getByRole('button', { name: /open modal/i });
    await userEvent.click(openButton);

    await expect(screen.getByText('Header close with response')).toBeInTheDocument();

    const closeButton = screen.getByTestId('modal-close-header-cta');
    await userEvent.click(closeButton);

    await expect(screen.queryByText('Header close with response')).not.toBeInTheDocument();
    await expect(canvas.getByTestId('response-output')).toHaveTextContent('Response received — isOk: false');
  },
};
