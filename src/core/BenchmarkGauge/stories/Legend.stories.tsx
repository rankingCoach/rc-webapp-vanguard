import React from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { BenchmarkGaugeMarkerType, MarkerRenderContext } from '../types';
import { defaultProps, getMarkers, Story } from './_BenchmarkGauge.default';
import { Icon, IconNames, IconSize } from '@vanguard/Icon';

// ─── Plain legend content ─────────────────────────────────────────────────────
// Deliberately simple: no isHighlighted / isDimmed usage.
// This demonstrates that core shell behavior (dimming, highlighting, focus ring)
// works even when wrapper content is completely passive.
function PlainLegendContent({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        padding: '6px 12px',
        fontSize: 12,
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <div style={{ fontWeight: 700 }}>{label}</div>
      <div style={{ marginTop: 2, opacity: 0.6 }}>{value}</div>
    </div>
  );
}
function CustomPin({ isHighlighted }: { isHighlighted: boolean }) {
  const scale = isHighlighted ? 1.375 : 1;
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 16,
        height: 16,
        borderRadius: '50%',
        border: '3px solid #fff',
        color: '#fff',
        fontSize: 10,
        fontWeight: 700,
        transform: `scale(${scale})`,
        transition: 'transform 0.2s ease, background 0.15s ease, box-shadow 0.15s ease',
        willChange: 'transform',
      }}
    >
      {/* Always in DOM — opacity+scale drive visibility so CSS transition fires on every state change. */}
      <span
        style={{
          display: 'flex',
          lineHeight: 1,
          opacity: isHighlighted ? 1 : 0,
          transform: isHighlighted ? 'scale(1)' : 'scale(0.5)',
          // Small delay: icon fades in after the pin has started growing.
          transition: 'opacity 0.15s ease 0.05s, transform 0.15s ease 0.05s',
        }}
      >
        ✓
      </span>
    </span>
  );
}

// ─── Story: horizontal — plain content, core shell does all the work ──────────

export const LegendHorizontal: Story = {
  name: 'Legend — horizontal (core shell behavior, plain content)',
  args: {
    ...defaultProps,
    markers: [
      {
        id: 'a',
        value: 25,
        label: 'Marker A',
        renderLegend: ({ marker }) => <PlainLegendContent label={marker.label} value={marker.value} />,
      },
      {
        id: 'b',
        value: 55,
        label: 'Marker B',
        renderLegend: ({ marker }) => <PlainLegendContent label={marker.label} value={marker.value} />,
      },
      {
        id: 'c',
        value: 80,
        label: 'Marker C',
        renderLegend: ({ marker }) => <PlainLegendContent label={marker.label} value={marker.value} />,
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // All three legend items render their label and value
    await expect(canvas.getByText('Marker A')).toBeInTheDocument();
    await expect(canvas.getByText('Marker B')).toBeInTheDocument();
    await expect(canvas.getByText('Marker C')).toBeInTheDocument();
    await expect(canvas.getByText('25')).toBeInTheDocument();
    await expect(canvas.getByText('55')).toBeInTheDocument();
    await expect(canvas.getByText('80')).toBeInTheDocument();
    // Hovering a legend item triggers highlight state without crashing.
    // closest('[class]') traverses up to the core legendItem shell, which is the
    // nearest ancestor with a CSS-module class — PlainLegendContent has no class attrs.
    const legendItemA = canvas.getByText('Marker A').closest('[class]') as HTMLElement;
    await userEvent.hover(legendItemA);
    // All sibling legend items remain in the DOM after hover state change
    await expect(canvas.getByText('Marker B')).toBeInTheDocument();
    await expect(canvas.getByText('Marker C')).toBeInTheDocument();
    await userEvent.unhover(legendItemA);
    // Legend content is stable after mouse leave
    await expect(canvas.getByText('Marker A')).toBeInTheDocument();
  },
};

// ─── Story: vertical — plain content, legend to the right ────────────────────

export const LegendVertical: Story = {
  name: 'Legend — vertical (legend to right, plain content)',
  args: {
    ...defaultProps,
    orientation: 'vertical',
    markers: [
      {
        id: 'a',
        value: 25,
        label: 'Marker A',
        renderLegend: ({ marker }) => <PlainLegendContent label={marker.label} value={marker.value} />,
      },
      {
        id: 'b',
        value: 60,
        label: 'Marker B',
        renderLegend: ({ marker }) => <PlainLegendContent label={marker.label} value={marker.value} />,
      },
    ],
  },
  decorators: [
    (StoryFn) => (
      <div style={{ height: 320, display: 'flex', justifyContent: 'center' }}>
        <StoryFn />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Both vertical legend items render their label and value
    await expect(canvas.getByText('Marker A')).toBeInTheDocument();
    await expect(canvas.getByText('Marker B')).toBeInTheDocument();
    await expect(canvas.getByText('25')).toBeInTheDocument();
    await expect(canvas.getByText('60')).toBeInTheDocument();
    // Both markers are positioned on the vertical track
    await expect(getMarkers(canvasElement, 'vertical')).toHaveLength(2);
  },
};

// ─── Story: wrapper grows marker on hover/active — horizontal ─────────────────
// Core shell handles dimming and highlighting (background, opacity).
// Wrapper uses isHighlighted from renderPin ctx to control pin size/icon.
//
// Hover a legend item  → corresponding marker grows (isHighlighted).
// Neither active/highlighted → marker is small (normal state).
// No wrapper state — all driven by core-owned context flags.

const markersWithCustomPin: BenchmarkGaugeMarkerType[] = [
  {
    id: 'a',
    value: 25,
    label: 'Marker A',
    renderPin: ({ isHighlighted }: MarkerRenderContext) => <CustomPin isHighlighted={isHighlighted} />,
    renderLegend: ({ marker }: MarkerRenderContext) => <PlainLegendContent label={marker.label} value={marker.value} />,
  },
  {
    id: 'b',
    value: 55,
    label: 'Marker B',
    renderPin: ({ isHighlighted }: MarkerRenderContext) => <CustomPin isHighlighted={isHighlighted} />,
    renderLegend: ({ marker }: MarkerRenderContext) => <PlainLegendContent label={marker.label} value={marker.value} />,
  },
  {
    id: 'c',
    value: 80,
    label: 'Marker C',
    renderPin: ({ isHighlighted }: MarkerRenderContext) => <CustomPin isHighlighted={isHighlighted} />,
    renderLegend: ({ marker }: MarkerRenderContext) => <PlainLegendContent label={marker.label} value={marker.value} />,
  },
];

export const LegendWithWrapperExtras: Story = {
  name: 'Legend — wrapper grows marker on hover/active, horizontal',
  args: {
    ...defaultProps,
    markers: markersWithCustomPin,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // All three legend items render their content
    await expect(canvas.getByText('Marker A')).toBeInTheDocument();
    await expect(canvas.getByText('Marker B')).toBeInTheDocument();
    await expect(canvas.getByText('Marker C')).toBeInTheDocument();
    // All three markers (with custom pins) are on the track
    await expect(getMarkers(canvasElement)).toHaveLength(3);
    // Hovering a legend item fires setHighlightedId, updating the renderPin ctx.
    // This must not crash and legend content must remain visible throughout.
    const legendItemA = canvas.getByText('Marker A').closest('[class]') as HTMLElement;
    await userEvent.hover(legendItemA);
    await expect(canvas.getByText('Marker A')).toBeInTheDocument();
    await userEvent.unhover(legendItemA);
    await expect(canvas.getByText('Marker A')).toBeInTheDocument();
  },
};

// ─── Story: partial legend (only some markers have renderLegend) ──────────────

export const LegendPartial: Story = {
  name: 'Legend — partial (only some markers have legend items)',
  args: {
    ...defaultProps,
    markers: [
      {
        id: 'a',
        value: 20,
        label: 'Marker A',
        renderLegend: ({ marker }) => <PlainLegendContent label={marker.label} value={marker.value} />,
      },
      {
        id: 'b',
        value: 65,
        label: 'Marker B',
        // no renderLegend — this marker has no legend slot
      },
      {
        id: 'c',
        value: 85,
        label: 'Marker C',
        renderLegend: ({ marker }) => <PlainLegendContent label={marker.label} value={marker.value} />,
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Markers A and C provide renderLegend — their labels appear in the legend
    await expect(canvas.getByText('Marker A')).toBeInTheDocument();
    await expect(canvas.getByText('Marker C')).toBeInTheDocument();
    // Marker B has no renderLegend — its label must not appear anywhere in the DOM
    await expect(canvas.queryByText('Marker B')).not.toBeInTheDocument();
    // All three markers still render on the track (legend and track are independent)
    await expect(getMarkers(canvasElement)).toHaveLength(3);
  },
};

// ─── Story: core grow effect — growHighlightedMarker prop ────────────────────
// Demonstrates the built-in pin grow effect driven entirely by the core.
// No custom renderPin is needed — default circle pins grow on legend hover/focus.
// Compare with LegendWithWrapperExtras, where the wrapper owns the scale logic
// inside renderPin. Use growHighlightedMarker when the default pin is sufficient.

export const LegendWithCoreGrowEffect: Story = {
  name: 'Legend — core grow effect (growHighlightedMarker)',
  args: {
    ...defaultProps,
    growHighlightedMarker: true,
    progressMarkerId: 'b',
    markers: [
      {
        id: 'a',
        value: 25,
        label: 'Marker A',
        color: 'red',
        renderLegend: ({ marker }) => <PlainLegendContent label={marker.label} value={marker.value} />,
      },
      {
        id: 'b',
        value: 55,
        label: 'Marker B',
        color: 'purple',
        renderLegend: ({ marker }) => <PlainLegendContent label={marker.label} value={marker.value} />,
      },
      {
        id: 'c',
        value: 80,
        label: 'Marker C',
        color: 'pink',
        renderLegend: ({ marker }) => <PlainLegendContent label={marker.label} value={marker.value} />,
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // All legend items and markers render with the prop enabled
    await expect(canvas.getByText('Marker A')).toBeInTheDocument();
    await expect(canvas.getByText('Marker B')).toBeInTheDocument();
    await expect(canvas.getByText('Marker C')).toBeInTheDocument();
    await expect(getMarkers(canvasElement)).toHaveLength(3);
    // Hover a legend item — the core applies the grow class to that marker's pin wrapper.
    // The component must not crash and legend content must remain stable.
    const legendItemA = canvas.getByText('Marker A').closest('[class]') as HTMLElement;
    await userEvent.hover(legendItemA);
    await expect(canvas.getByText('Marker A')).toBeInTheDocument();
    await expect(getMarkers(canvasElement)).toHaveLength(3);
    await userEvent.unhover(legendItemA);
    // After mouse leave the scale resets; all content remains visible
    await expect(canvas.getByText('Marker A')).toBeInTheDocument();
  },
};

// ─── Story: per-marker renderHighlightedContent ───────────────────────────────
// The core animation container is always in the DOM; CSS transitions (opacity +
// scale) drive visibility so transitions fire on every state change without
// mount/unmount timing constraints. Hovering a legend item makes that marker's
// highlighted content fade/scale in; leaving makes it fade/scale out.

export const LegendWithHighlightedIcons: Story = {
  name: 'Legend — per-marker highlighted content (renderHighlightedContent)',
  args: {
    ...defaultProps,
    growHighlightedMarker: true,
    markers: [
      {
        id: 'a',
        value: 25,
        label: 'Marker A',
        renderHighlightedContent: () => (
          <span data-testid="highlighted-a">
            <Icon color={'--n000'} type={IconSize.large}>{IconNames.business}</Icon>
          </span>
        ),
        renderLegend: ({ marker }) => <PlainLegendContent label={marker.label} value={marker.value} />,
      },
      {
        id: 'b',
        value: 70,
        label: 'Marker B',
        renderHighlightedContent: () => (
          <span data-testid="highlighted-b">
            <Icon color={'--n000'} type={IconSize.large}>{IconNames.save}</Icon>
          </span>
        ),
        renderLegend: ({ marker }) => <PlainLegendContent label={marker.label} value={marker.value} />,
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Highlighted content is always in the DOM (CSS transitions control opacity/scale)
    await expect(canvas.getByTestId('highlighted-a')).toBeInTheDocument();
    await expect(canvas.getByTestId('highlighted-b')).toBeInTheDocument();
    // Hovering a legend item triggers highlight state; content remains in DOM throughout
    const legendItemA = canvas.getByText('Marker A').closest('[class]') as HTMLElement;
    await userEvent.hover(legendItemA);
    await expect(canvas.getByText('Marker A')).toBeInTheDocument();
    await expect(canvas.getByTestId('highlighted-a')).toBeInTheDocument();
    await userEvent.unhover(legendItemA);
    // After mouse leave, content is still in DOM (opacity/scale reset via CSS)
    await expect(canvas.getByTestId('highlighted-a')).toBeInTheDocument();
    // Hovering Marker B works the same way
    const legendItemB = canvas.getByText('Marker B').closest('[class]') as HTMLElement;
    await userEvent.hover(legendItemB);
    await expect(canvas.getByTestId('highlighted-b')).toBeInTheDocument();
    await userEvent.unhover(legendItemB);
    await expect(canvas.getByTestId('highlighted-b')).toBeInTheDocument();
  },
};

// ─── Story: no legend (baseline, legend container absent) ─────────────────────

export const LegendNone: Story = {
  name: 'Legend — absent (no renderLegend on any marker)',
  args: {
    ...defaultProps,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // No legend item content renders when no marker provides renderLegend
    await expect(canvas.queryByText('Alpha')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Beta')).not.toBeInTheDocument();
    // Both track markers still render without a legend
    await expect(getMarkers(canvasElement)).toHaveLength(2);
  },
};
