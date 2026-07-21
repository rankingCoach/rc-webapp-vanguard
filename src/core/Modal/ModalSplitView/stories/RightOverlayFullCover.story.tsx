import React from 'react';
import {
  ModalSplitView,
  SplitViewElement,
} from '@vanguard/Modal/ModalSplitView/ModalSplitView';
import { Story } from './_ModalSplitView.default';
import { useToggleContracted } from './useToggleContracted';

const fullCoverElements: [SplitViewElement, SplitViewElement] = [
  {
    fullWidth: '100%',
    contractedWidth: '30%',
    component: (
      <div style={{ width: '100%', height: '100%', backgroundColor: 'red' }}>LEFT</div>
    ),
  },
  {
    fullWidth: '100%',
    contractedWidth: '100%',
    component: (
      <div style={{ width: '100%', height: '100%', backgroundColor: 'blue' }}>RIGHT</div>
    ),
  },
];

const RightOverlayFullCoverDemo = () => {
  const contracted = useToggleContracted();

  return (
    <div style={{ width: '90vw', height: '90vh' }}>
      <ModalSplitView
        isContracted={contracted}
        collapseMode="right-overlay"
        bottomMargin="150px"
        elements={fullCoverElements}
      />
    </div>
  );
};

export const RightOverlayFullCover: Story = {
  args: {},
  render: () => <RightOverlayFullCoverDemo />,
};
