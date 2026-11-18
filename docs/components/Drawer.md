# Drawer

Slide-in panel (drawer) that anchors to a side of the screen for off-canvas content.

- Kind: component
- Import: `import { Drawer } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Drawer/Drawer.tsx`
- Keywords: drawer, panel, sidebar, off-canvas, slide-in, overlay

> Internals pending rebuild: this component still renders MUI internally. Its DOM contract (data-slot parts) is not final yet; style it through the props and classes it documents.

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `baseZIndex` | `number` | no | Floor to stack this drawer from. Defaults to the shared stacking floor. Pass a higher value to force the drawer above content outside the overlay ledger (e.g. injected 3rd-party widgets) while still interleaving with other overlays. Prefer this over `zIndex`, which pins a static layer. |
| `description` | `string` | no |  |
| `isHeaderCompact` | `boolean` | no |  |
| `isHeaderSticky` | `boolean` | no |  |
| `onClose` | `(e?: ModalResponse<DrawerCloseResponse>) => void` | no |  |
| `open` | `boolean` | no |  |
| `outOfTheWay` | `number \| false` | no |  |
| `showCloseButton` | `boolean` | no |  |
| `title` | `string` | no |  |
| `zIndex` | `number` | no |  |

Also accepts: 3 MUI props, 1 React DOM attributes (not listed).

## Examples

From `src/core/Drawer/stories/CompactWithCloseButtonRightAnchor.story.tsx`:

```tsx
import React from 'react';
import { Drawer, DrawerProps } from '../Drawer';
import { within, expect } from 'storybook/test';
import { Story, testContent } from './_Drawer.default';

export const CompactWithCloseButtonRightAnchor: Story = {
  args: {
    open: true,
    anchor: 'right',
    showCloseButton: true,
    title: 'Compact Header with Close Button',
    description: 'Drawer with compact header, close button, and right anchor.',
    isHeaderCompact: true,
  } as DrawerProps,
  render: (args) => <Drawer {...args}>{testContent}</Drawer>,
};
```

From `src/core/Drawer/stories/Default.story.tsx`:

```tsx
import React from "react";
import { Drawer, DrawerProps } from "../Drawer";
import { within, expect } from "storybook/test";
import { Story, testContent } from "./_Drawer.default";

export const Default: Story = {
  args: {
    open: true,
    anchor: "right",
    title: "Default Drawer",
    description: "A simple drawer with text content.",
  } as DrawerProps,
  render: (args) => (
    <div style={{ padding: 24 }}>
      <Drawer {...args}>This is a default drawer content.</Drawer>
    </div>
  ),
};
```
