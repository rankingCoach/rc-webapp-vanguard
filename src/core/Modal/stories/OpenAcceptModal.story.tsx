import React from 'react';
import { ModalService } from '../ModalService';
import { Button } from '@vanguard/Button/Button';
import { Story, testCloseFn, testTitle, testMessage, testPositiveCta, testHeaderType, testReplacements, testHideHeaderCloseBtn } from './_ModalService.default';
import { userEvent, within } from 'storybook/test';

const OpenAcceptModalComponent = () => {
  const openAcceptModal = () => {
    ModalService.openAcceptModal({
      closeFn: testCloseFn,
      title: testTitle,
      message: testMessage,
      headerType: testHeaderType,
      positiveCtaText: testPositiveCta,
      replacements: testReplacements,
      hideHeaderCloseBtn: testHideHeaderCloseBtn,
    });
  };

  return (
    <Button onClick={openAcceptModal}>Open Accept Modal</Button>
  );
};

export const OpenAcceptModal: Story = {
  render: () => <OpenAcceptModalComponent />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /open accept modal/i });
    await userEvent.click(button);

    // Wait for modal to open
    await new Promise(resolve => setTimeout(resolve, 100));
  },
};