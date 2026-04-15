import React from 'react';
import { expect, within } from 'storybook/test';

import { defaultProps, getMarkers, insideEndLabel, insideStartLabel, Story, twoMarkers } from './_BenchmarkGauge.default';

export const InsideLabelsVertical: Story = {
  name: 'Labels — inside, vertical orientation',
  args: {
    ...defaultProps,
    showLabels: true,
    markers: twoMarkers,
    startLabel: insideStartLabel,
    endLabel: insideEndLabel,
    orientation: 'vertical',
  },
  decorators: [
    (StoryFn) => (
      <div style={{ height: 300, display: 'flex', justifyContent: 'center' }}>
        <StoryFn />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Both labels render inside the vertical track bar
    await expect(canvas.getByText('Min')).toBeInTheDocument();
    await expect(canvas.getByText('Max')).toBeInTheDocument();
    // Both markers are positioned vertically on the track
    await expect(getMarkers(canvasElement, 'vertical')).toHaveLength(2);
  },
};