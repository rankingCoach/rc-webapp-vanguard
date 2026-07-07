import { StoryObj } from '@storybook/react';

import { TrendIndicator } from '../TrendIndicator';

export type Story = StoryObj<typeof TrendIndicator>;

export const testValues = {
  improvedCurrent: 42,
  improvedPrevious: 36,
  worsenedCurrent: 8,
  worsenedPrevious: 12,
  stable: 20,
} as const;
