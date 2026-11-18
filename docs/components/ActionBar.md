# ActionBar

Container for primary actions and controls, often fixed at the bottom/top of a view.

- Kind: component
- Import: `import { ActionBar } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/ActionBar/ActionBar.tsx`
- Keywords: action, bar, controls, footer, actions, toolbar

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `show` | `boolean` | yes |  |
| `templateProps` | `ActionBarTemplateType` | no |  |

## Examples

From `src/core/ActionBar/stories/Default.story.tsx`:

```tsx
import React from "react";
import { within, expect } from "storybook/test";
import { Story, selectors } from "./_ActionBar.default";

export const Default: Story = {
  args: {
    show: true,
    templateProps: {
      template: "message",
      type: "info",
      description: "Default ActionBar message",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId(selectors.container);
    await expect(container).toBeInTheDocument();
  },
};
```

From `src/core/ActionBar/stories/FooterButtonHeights.story.tsx`:

```tsx
import { expect, within } from "storybook/test";
import { ButtonTypes } from "@vanguard/Button/Button";
import { Story, selectors } from "./_ActionBar.default";

/**
 * Buttons in the ActionBar footer share one height whatever their type: buttons without an explicit size get the
 * row size (`extraLarge`), 48px on desktop and 40px on mobile.
 */
export const FooterButtonHeights: Story = {
  args: {
    show: true,
    templateProps: {
      template: "footer",
      buttons: [
        { text: "Back", onClick: () => {} },
        { text: "Skip", onClick: () => {}, props: { type: ButtonTypes.muted } },
        { text: "Save draft", onClick: () => {}, props: { type: ButtonTypes.default } },
        { text: "Publish", onClick: () => {} },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId(selectors.container);
    const heights = within(container)
      .getAllByRole("button")
      .map((button) => Math.round(button.getBoundingClientRect().height));

    // Row height for the current breakpoint (mobile is 767px and below)
    const expectedHeight = window.innerWidth > 767 ? 48 : 40;
    await expect(heights).toEqual([expectedHeight, expectedHeight, expectedHeight, expectedHeight]);
  },
};
```
