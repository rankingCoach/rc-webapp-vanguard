# BenchmarkGauge Component

Renders one or more markers on a gradient scale track for **benchmark comparison** — showing where a subject sits relative to reference points (industry average, best performer, competitors) on a shared min–max range.

The component owns the track, positioning, ranking, legend shell, and interaction state. All visual content (pin design, anchored cards, legend items) is delegated to the wrapper via render props.

---

## Usage

```tsx
import { BenchmarkGauge } from '@vanguard/BenchmarkGauge';

<BenchmarkGauge
  min={0}
  max={100}
  markers={[
    { id: 'you', value: 35, label: 'You' },
    { id: 'avg', value: 60, label: 'Industry average' },
  ]}
  showLabels
/>
```

---

## Props

### Scale

| Prop | Type | Required | Description |
|---|---|---|---|
| `min` | `number` | ✓ | Lower bound of the scale. |
| `max` | `number` | ✓ | Upper bound of the scale. Must be greater than `min`. If `max ≤ min`, all markers pin to the start of the track — no error is thrown. |
| `markers` | `BenchmarkGaugeMarkerType[]` | ✓ | Markers to display. DOM and tab order follow input array order. An empty array renders a clean track. |
| `orientation` | `'horizontal' \| 'vertical'` | — | Track direction. Default: `'horizontal'`. In vertical mode the component takes `height: 100%` and becomes `width: fit-content`; legends appear to the right. |
| `gradient` | `string` | — | Full CSS gradient string (e.g. `linear-gradient(90deg, red, green)`). Overrides the default red-to-green gradient on both the track and progress layers. |

### Labels

`compactLabels`, `startLabel`, and `endLabel` are **only valid when `showLabels: true`**. Passing any of them without `showLabels: true` is a TypeScript compile-time error.

| Prop | Type | Description |
|---|---|---|
| `showLabels` | `true` | Enables track-end labels. Each side falls back to `String(min)` / `String(max)` if no custom label is provided. |
| `showLabels` | `false \| undefined` (default) | Labels hidden. `compactLabels`, `startLabel`, `endLabel` are not accepted. |
| `compactLabels` | `boolean` | Switches auto-generated labels to compact notation (`1000 → "1K"`). Has no effect on custom `startLabel` / `endLabel`. |
| `startLabel` | `ReactNode` | Custom start label. Falls back to `String(min)` when omitted. |
| `endLabel` | `ReactNode` | Custom end label. Falls back to `String(max)` when omitted. |

```tsx
<BenchmarkGauge showLabels ... />                                  // ✓ auto min/max labels
<BenchmarkGauge showLabels startLabel="Low" endLabel="High" ... /> // ✓ custom labels
<BenchmarkGauge showLabels compactLabels ... />                    // ✓ compact auto labels
<BenchmarkGauge showLabels startLabel="Low" ... />                 // ✓ custom start + auto end
<BenchmarkGauge startLabel="Low" ... />                            // ✗ TypeScript error
<BenchmarkGauge compactLabels ... />                               // ✗ TypeScript error
```

### Progress fill

| Prop | Type | Description |
|---|---|---|
| `progressMarkerId` | `string` | ID of the marker that acts as the fill endpoint. Enables a two-layer track: a ghost layer at full width and a fill layer clipped to this marker's position. An unrecognized ID silently falls back to full-track mode. |

### Rank-based pin coloring

`rankColors` is **only valid when `colorByRank: true`**. Passing it alone is a TypeScript error.

| Prop | Type | Description |
|---|---|---|
| `colorByRank` | `true` | Colors default pins by semantic rank (lowest → highest). No effect on markers with `renderPin`. Default palette: `['var(--e500)', 'var(--a2900)', 'var(--s400)']` (red → amber → green). |
| `colorByRank` | `false \| undefined` (default) | No rank coloring. `rankColors` is not accepted. |
| `rankColors` | `string[]` | Custom palette ordered worst → best. Only valid with `colorByRank: true`. |

Color resolution precedence (highest to lowest): `marker.color` → rank palette color → `var(--n400)`.

```tsx
<BenchmarkGauge colorByRank />                               // ✓ default palette
<BenchmarkGauge colorByRank rankColors={['red', 'green']} /> // ✓ custom palette
<BenchmarkGauge rankColors={['red', 'green']} />              // ✗ TypeScript error
```

### Legend interaction

| Prop | Type | Description |
|---|---|---|
| `legendInteraction` | `BenchmarkGaugeLegendInteraction` | Controls which hover-based legend behaviors are active. All fields default to `true`. |

`BenchmarkGaugeLegendInteraction` fields:

| Field | Default | Description |
|---|---|---|
| `hoverHighlights` | `true` | Whether hovering a legend item highlights it and its marker. |
| `dimsItems` | `true` | Whether non-highlighted legend items are dimmed while another is active. |
| `dimsMarkers` | `true` | Whether non-highlighted track markers are dimmed while a legend item is active. |

### Marker grow on highlight

| Prop | Type | Description |
|---|---|---|
| `growHighlightedMarker` | `boolean` | Doubles the default pin size when its legend item is highlighted. No effect when `renderPin` is provided — manage scaling inside `renderPin` instead. |

### DOM / testing

| Prop | Type | Description |
|---|---|---|
| `testId` | `string` | Sets `data-testid` on the root element. |
| `className` | `string` | Additional CSS class(es) on the root element. |

---

## Marker API

Each entry in `markers` is a `BenchmarkGaugeMarkerType` object.

### Required fields

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Stable unique key. Used for `progressMarkerId` matching and legend interaction state. |
| `value` | `number` | Position on the scale. Clamped to `[min, max]`. |
| `label` | `string` | Metadata available to render props. Not rendered by the core — surface it inside `renderPin`, `renderContent`, or `renderLegend`. |

### Optional fields

| Field | Type | Description |
|---|---|---|
| `color` | `string` | Background color of the default pin. Takes precedence over `colorByRank`. No effect when `renderPin` is provided. |
| `legendBackgroundColor` | `string` | Background color of the legend item shell. Defaults to white. The highlight overlay renders on top. |
| `contentSide` | `'start' \| 'end' \| 'auto'` | Which side of the track the anchored content card appears on. `'auto'` (default) places it below/right and flips to above/left when the marker is at ≥85% of the track. |

### Render hooks

All four hooks receive a `MarkerRenderContext` (see [Render context](#render-context)).

| Hook | Description |
|---|---|
| `renderPin` | Custom pin renderer. Falls back to the default circle pin when omitted. |
| `renderHighlightedContent` | Content rendered **inside the default pin** that animates in when the legend item is highlighted. Always mounted in the DOM — CSS opacity and scale transitions drive visibility. **No effect when `renderPin` is provided.** |
| `renderContent` | Anchored content (e.g. a card) rendered beside the pin. Omit to render no connector or shell for this marker. |
| `renderLegend` | Inner content of this marker's legend item. The core renders the shell (interaction wiring, highlight/dim styling). Omit to exclude this marker from the legend. If no marker provides this, no legend renders. |

---

## Render context

All render hooks receive a `MarkerRenderContext`:

```ts
interface MarkerRenderContext {
  marker: BenchmarkGaugeMarkerType; // the full marker object
  rankIndex: number;                 // 0-based rank by value; 0 = lowest
  rankCount: number;                 // total number of markers
  isDimmed: boolean;                 // true when another marker's legend item is highlighted
  isHighlighted: boolean;            // true when this marker's legend item is active
}
```

The wrapper owns all rank-to-visual mapping. The core computes rank and passes it through — it has no opinion on color, icon, or size.

---

## Visual anatomy

```
┌─────────────────────────────────────────────────────┐  ← root
│  ┌──────────────────────────────────────────────┐   │  ← legend  [only if any marker has renderLegend]
│  │ [Legend item A] [Legend item B] [Legend item C]│  │    sorted ascending by value
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │  ← trackWrapper
│  │ ██████████████████████████████████████████   │   │  ← trackBar (gradient)
│  │   Min●────────────────────●──────────Max     │   │    ● = markers, absolutely positioned
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Track bar

The colored strip that defines the scale. Default gradient: red → green (`--benchmark-gauge-gradient-horizontal` / `--benchmark-gauge-gradient-vertical`). Override via the `gradient` prop.

### Progress layers

In progress mode the track bar's own background is cleared and two absolute layers replace it:

- **Ghost layer** — full-width gradient at ~30% opacity. Always visible in progress mode.
- **Fill layer** — same gradient, clipped from the far end to the progress marker's position. Suppressed when the progress marker is at `min` (0%).

### Markers

Each marker is an absolutely-positioned container on the track. It contains:

- **Pin** — either a `renderPin` result or the default circle (white border, `color` fill, or `var(--n400)` fallback).
- **Highlighted content slot** — present only when `renderHighlightedContent` is provided. Always in the DOM; CSS opacity + scale transitions animate it in when the marker is highlighted.
- **Content anchor** (optional) — renders beside the pin when `renderContent` is provided. Side resolved from `contentSide`.

### Labels

`startLabel` and `endLabel` are absolutely positioned inside the track bar — overlaid on the gradient, not outside it. In vertical mode they reposition to the bottom (start) and top (end) of the track.

### Legend

Renders above the track (horizontal) or to the right (vertical). Only appears when at least one marker provides `renderLegend`. Items are sorted ascending by value. The core owns the shell of each item; the wrapper provides inner content.

---

## Behavior and rules

### Ranking

Markers are sorted ascending by `value` to assign `rankIndex` (`0` = lowest value, `rankCount − 1` = highest). This is recomputed each render. DOM order on the track follows the input array, not the rank sort.

### Label rendering

- `showLabels` absent or `false` — no labels render; `startLabel`, `endLabel`, and `compactLabels` are TypeScript errors.
- `showLabels: true` — each side renders its custom label if provided; otherwise falls back to `String(min)` / `String(max)`. `compactLabels` applies compact notation only to auto-generated fallback values.

### Progress mode

- Enabled when `progressMarkerId` matches an existing marker `id`. An unresolvable ID silently falls back to full-track mode.
- At progress 0% (marker value equals `min`): only the ghost layer is visible; the fill is suppressed.
- At progress 100% (marker value equals `max`): fill covers the full track — visually identical to full-track mode.

### Legend highlight

Hovering a legend item sets it as highlighted. There is no built-in keyboard focus highlight. Highlight state (`highlightedId`) is purely internal and is not exposed or controlled externally.

When an item is highlighted:
- `isHighlighted: true` is passed to all render hooks for that marker.
- `isDimmed: true` is passed to all other markers.
- Non-highlighted legend items receive the dim class if `dimsItems` is true.
- Non-highlighted track markers receive the dim class if `dimsMarkers` is true.

### Rank-based color resolution

When `colorByRank` is `true`, the pin color is resolved as:

```
paletteIndex = Math.round((rankIndex / Math.max(rankCount − 1, 1)) * (palette.length − 1))
```

Colors distribute **semantically** across the palette — not naively indexed. With 2 markers on a 3-color palette, they map to the first and last colors (endpoints), skipping the middle.

Precedence: `marker.color` → rank palette color → `var(--n400)`. `colorByRank` has no effect on markers with `renderPin`.

### Content anchor auto-flip

`contentSide: 'auto'` (default) places content below/right. Flips to above/left when the marker's computed position is ≥ 85% of the track.

### No built-in accessibility

The component adds no `role`, `aria-label`, or ARIA attributes. `marker.label` is metadata — it is not rendered to the DOM by the core. Accessibility for all marker content is the wrapper's responsibility.

---

## Common patterns

### Basic gauge

```tsx
<BenchmarkGauge
  min={0}
  max={100}
  markers={[
    { id: 'you', value: 35, label: 'You' },
    { id: 'avg', value: 60, label: 'Competitor avg' },
  ]}
/>
```

### Inside labels

```tsx
// Auto-generated
<BenchmarkGauge min={0} max={100} markers={markers} showLabels />

// Compact auto-generated
<BenchmarkGauge min={0} max={10000} markers={markers} showLabels compactLabels />

// Custom strings
<BenchmarkGauge min={0} max={38} markers={markers} showLabels startLabel="Bad" endLabel="Excellent" />
```

### Progress fill

```tsx
<BenchmarkGauge
  min={0}
  max={100}
  markers={[
    { id: 'you', value: 35, label: 'You' },
    { id: 'avg', value: 60, label: 'Average' },
  ]}
  progressMarkerId="you"
/>
```

### Rank coloring

```tsx
// Default palette (red / amber / green)
<BenchmarkGauge min={0} max={100} markers={markers} colorByRank />

// Custom palette
<BenchmarkGauge min={0} max={100} markers={markers} colorByRank rankColors={['#ef4444', '#22c55e']} />

// Explicit color overrides rank
<BenchmarkGauge
  min={0} max={100}
  markers={[
    { id: 'you', value: 35, label: 'You', color: '#8B5CF6' }, // always wins
    { id: 'avg', value: 60, label: 'Average' },               // rank-based
  ]}
  colorByRank
/>
```

### Highlighted content on hover

Content inside the default pin that fades in when the legend item is hovered:

```tsx
<BenchmarkGauge
  min={0} max={100}
  growHighlightedMarker
  markers={[
    {
      id: 'you',
      value: 35,
      label: 'You',
      renderHighlightedContent: () => <Icon color="--n000">{IconNames.gmb}</Icon>,
      renderLegend: ({ marker }) => <LegendCard label={marker.label} />,
    },
  ]}
/>
```

### Core grow effect

```tsx
<BenchmarkGauge
  min={0} max={100}
  markers={markers}
  growHighlightedMarker
  legendInteraction={{ dimsMarkers: true }}
/>
```

### Custom pin with rank-aware color

When `renderPin` is provided, `colorByRank` has no effect — the wrapper owns all pin rendering:

```tsx
const RankedPin = ({ rankIndex, rankCount }: MarkerRenderContext) => {
  const color = rankIndex === 0 ? 'red' : rankIndex === rankCount - 1 ? 'green' : 'yellow';
  return <span style={{ width: 16, height: 16, borderRadius: '50%', background: color }} />;
};
```

### Legend

```tsx
<BenchmarkGauge
  min={0} max={100}
  markers={[
    {
      id: 'you', value: 35, label: 'You',
      legendBackgroundColor: 'var(--e100)',
      renderLegend: ({ marker }) => <LegendCard label={marker.label} value={marker.value} />,
    },
    {
      id: 'avg', value: 60, label: 'Average',
      legendBackgroundColor: 'var(--s100)',
      renderLegend: ({ marker }) => <LegendCard label={marker.label} value={marker.value} />,
    },
  ]}
/>
```

### Vertical orientation

```tsx
<div style={{ height: 300 }}>
  <BenchmarkGauge min={0} max={100} markers={markers} orientation="vertical" showLabels />
</div>
```

---

## Design intent

`BenchmarkGauge` is a **comparison component**. Its purpose is to show where data points sit relative to each other on a shared scale — not just display a raw value.

**Use it when:**
- Comparing a subject against reference markers (industry average, best-in-class, competitors).
- Visualizing progress toward a goal using the ghost/fill progress mode.
- Needing rank-aware pin coloring computed from relative position.

**Do not use it when:**
- Showing a single value with no comparison. Use a simpler metric display.
- You need native input or slider semantics. This component is display-only.

The component is intentionally split between **core** (track, positioning, ranking, interaction state, legend shell) and **wrapper** (all content: pin design, cards, legend copy, color logic). This boundary is enforced via render props.

---

## Example scenarios

| Scenario | Config |
|---|---|
| Score comparison (Subject vs Industry vs Best) | 3 markers, `progressMarkerId` on subject, `showLabels`, `compactLabels`, `renderHighlightedContent` per marker |
| Audit score (You vs Competitors) | 2 markers, `progressMarkerId` on subject, `colorByRank`, `renderHighlightedContent` |
| Listings (single marker on a 0–38 scale) | 1 marker, `progressMarkerId`, custom `startLabel`/`endLabel`, custom `renderPin` |
| Vertical KPI comparison | `orientation: 'vertical'`, `showLabels`, fixed-height parent |
| Rank visualization across 3 entities | 3 markers, `colorByRank` or `renderPin` that maps `rankIndex` to color |

---

## Notes / gotchas

**`showLabels: true` is required to render any labels.**
`startLabel`, `endLabel`, and `compactLabels` are TypeScript errors without it.

**`compactLabels` only affects auto-generated labels.**
Custom `startLabel` / `endLabel` always render as-is regardless of `compactLabels`.

**Omitting one label side (with `showLabels: true`) auto-generates it.**
Pass only `startLabel` → end auto-generates from `max`. Pass only `endLabel` → start auto-generates from `min`.

**Progress mode requires a valid marker ID.**
An unrecognized `progressMarkerId` silently produces full-track mode with no warning.

**At progress 0%, the fill layer is intentionally absent.**
Only the ghost layer renders when the progress marker sits at `min`.

**Rank is sorted by value, not by input array order.**
`rankIndex: 0` always goes to the lowest-value marker. Drive color, icon, or size decisions from `rankIndex`, not from the array position.

**Legend items sort ascending by value, independent of input order.**
There is no API to override legend sort order.

**`marker.label` is not rendered by the core.**
It is metadata available to render props — surface it inside `renderPin`, `renderContent`, or `renderLegend` as needed.

**Legend highlight is hover-only.**
There is no built-in keyboard focus highlight. Implement focus-triggered highlight inside render props if needed.

**`colorByRank` and `renderHighlightedContent` do not apply to custom `renderPin`.**
When `renderPin` is provided, the wrapper owns all pin rendering. Use `isHighlighted` and `rankIndex` from the render context directly.

**`renderHighlightedContent` is always mounted — CSS transitions control visibility.**
The animation container is always in the DOM. Opacity and scale start at `0` / `0.5` and transition to `1` / `1` on highlight. This ensures animations fire correctly on every state change.

**Vertical mode requires a height-constrained parent.**
The component takes `height: 100%` in vertical mode. Without a defined parent height, the track collapses.

**Overlapping markers are not deduplicated.**
Two markers at the same value both render. DOM stacking order follows the input array.
