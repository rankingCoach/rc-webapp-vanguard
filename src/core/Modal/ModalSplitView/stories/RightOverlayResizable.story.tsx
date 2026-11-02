import React, { useState } from 'react';
import { ModalSplitView, SplitViewElement } from '@vanguard/Modal/ModalSplitView/ModalSplitView';
import { Story } from './_ModalSplitView.default';

// `resize` puts a drag handle on the right panel's left edge: bring the pointer near it and the tab grows out; drag to
// resize (the right panel keeps 420px at least, the left 360px); pull past the narrowest and hold ~350ms, the tab folds
// into a chevron, and letting go closes through `onCloseByDrag`. Arrows / Home / End resize from the keyboard, a double
// click goes back to the default split. The right panel holds an iframe, which takes the pointer's moves from the page:
// the drag has to survive the pointer crossing it. Closed, the divider FAB is the way back (open, it would share the
// edge with the tab).
const iframeDoc =
  '<body style="margin:0;font:14px sans-serif;background:#f6f9fc;display:grid;place-items:center;height:100vh">' +
  '<p style="max-width:24em;text-align:center">An iframe: its pointer moves never reach the page. Drag the edge across it.</p></body>';

const RightOverlayResizableDemo = () => {
  const [contracted, setContracted] = useState(true);

  const elements: [SplitViewElement, SplitViewElement] = [
    {
      fullWidth: '100%',
      contractedWidth: '30%',
      component: (
        <div style={{ width: '100%', height: '100%', padding: 16, boxSizing: 'border-box' }}>
          <button type="button" onClick={() => setContracted((prev) => !prev)}>
            {contracted ? 'Close' : 'Open'} the right panel
          </button>
        </div>
      ),
    },
    {
      fullWidth: '70%',
      contractedWidth: '70%',
      component: (
        <iframe title="Embedded page" srcDoc={iframeDoc} style={{ width: '100%', height: '100%', border: 0 }} />
      ),
    },
  ];

  return (
    <div style={{ width: '90vw', height: '90vh', position: 'relative' }}>
      <ModalSplitView
        isContracted={contracted}
        collapseMode="right-overlay"
        animateOnSlideEnd
        autoCloseWidth={850}
        elements={elements}
        collapseToggle={{ onToggle: () => setContracted((prev) => !prev) }}
        resize={{
          minWidth: 420,
          minOtherWidth: 360,
          onCloseByDrag: () => setContracted(false),
          ariaLabel: 'Resize panel',
        }}
      />
    </div>
  );
};

export const RightOverlayResizable: Story = {
  args: {},
  render: () => <RightOverlayResizableDemo />,
};
