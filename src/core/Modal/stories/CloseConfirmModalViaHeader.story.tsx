import React, { useState } from 'react';
import { userEvent, within, expect, screen } from 'storybook/test';
import { ModalService } from '@vanguard/Modal/ModalService';
import { Button } from '@vanguard/Button/Button';
import { Story } from './_ModalService.default';

const CloseConfirmModalViaHeaderComponent = () => {
  const [response, setResponse] = useState<string | null>(null);

  const openModal = () => {
    setResponse(null);
    ModalService.openConfirmModal({
      closeFn: ({ isOk }) => setResponse(`isOk: ${isOk}`),
      title: 'Header close test',
      message: 'Click the X button in the header to close this modal.',
      positiveCtaText: 'Confirm',
      negativeCtaText: 'Cancel',
    });
  };

  return (
    <div>
      <Button onClick={openModal}>Open Modal</Button>
      {response && <p data-testid="response-output">Response received — {response}</p>}
    </div>
  );
};

export const CloseConfirmModalViaHeader: Story = {
  render: () => <CloseConfirmModalViaHeaderComponent />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const openButton = canvas.getByRole('button', { name: /open modal/i });
    await userEvent.click(openButton);

    await expect(screen.getByText('Header close test')).toBeInTheDocument();

    const closeButton = screen.getByTestId('modal-close-header-cta');
    await userEvent.click(closeButton);

    await expect(screen.queryByText('Header close test')).not.toBeInTheDocument();
    await expect(canvas.getByTestId('response-output')).toHaveTextContent('Response received — isOk: false');
  },
};
