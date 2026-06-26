import { Story, testSegments } from './_SegmentBar.default';

export const Loading: Story = {
  args: {
    segments: [...testSegments.coverage],
    height: 8,
    loading: true,
  },
};
