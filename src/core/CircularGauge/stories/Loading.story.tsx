import { Story, testValues } from './_CircularGauge.default';

export const Loading: Story = {
  args: {
    value: testValues.zero,
    loading: true,
  },
};
