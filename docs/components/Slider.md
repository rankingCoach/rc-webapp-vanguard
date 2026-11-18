# Slider

Drag-driven slider control for selecting numeric ranges or values with accessibility support.

- Kind: component
- Import: `import { Slider } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Slider/Slider.tsx`
- Keywords: slider, range, input, drag, control, value

> Internals pending rebuild: this component still renders MUI internally. Its DOM contract (data-slot parts) is not final yet; style it through the props and classes it documents.

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `disabled` | `boolean` | no |  |
| `externalControlled` | `boolean` | no |  |
| `field` | `string` | no | F3: bind to the nearest <Form config>'s field of this name (no `formconfig` prop needed). |
| `formconfig` | `FormConfigElement` | no |  |
| `index` | `number` | no | F3: element index for array fields bound with `field`. |
| `marks` | `{ value: number; label: string; }[]` | no |  |
| `max` | `number` | yes |  |
| `min` | `number` | yes |  |
| `onChange` | `(event: Event, value: number, activeThumb: number) => void` | no |  |
| `onChangeCommitted` | `(event: Event \| React.SyntheticEvent<Element, Event>, value: number) => void` | no |  |
| `size` | `"default" \| "small"` | no |  |
| `step` | `number` | no |  |
| `targetRef` | `React.MutableRefObject<HTMLInputElement>` | no |  |
| `type` | `"default" \| "primary" \| "simple"` | no |  |
| `value` | `number \| number[]` | yes |  |
| `valueLabelDisplay` | `"off" \| "on" \| "auto"` | no |  |

## Examples

From `src/core/Slider/stories/Default.story.tsx`:

```tsx
import React from "react";
import { userEvent, within, expect } from "storybook/test";
import { Story, defaultProps, selectors } from "./_Slider.default";

export const Default: Story = {
  args: {
    ...defaultProps,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check that slider renders
    const slider = canvas.getByRole("slider");
    await expect(slider).toBeInTheDocument();

    // Check initial value
    await expect(slider).toHaveAttribute("aria-valuenow", "50");
  },
};
```

From `src/core/Slider/stories/Disabled.story.tsx`:

```tsx
import React from "react";
import { userEvent, within, expect } from "storybook/test";
import { Story, defaultProps, selectors } from "./_Slider.default";

export const Disabled: Story = {
  args: {
    ...defaultProps,
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check that slider renders as disabled
    const slider = canvas.getByRole("slider");
    await expect(slider).toBeInTheDocument();

    // Check that the slider container has disabled class
    await expect(slider.closest('.MuiSlider-root')).toHaveClass('Mui-disabled');
  },
};
```
