import { Story, testSegments } from './_SegmentBar.default';

export const Default: Story = {
  args: {
    segments: [...testSegments.sentiment],
    height: 8,
  },
};
