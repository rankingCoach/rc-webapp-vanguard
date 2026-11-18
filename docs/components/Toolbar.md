# Toolbar

Horizontal toolbar for grouping actions, filters and controls in a compact row.

- Kind: component
- Import: `import { Toolbar } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Toolbar/Toolbar.tsx`
- Keywords: toolbar, actions, controls, filters, group

> Internals pending rebuild: this component still renders MUI internally. Its DOM contract (data-slot parts) is not final yet; style it through the props and classes it documents.

## DOM contract

No slots yet.

## Props

No own props.

Also accepts: 8 MUI props, 277 React DOM attributes (not listed).

## Examples

From `src/core/Toolbar/stories/Default.story.tsx`:

```tsx
import React from "react";
import { Toolbar } from "../Toolbar";
import { Text, TextTypes } from "@vanguard/Text/Text";
import { within, expect } from "storybook/test";
import { Story } from "./_Toolbar.default";

export const Default: Story = {
  render: () => (
    <Toolbar>
      <Text type={TextTypes.heading3}>
        Default Toolbar
      </Text>
    </Toolbar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByText("Default Toolbar");
    await expect(title).toBeInTheDocument();
  },
};
```

From `src/core/Toolbar/stories/Dense.story.tsx`:

```tsx
import React from "react";
import { Toolbar } from "../Toolbar";
import { Text, TextTypes } from "@vanguard/Text/Text";
import { IconButton } from "@vanguard/IconButton/IconButton";
import { IconNames } from "@vanguard/Icon/IconNames";
import { Button, ButtonSizes } from "@vanguard/Button/Button";
import { within, expect } from "storybook/test";
import { Story } from "./_Toolbar.default";

export const Dense: Story = {
  args: {
    variant: "dense",
  },
  render: (args) => (
    <Toolbar {...args}>
      <IconButton isActive={false} icon={IconNames.hamburgerMenu} />
      <Text type={TextTypes.text} style={{ flexGrow: 1 }}>
        Dense Toolbar
      </Text>
      <Button size={ButtonSizes.small}>Action</Button>
    </Toolbar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByText("Dense Toolbar");
    await expect(title).toBeInTheDocument();
  },
};
```
