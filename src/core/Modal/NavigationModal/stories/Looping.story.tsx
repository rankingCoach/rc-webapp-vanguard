import { ModalService } from '@vanguard/Modal/ModalService';
import React from 'react';
import { expect, screen, userEvent, within } from 'storybook/test';

import { closeAllModals, DemoNavigationModal, Story } from './_NavigationModal.default';

export const Looping: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Close any remaining modals from previous tests
    await closeAllModals();

    // Open modal
    const openButton = canvas.getByRole('button', { name: /open modal/i });
    await userEvent.click(openButton);

    const counter = await screen.findByTestId('navigation-modal-counter');
    await expect(counter).toHaveTextContent('1 of 5');

    // With loop, prev is enabled at the first item and wraps to the last one
    const prevButton = screen.getByTestId('navigation-modal-prev_button');
    await expect(prevButton).toBeEnabled();
    await userEvent.click(prevButton);
    await expect(counter).toHaveTextContent('5 of 5');

    // Next at the last item wraps back to the first one
    await userEvent.click(screen.getByTestId('navigation-modal-next_button'));
    await expect(counter).toHaveTextContent('1 of 5');
  },
  render: () => {
    const openModal = () => {
      ModalService.open(<DemoNavigationModal totalItems={5} loop close={() => {}} />);
    };

    return (
      <div>
        <button onClick={openModal}>Open Modal</button>
      </div>
    );
  },
};
