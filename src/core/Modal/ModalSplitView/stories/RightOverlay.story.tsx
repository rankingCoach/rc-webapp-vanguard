import React, { useEffect, useState } from 'react';
import { ModalSplitView } from '@vanguard/Modal/ModalSplitView/ModalSplitView';
import { Story } from './_ModalSplitView.default';
import { splitViewElements } from './splitViewElements';

const RightOverlayDemo = () => {
  const [contracted, setContracted] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setContracted((prev) => !prev);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ width: '90vw', height: '90vh' }}>
      <ModalSplitView
        isContracted={contracted}
        collapseMode="right-overlay"
        autoCloseWidth={99999}
        elements={splitViewElements}
      />
    </div>
  );
};

export const RightOverlay: Story = {
  args: {},
  render: () => <RightOverlayDemo />,
};
