# BenchmarkGauge

- Kind: component
- Import: `import { BenchmarkGauge } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/BenchmarkGauge/BenchmarkGauge.tsx`

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `className` | `string` | no |  |
| `colorByRank` | `boolean` | no | Rank coloring disabled. `rankColors` is not accepted. Colors default pins by semantic rank (lowest → highest). No effect on markers with `renderPin`. The default palette is `['var(--e500)', 'var(--a2900)', 'var(--s400)']` (red → amber → green). |
| `compactLabels` | `boolean` | no | Switches auto-generated labels to compact notation (1000 → "1K"). No effect on custom `startLabel` / `endLabel`. |
| `endLabel` | `React.ReactNode` | no | Custom end label. Falls back to `String(max)` when omitted. |
| `gradient` | `string` | no | Full CSS gradient string. Overrides the default red-to-green track gradient. |
| `growHighlightedMarker` | `boolean` | no | Grows the default pin when its legend item is highlighted. No effect when `renderPin` is provided — manage scaling inside `renderPin` instead. |
| `legendInteraction` | `BenchmarkGaugeLegendInteraction` | no | Controls which legend interaction behaviors are active. |
| `markers` | `BenchmarkGaugeMarkerType[]` | yes | Markers to render on the scale. DOM and keyboard tab order follow the input array order. |
| `max` | `number` | yes | Upper bound of the scale. Must be greater than `min`. |
| `min` | `number` | yes | Lower bound of the scale. |
| `orientation` | `"horizontal" \| "vertical"` | no |  |
| `progressMarkerId` | `string` | no | ID of the marker that acts as the progress fill endpoint. Enables a two-layer track: a ghost layer at full width and a fill layer clipped to this marker's position. |
| `rankColors` | `string[]` | no | Custom palette ordered worst → best. Colors are distributed semantically: 2 markers on a 3-color palette resolve to the endpoints, not indices 0 and 1. Defaults to the built-in 3-stop palette. |
| `showLabels` | `boolean` | no | Labels disabled. `compactLabels`, `startLabel`, and `endLabel` are not accepted. Enables track-end labels. Missing sides fall back to `String(min)` / `String(max)`. |
| `startLabel` | `React.ReactNode` | no | Custom start label. Falls back to `String(min)` when omitted. |
| `testId` | `string` | no | Sets `data-testid` on the root element. |

## Examples

From `src/core/BenchmarkGauge/stories/ColorByRankCustomPalette.story.tsx`:

```tsx
import { expect } from 'storybook/test';

import { getMarkers, Story } from './_BenchmarkGauge.default';

export const ColorByRankCustomPalette: Story = {
  name: 'Rank coloring — colorByRank with custom palette (4 markers)',
  args: {
    min: 0,
    max: 100,
    colorByRank: true,
    rankColors: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'],
    markers: [
      { id: 'a', value: 10, label: 'A' },
      { id: 'b', value: 35, label: 'B' },
      { id: 'c', value: 65, label: 'C' },
      { id: 'd', value: 90, label: 'D' },
    ],
  },
  play: async ({ canvasElement }) => {
    // 4 markers render; rank 0 maps to first palette color, rank 3 to last (index 4).
    await expect(getMarkers(canvasElement)).toHaveLength(4);
    const pins = Array.from(canvasElement.querySelectorAll('[style*="background"]'));
    const backgrounds = pins.map((el) => (el as HTMLElement).style.background);
    // Lowest (rankIndex=0) → '#ef4444'; highest (rankIndex=3) → '#3b82f6'
    // Browsers normalize hex to rgb() when reading back el.style.background.
    await expect(backgrounds.some((b) => b === 'rgb(239, 68, 68)')).toBe(true);
    await expect(backgrounds.some((b) => b === 'rgb(59, 130, 246)')).toBe(true);
  },
};
```

From `src/core/BenchmarkGauge/stories/ColorByRankDefault.story.tsx`:

```tsx
import { expect } from 'storybook/test';

import { defaultProps, getMarkers, Story, threeMarkers } from './_BenchmarkGauge.default';

export const ColorByRankDefault: Story = {
  name: 'Rank coloring — colorByRank with default palette (3 markers)',
  args: {
    ...defaultProps,
    markers: threeMarkers,
    colorByRank: true,
  },
  play: async ({ canvasElement }) => {
    // All three markers render with rank-based colors applied
    await expect(getMarkers(canvasElement)).toHaveLength(3);
    // Low marker (value=20, rankIndex=0) → var(--e500) = red
    // Mid marker (value=50, rankIndex=1) → var(--a2900) = amber
    // High marker (value=80, rankIndex=2) → var(--s400) = green
    const pins = Array.from(canvasElement.querySelectorAll('[style*="background"]'));
    const backgrounds = pins.map((el) => (el as HTMLElement).style.background);
    await expect(backgrounds.some((b) => b === 'var(--e500)')).toBe(true);
    await expect(backgrounds.some((b) => b === 'var(--a2900)')).toBe(true);
    await expect(backgrounds.some((b) => b === 'var(--s400)')).toBe(true);
  },
};
```
