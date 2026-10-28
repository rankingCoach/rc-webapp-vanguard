import { ModalService } from '@vanguard/Modal/ModalService';
import React from 'react';
import { expect, screen, userEvent, within } from 'storybook/test';

import { closeAllModals, DemoNavigationModal, Story } from './_NavigationModal.default';

export const SingleItem: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Close any remaining modals from previous tests
    await closeAllModals();

    // Open modal
    const openButton = canvas.getByRole('button', { name: /open modal/i });
    await userEvent.click(openButton);

    // Counter is shown, arrows are not rendered for a single item
    const counter = await screen.findByTestId('navigation-modal-counter');
    await expect(counter).toHaveTextContent('1 of 1');
    await expect(screen.queryByTestId('navigation-modal-prev')).not.toBeInTheDocument();
    await expect(screen.queryByTestId('navigation-modal-next')).not.toBeInTheDocument();
  },
  render: () => {
    const openModal = () => {
      ModalService.open(<DemoNavigationModal totalItems={1} close={() => {}} />);
    };

    return (
      <div>
        <button onClick={openModal}>Open Modal</button>
      </div>
    );
  },
};
