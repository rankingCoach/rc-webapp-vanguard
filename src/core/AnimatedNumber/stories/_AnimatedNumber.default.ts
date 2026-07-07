import { StoryObj } from '@storybook/react';

import { AnimatedNumber } from '../AnimatedNumber';

export type Story = StoryObj<typeof AnimatedNumber>;

export const testValues = {
  actions: 631,
  rating: 4.6,
  coverage: 82,
} as const;
