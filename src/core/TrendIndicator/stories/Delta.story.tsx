import { StoryObj } from '@storybook/react';

import { TrendDelta } from '../TrendIndicator';
import { testValues } from './_TrendIndicator.default';

export const Delta: StoryObj<typeof TrendDelta> = {
  render: (args) => <TrendDelta {...args} />,
  args: {
    current: testValues.improvedCurrent,
    previous: testValues.improvedPrevious,
  },
};
