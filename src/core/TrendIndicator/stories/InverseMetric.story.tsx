import { Story, testValues } from './_TrendIndicator.default';

// Rank dropped from 12 → 8: a lower number is better, so this reads as an improvement.
export const InverseMetric: Story = {
  args: {
    current: testValues.worsenedCurrent,
    previous: testValues.worsenedPrevious,
    higherIsBetter: false,
  },
};
