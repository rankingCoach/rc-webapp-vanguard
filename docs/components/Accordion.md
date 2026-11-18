# Accordion

Collapsible panel component for hiding and revealing content sections with animation.

- Kind: component
- Import: `import { Accordion } from '@rankingcoach/vanguard';`
- WordPress bundle: yes
- Source: `src/core/Accordion/Accordion.tsx`
- Keywords: accordion, collapse, panel, toggle, expand, collapse

> Internals pending rebuild: this component still renders MUI internally. Its DOM contract (data-slot parts) is not final yet; style it through the props and classes it documents.

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `accordionId` | `string` | yes |  |
| `baseCustomStyle` | `object` | no |  |
| `detailsChildren` | `React.ReactNode` | yes |  |
| `detailsCustomStyle` | `object` | no |  |
| `iconName` | `IconNames` | no |  |
| `iconSize` | `IconSize` | no |  |
| `onExpandedChange` | `(expanded: boolean) => void` | no |  |
| `reverse` | `boolean` | no |  |
| `summaryChildren` | `React.ReactNode` | no |  |
| `summaryCustomStyle` | `object` | no |  |
| `TransitionComponent` | `React.JSXElementConstructor<TransitionProps & { children?: React.ReactElement<unknown, any \| …` | no |  |
| `TransitionProps` | `TransitionProps` | no |  |

Also accepts: 15 MUI props, 276 React DOM attributes (not listed).

## Examples

From `src/core/Accordion/stories/ControlledExpanded.story.tsx`:

```tsx
import { within, expect } from "storybook/test";
import { Story, defaultProps, DETAILS_TEXT } from "./_Accordion.default";

export const ControlledExpanded: Story = {
  args: {
    ...defaultProps,
    expanded: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 👇 Assert accordion starts expanded when controlled
    await expect(canvas.getByText(DETAILS_TEXT)).toBeVisible();
  },
};
```

From `src/core/Accordion/stories/Default.story.tsx`:

```tsx
import { Story, defaultProps } from "./_Accordion.default";

export const Default: Story = {
  args: {
    ...defaultProps,
  },
};
```
