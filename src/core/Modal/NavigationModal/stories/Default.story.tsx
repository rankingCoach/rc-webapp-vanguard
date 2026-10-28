import { ModalService } from '@vanguard/Modal/ModalService';
import React from 'react';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import { closeAllModals, DemoNavigationModal, Story } from './_NavigationModal.default';

export const Default: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Close any remaining modals from previous tests
    await closeAllModals();

    // Open modal
    const openButton = canvas.getByRole('button', { name: /open modal/i });
    await userEvent.click(openButton);

    // Counter starts at the first item; prev is disabled without loop
    const counter = await screen.findByTestId('navigation-modal-counter');
    await expect(counter).toHaveTextContent('1 of 5');
    await expect(screen.getByTestId('navigation-modal-prev_button')).toBeDisabled();

    // Navigate forward
    await userEvent.click(screen.getByTestId('navigation-modal-next_button'));
    await expect(counter).toHaveTextContent('2 of 5');
    await expect(screen.getByTestId('navigation-modal-prev_button')).toBeEnabled();

    // Close via the modal-managed close button
    await userEvent.click(screen.getByTestId('modal-close-cta'));
    await waitFor(() => expect(screen.queryByTestId('navigation-modal-counter')).not.toBeInTheDocument());
  },
  render: () => {
    const openModal = () => {
      ModalService.open(<DemoNavigationModal totalItems={5} close={() => {}} />);
    };

    return (
      <div>
        <button onClick={openModal}>Open Modal</button>
      </div>
    );
  },
};
