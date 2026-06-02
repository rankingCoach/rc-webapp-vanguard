import React from 'react';
import { expect } from 'storybook/test';

import { defaultProps, getMarkers, progressMarkers, Story } from './_BenchmarkGauge.default';

export const ProgressVertical: Story = {
  name: 'Progress mode — vertical (mid endpoint)',
  args: {
    ...defaultProps,
    markers: progressMarkers,
    orientation: 'vertical',
    progressMarkerId: 'mid',
  },
  decorators: [
    (Story) => (
      <div style={{ height: 300, display: 'flex', justifyContent: 'center' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    // Vertical progress mode renders all three markers without crashing
    await expect(getMarkers(canvasElement, 'vertical')).toHaveLength(3);
  },
};