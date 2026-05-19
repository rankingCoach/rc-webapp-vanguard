import React from 'react';
import { expect } from 'storybook/test';

import { defaultProps, getMarkers, Story } from './_BenchmarkGauge.default';

export const ProgressVerticalAtMin: Story = {
  name: 'Progress mode — vertical, endpoint at min (0% fill)',
  args: {
    ...defaultProps,
    min: 0,
    max: 100,
    markers: [
      { id: 'zero', value: 0, label: 'At zero' },
      { id: 'far', value: 75, label: 'Far' },
    ],
    orientation: 'vertical',
    progressMarkerId: 'zero', // ghost only, no fill
  },
  decorators: [
    (Story) => (
      <div style={{ height: 300, display: 'flex', justifyContent: 'center' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    // Vertical 0%-fill progress: ghost-only layer; both markers present
    await expect(getMarkers(canvasElement, 'vertical')).toHaveLength(2);
  },
};