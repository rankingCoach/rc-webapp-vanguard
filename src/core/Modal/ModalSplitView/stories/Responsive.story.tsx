import React from 'react';
import { ModalSplitView } from '@vanguard/Modal/ModalSplitView/ModalSplitView';
import { Story } from './_ModalSplitView.default';
import { splitViewElements } from './splitViewElements';

const ResponsiveDemo = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ModalSplitView
        isContracted={true}
        collapseMode="right-overlay"
        bottomMargin="80px"
        autoCloseWidth={768}
        elements={splitViewElements}
      />
    </div>
  );
};

export const Responsive: Story = {
  args: {},
  render: () => <ResponsiveDemo />,
};
