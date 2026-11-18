# AppBar

Application top bar that contains branding, navigation shortcuts and global actions.

- Kind: component
- Import: `import { AppBar } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/AppBar/AppBar.tsx`
- Keywords: appbar, header, topbar, navigation, brand, toolbar

> Internals pending rebuild: this component still renders MUI internally. Its DOM contract (data-slot parts) is not final yet; style it through the props and classes it documents.

## DOM contract

No slots yet.

## Props

No own props.

Also accepts: 12 MUI props, 276 React DOM attributes (not listed).

## Examples

From `src/core/AppBar/stories/Default.story.tsx`:

```tsx
import React from "react";
import { Toolbar, Typography } from "@mui/material";
import { within, expect } from "storybook/test";
import { Story, testToolbarContent } from "./_AppBar.default";
import { AppBar } from "../AppBar";

export const Default: Story = {
  render: (args) => (
    <AppBar {...args}>
      <Toolbar>
        <Typography variant="h6" component="div">
          {testToolbarContent.default}
        </Typography>
      </Toolbar>
    </AppBar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByText(testToolbarContent.default);
    await expect(container).toBeInTheDocument();
  },
};
```

From `src/core/AppBar/stories/Secondary.story.tsx`:

```tsx
import React from "react";
import { Toolbar, Typography } from "@mui/material";
import { within, expect } from "storybook/test";
import { Story, testToolbarContent } from "./_AppBar.default";
import { AppBar } from "../AppBar";

export const Secondary: Story = {
  args: {
    position: "static",
    color: "secondary",
  },
  render: (args) => (
    <AppBar {...args}>
      <Toolbar>
        <Typography variant="h6" component="div">
          {testToolbarContent.secondary}
        </Typography>
      </Toolbar>
    </AppBar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByText(testToolbarContent.secondary);
    await expect(title).toBeInTheDocument();
  },
};
```
