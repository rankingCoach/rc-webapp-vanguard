import React from 'react';
import { ModalService } from '../ModalService';
import { Button } from '@vanguard/Button/Button';
import { Story, testCloseFn, testTitle, testMessage, testPositiveCta, testNegativeCta, testHeaderType, testPositiveIconLeft, testReplacements, testHideHeaderCloseBtn, testCustomNegativeFn } from './_ModalService.default';
import { userEvent, within } from 'storybook/test';

const OpenConfirmModalComponent = () => {
  const openConfirmModal = () => {
    ModalService.openConfirmModal({
      closeFn: testCloseFn,
      title: testTitle,
      message: testMessage,
      positiveCtaText: testPositiveCta,
      negativeCtaText: testNegativeCta,
      headerType: testHeaderType,
      positiveIconLeft: testPositiveIconLeft,
      replacements: testReplacements,
      hideHeaderCloseBtn: testHideHeaderCloseBtn,
      customNegativeFn: testCustomNegativeFn,
    });
  };

  return (
    <Button onClick={openConfirmModal}>Open Confirm Modal</Button>
  );
};

export const OpenConfirmModal: Story = {
  render: () => <OpenConfirmModalComponent />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /open confirm modal/i });
    await userEvent.click(button);

    // Wait for modal to open
    await new Promise(resolve => setTimeout(resolve, 100));
  },
};