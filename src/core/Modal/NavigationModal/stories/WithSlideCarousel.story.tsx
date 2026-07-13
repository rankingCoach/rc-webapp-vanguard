import { ModalResponse } from '@vanguard/Modal/ModalResponse';
import { ModalService } from '@vanguard/Modal/ModalService';
import { SlideCarousel } from '@vanguard/SlideCarousel/SlideCarousel';
import React, { useState } from 'react';
import { expect, screen, userEvent, within } from 'storybook/test';

import { NavigationModal } from '../NavigationModal';
import { closeAllModals, Story } from './_NavigationModal.default';

const images = [
  'https://picsum.photos/id/1/800/500.jpg',
  'https://picsum.photos/id/2/800/500.jpg',
  'https://picsum.photos/id/3/800/500.jpg',
];

/**
 * The intended integration for swipeable content: the carousel provides the
 * swipe gesture (its own arrows are off), and both components share the same
 * index via `activeIndex` / `onSlideChange` / `onNavigate`. On mobile the
 * modal's arrows are hidden and swiping keeps navigation possible.
 */
const CarouselNavigationModal = ({ close }: { close?: (response?: ModalResponse<any>) => void }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <NavigationModal
      activeIndex={activeIndex}
      totalItems={images.length}
      onNavigate={setActiveIndex}
      onClose={close}
      width={'640px'}
      maxWidth={'min(800px, calc(100vw - 176px))'}
    >
      <SlideCarousel activeIndex={activeIndex} onSlideChange={setActiveIndex} hasArrows={false}>
        {images.map((url) => (
          <div
            key={url}
            style={{
              height: '400px',
              backgroundImage: `url(${url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ))}
      </SlideCarousel>
    </NavigationModal>
  );
};

export const WithSlideCarousel: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Close any remaining modals from previous tests
    await closeAllModals();

    // Open modal
    const openButton = canvas.getByRole('button', { name: /open modal/i });
    await userEvent.click(openButton);

    // The modal's outside arrows drive the carousel
    const counter = await screen.findByTestId('navigation-modal-counter');
    await expect(counter).toHaveTextContent('1 of 3');
    await userEvent.click(screen.getByTestId('navigation-modal-next_button'));
    await expect(counter).toHaveTextContent('2 of 3');
  },
  render: () => {
    const openModal = () => {
      ModalService.open(<CarouselNavigationModal close={() => {}} />);
    };

    return (
      <div>
        <button onClick={openModal}>Open Modal</button>
      </div>
    );
  },
};
