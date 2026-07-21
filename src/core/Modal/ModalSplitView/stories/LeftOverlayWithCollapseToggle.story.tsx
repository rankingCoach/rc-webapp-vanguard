import React, { useState } from 'react';
import { ModalSplitView } from '@vanguard/Modal/ModalSplitView/ModalSplitView';
import { Story } from './_ModalSplitView.default';
import { splitViewElements } from './splitViewElements';

// Same divider FAB as the right-overlay story, on the left-overlay variant: it sits on the divider when the right
// panel is open and peeks half-off the right screen edge when collapsed. Click toggles `isContracted`.
const LeftOverlayWithCollapseToggleDemo = () => {
  const [contracted, setContracted] = useState(false);

  return (
    <div style={{ width: '90vw', height: '90vh', position: 'relative' }}>
      <ModalSplitView
        isContracted={contracted}
        collapseMode="left-overlay"
        elements={splitViewElements}
        collapseToggle={{ onToggle: () => setContracted((prev) => !prev) }}
      />
    </div>
  );
};

export const LeftOverlayWithCollapseToggle: Story = {
  args: {},
  render: () => <LeftOverlayWithCollapseToggleDemo />,
};
