# TrendIndicator

- Kind: component
- Import: `import { TrendIndicator } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/TrendIndicator/TrendIndicator.tsx`

## DOM contract

Slots: `[data-slot="trend-delta"]`, `[data-slot="trend-delta-value"]`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `className` | `string` | no |  |
| `current` | `number` | yes |  |
| `higherIsBetter` | `boolean` | no | False for inverse metrics where a lower number is better (rank, CPC, unanswered). |
| `previous` | `number` | no |  |
| `size` | `number` | no | Icon size in px. |

## Examples

From `src/core/TrendIndicator/stories/Default.story.tsx`:

```tsx
import { Story, testValues } from './_TrendIndicator.default';

export const Default: Story = {
  args: {
    current: testValues.improvedCurrent,
    previous: testValues.improvedPrevious,
  },
};
```

From `src/core/TrendIndicator/stories/Delta.story.tsx`:

```tsx
import { StoryObj } from '@storybook/react';

import { TrendDelta } from '../TrendIndicator';
import { testValues } from './_TrendIndicator.default';

export const Delta: StoryObj<typeof TrendDelta> = {
  render: (args) => <TrendDelta {...args} />,
  args: {
    current: testValues.improvedCurrent,
    previous: testValues.improvedPrevious,
  },
};
```
