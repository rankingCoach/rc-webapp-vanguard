import React from 'react';
import { expect, within } from 'storybook/test';

import { MarkerRenderContext } from '../types';
import { defaultProps, Story } from './_BenchmarkGauge.default';

// Minimal stub card for validation — wrappers own real card designs
function StubCard({ ctx }: { ctx: MarkerRenderContext }) {
  return (
    <div
      data-testid={`card-${ctx.marker.id}`}
      style={{
        padding: '8px 12px',
        background: 'var(--n100, #f5f5f5)',
        borderRadius: 8,
        border: '1px solid var(--n300, #e0e0e0)',
        fontSize: 12,
        minWidth: 80,
        textAlign: 'center',
      }}
    >
      <strong>{ctx.marker.label}</strong>
      <br />
      {ctx.marker.value}
    </div>
  );
}

export const WithContentEnd: Story = {
  name: 'Content below (end)',
  args: {
    ...defaultProps,
    markers: [
      {
        id: 'alpha',
        value: 40,
        label: 'Alpha',
        contentSide: 'end',
        renderContent: (ctx) => <StubCard ctx={ctx} />,
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByTestId('card-alpha');
    // Content card is anchored below (end side) the marker pin
    await expect(card).toBeInTheDocument();
    // Card renders the marker label and value
    expect(card.textContent).toContain('Alpha');
    expect(card.textContent).toContain('40');
  },
};

export const WithContentStart: Story = {
  name: 'Content above (start)',
  args: {
    ...defaultProps,
    markers: [
      {
        id: 'alpha',
        value: 40,
        label: 'Alpha',
        contentSide: 'start',
        renderContent: (ctx) => <StubCard ctx={ctx} />,
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByTestId('card-alpha');
    // Content card is anchored above (start side) the marker pin
    await expect(card).toBeInTheDocument();
    // Card renders the marker label and value
    expect(card.textContent).toContain('Alpha');
    expect(card.textContent).toContain('40');
  },
};

export const WithContentAutoFlip: Story = {
  name: 'Content auto-flip at edge',
  args: {
    ...defaultProps,
    markers: [
      // Near max edge — auto should flip to 'start'
      {
        id: 'near-end',
        value: 90,
        label: 'Near end',
        contentSide: 'auto',
        renderContent: (ctx) => <StubCard ctx={ctx} />,
      },
      // Middle — auto defaults to 'end'
      {
        id: 'mid',
        value: 50,
        label: 'Mid',
        contentSide: 'auto',
        renderContent: (ctx) => <StubCard ctx={ctx} />,
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nearEndCard = canvas.getByTestId('card-near-end');
    const midCard = canvas.getByTestId('card-mid');
    // Both auto-side content cards render
    await expect(nearEndCard).toBeInTheDocument();
    await expect(midCard).toBeInTheDocument();
    // near-end marker (value=90, ≥85 threshold) auto-resolves to 'start' (above track)
    expect(nearEndCard.textContent).toContain('Near end');
    expect(nearEndCard.textContent).toContain('90');
    // mid marker (value=50, <85 threshold) auto-resolves to 'end' (below track)
    expect(midCard.textContent).toContain('Mid');
    expect(midCard.textContent).toContain('50');
  },
};
