import React from 'react';
import { ModalSplitView } from '@vanguard/Modal/ModalSplitView/ModalSplitView';
import { Story } from './_ModalSplitView.default';
import { splitViewElements } from './splitViewElements';
import { useToggleContracted } from './useToggleContracted';

const RightOverlayDemo = () => {
  const contracted = useToggleContracted();

  return (
    <div style={{ width: '90vw', height: '90vh' }}>
      <ModalSplitView
        isContracted={contracted}
        collapseMode="right-overlay"
        elements={splitViewElements}
      />
    </div>
  );
};

export const RightOverlay: Story = {
  args: {},
  render: () => <RightOverlayDemo />,
};
