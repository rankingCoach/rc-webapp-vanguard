# ModalSplitView

Modal variant that displays two panels side-by-side for comparative content or complex flows.

- Kind: component
- Import: `import { ModalSplitView } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Modal/ModalSplitView/ModalSplitView.tsx`
- Keywords: modal, split, two-panel, side-by-side, layout

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `animateOnSlideEnd` | `boolean` | no | Opt-in, `right-overlay` desktop only (default off → behaviour unchanged). Slide the right panel in as a `translateX` overlay and resize the left panel a single time once the slide ends, instead of animating the left panel's width every frame. Avoids per-frame reflow of heavy left-panel content (e.g. a chat). See ModalSplitViewRightOverlay. |
| `autoCloseWidth` | `number` | no |  |
| `bottomMargin` | `string` | no |  |
| `collapseMode` | `ModalSplitViewCollapseMode` | no |  |
| `collapseToggle` | `ModalSplitViewCollapseToggle` | no | Optional round divider FAB (right-overlay desktop only). See {@link ModalSplitViewCollapseToggle}. |
| `elements` | `[{ component: React.ReactNode; fullWidth: string; contractedWidth?: string; backgroundColo \| …` | yes |  |
| `isContracted` | `boolean` | yes |  |
| `resize` | `ModalSplitViewResize` | no | Opt-in, `right-overlay` + `animateOnSlideEnd` desktop only (default off → behaviour unchanged). A drag handle on the right panel's left edge. See {@link ModalSplitViewResize}. |

## Examples

From `src/core/Modal/ModalSplitView/stories/LeftOverlay.story.tsx`:

```tsx
import React from 'react';
import { ModalSplitView } from '@vanguard/Modal/ModalSplitView/ModalSplitView';
import { Story } from './_ModalSplitView.default';
import { splitViewElements } from './splitViewElements';
import { useToggleContracted } from './useToggleContracted';

const LeftOverlayDemo = () => {
  const contracted = useToggleContracted();

  return (
    <div style={{ width: '90vw', height: '90vh' }}>
      <ModalSplitView isContracted={contracted} elements={splitViewElements} />
    </div>
  );
};

export const LeftOverlay: Story = {
  args: {},
  render: () => <LeftOverlayDemo />,
};
```

From `src/core/Modal/ModalSplitView/stories/LeftOverlayWithCollapseToggle.story.tsx`:

```tsx
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
```
