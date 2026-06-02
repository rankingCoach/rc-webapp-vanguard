import { expect, within } from 'storybook/test';

import { defaultProps, getMarkers, Story, TextPin } from './_BenchmarkGauge.default';

export const ProgressWideTextPin: Story = {
  name: 'Progress mode — wide text pin stays right of fill boundary',
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
        renderPin: () => <TextPin label="Current score" />,
      },
    ],
    progressMarkerId: 'progress',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The badge text renders as the progress marker's pin
    await expect(canvas.getByText('Current score')).toBeInTheDocument();
    // Both markers (wide-pin progress and plain reference) are on the track
    await expect(getMarkers(canvasElement)).toHaveLength(2);
  },
};