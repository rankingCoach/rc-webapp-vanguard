import React from 'react';
import { expect, within } from 'storybook/test';

import { defaultProps, getMarkers, Story, TextPin } from './_BenchmarkGauge.default';

export const ProgressWideTextPinVertical: Story = {
  name: 'Progress mode — wide text pin, vertical (body grows upward)',
  args: {
    ...defaultProps,
    min: 0,
    max: 100,
    markers: [
      { id: 'ref', value: 20, label: 'Low' },
      {
        id: 'progress',
        value: 55,
        label: 'Current score',
        renderPin: () => <TextPin label="Score" />,
      },
    ],
    orientation: 'vertical',
    progressMarkerId: 'progress',
  },
  decorators: [
    (Story) => (
      <div style={{ height: 300, display: 'flex', justifyContent: 'center' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The badge text renders in vertical progress mode
    await expect(canvas.getByText('Score')).toBeInTheDocument();
    // Both markers are present on the vertical track
    await expect(getMarkers(canvasElement, 'vertical')).toHaveLength(2);
  },
};