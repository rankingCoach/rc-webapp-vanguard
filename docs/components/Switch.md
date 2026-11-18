# Switch

Accessible toggle switch component representing boolean state with keyboard support.

- Kind: component
- Import: `import { Switch } from '@rankingcoach/vanguard';`
- WordPress bundle: yes
- Source: `src/core/Switch/Switch.tsx`
- Keywords: switch, toggle, boolean, input, accessibility, aria

## DOM contract

Slots: `[data-slot="switch"]`, `[data-slot="switch-container"]`, `[data-slot="switch-input"]`, `[data-slot="switch-loader"]`

State / variant attributes: `data-checked`, `data-disabled`, `data-loading`, `data-readonly`, `data-size`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `children` | `React.ReactNode` | no |  |
| `childrenWidth` | `string` | no |  |
| `className` | `string` | no |  |
| `disabled` | `boolean` | no |  |
| `labelClassName` | `string` | no |  |
| `labelColor` | `string` | no |  |
| `labelFontWeight` | `FontWeights` | no |  |
| `labelPos` | `"left" \| "right"` | no |  |
| `labelReplacements` | `TextReplacements` | no |  |
| `labelType` | `TextTypes` | no |  |
| `loading` | `boolean` | no |  |
| `onChange` | `React.ChangeEventHandler<HTMLInputElement>` | no |  |
| `readOnly` | `boolean` | no |  |
| `size` | `"big" \| "small"` | no |  |
| `testId` | `string` | no |  |
| `value` | `LoadingBoolean` | yes | Accepts a loading boolean for simplicity but only reacts to the true value of boolean , loading is considered false |

## Examples

From `src/core/Switch/stories/SwitchChecked.story.tsx`:

```tsx
import { expect, fn, within } from 'storybook/test';

import { SwitchStory } from './_Switch.default';

export const SwitchChecked: SwitchStory = {
  args: {
    value: true,
    children: 'Switch is on',
    size: 'small',
    testId: 'switch-checked',
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole('checkbox');
    await expect(input).toBeInTheDocument();
    await expect(input).toBeChecked();
    await expect(input).not.toBeDisabled();
  },
};
```

From `src/core/Switch/stories/SwitchDefault.story.tsx`:

```tsx
import { expect, fn, userEvent, within } from 'storybook/test';

import { SwitchStory } from './_Switch.default';

export const SwitchDefault: SwitchStory = {
  args: {
    value: false,
    children: 'Switch example',
    size: 'small',
    testId: 'switch-default',
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole('checkbox');
    await expect(input).toBeInTheDocument();
    await expect(input).not.toBeChecked();
    await expect(input).not.toBeDisabled();

    await userEvent.click(input);
    await expect(args.onChange).toHaveBeenCalledTimes(1);
  },
};
```
