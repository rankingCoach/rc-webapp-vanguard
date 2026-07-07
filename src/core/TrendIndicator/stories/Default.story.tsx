import { Story, testValues } from './_TrendIndicator.default';

export const Default: Story = {
  args: {
    current: testValues.improvedCurrent,
    previous: testValues.improvedPrevious,
  },
};
