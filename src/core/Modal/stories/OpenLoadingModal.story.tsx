import React from 'react';
import { ModalService } from '../ModalService';
import { Button } from '@vanguard/Button/Button';
import { Story, testTitle, testMessage, testLoadingAnimation, testHeaderTitle } from './_ModalService.default';
import { userEvent, within } from 'storybook/test';

const OpenLoadingModalComponent = () => {
  const openLoadingModal = () => {
    ModalService.openLoadingModal({
      title: testTitle,
      message: testMessage,
      loadingAnimation: testLoadingAnimation,
      headerTitle: testHeaderTitle,
    });
  };

  return (
    <Button onClick={openLoadingModal}>Open Loading Modal</Button>
  );
};

export const OpenLoadingModal: Story = {
  render: () => <OpenLoadingModalComponent />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /open loading modal/i });
    await userEvent.click(button);

    // Wait for modal to open
    await new Promise(resolve => setTimeout(resolve, 100));
  },
};