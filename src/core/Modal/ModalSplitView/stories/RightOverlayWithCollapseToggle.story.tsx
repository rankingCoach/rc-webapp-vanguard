import React, { useState } from 'react';
import { ModalSplitView } from '@vanguard/Modal/ModalSplitView/ModalSplitView';
import { Story } from './_ModalSplitView.default';
import { splitViewElements } from './splitViewElements';

// The divider FAB (`collapseToggle`) drives the open/close here: click it to toggle. It sits ON the divider while
// the right panel is open (chevron `>` → collapse) and peeks half-off the right screen edge while collapsed
// (chevron `<` → expand). The consumer owns the action (here: flip `isContracted`).
const RightOverlayWithCollapseToggleDemo = () => {
  const [contracted, setContracted] = useState(false);

  return (
    <div style={{ width: '90vw', height: '90vh', position: 'relative' }}>
      <ModalSplitView
        isContracted={contracted}
        collapseMode="right-overlay"
        animateOnSlideEnd
        elements={splitViewElements}
        collapseToggle={{ onToggle: () => setContracted((prev) => !prev) }}
      />
    </div>
  );
};

export const RightOverlayWithCollapseToggle: Story = {
  args: {},
  render: () => <RightOverlayWithCollapseToggleDemo />,
};
