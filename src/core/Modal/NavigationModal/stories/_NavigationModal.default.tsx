import { StoryObj } from '@storybook/react';
import { ModalResponse } from '@vanguard/Modal/ModalResponse';
import { ModalService } from '@vanguard/Modal/ModalService';
import React, { useState } from 'react';

import { NavigationModal } from '../NavigationModal';

export type Story = StoryObj<typeof NavigationModal>;

const slideColors = ['#4c6ef5', '#40c057', '#fab005', '#fa5252', '#7950f2'];

export type DemoNavigationModalProps = {
  totalItems?: number;
  loop?: boolean;
  initialIndex?: number;
  close?: (response?: ModalResponse<any>) => void;
};

/**
 * The NavigationModal API is controlled, so the demo component opened via
 * `ModalService.open()` owns the index state and maps the injected `close`
 * to `onClose`.
 */
export const DemoNavigationModal = ({ totalItems = 5, loop, initialIndex = 0, close }: DemoNavigationModalProps) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  return (
    <NavigationModal
      activeIndex={activeIndex}
      totalItems={totalItems}
      onNavigate={setActiveIndex}
      loop={loop}
      onClose={close}
      width={'480px'}
      maxWidth={'min(640px, calc(100vw - 176px))'}
    >
      <div
        style={{
          height: '320px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: slideColors[activeIndex % slideColors.length],
          color: '#fff',
          fontSize: '32px',
        }}
      >
        Slide {activeIndex + 1}
      </div>
    </NavigationModal>
  );
};

// Helper function to close all open modals before starting a test
export const closeAllModals = async () => {
  // Close specific tracked modals
  ModalService.closeLoadingModal();
  ModalService.closeConfirmModal();
  ModalService.closeErrorModal();
  // Close any untracked modals opened via ModalService.open()
  ModalService.closeAllModals();

  // Small delay to ensure cleanup
  await new Promise((resolve) => setTimeout(resolve, 100));
};
