import { StoryObj } from '@storybook/react';

import { CircularGauge } from '../CircularGauge';

export type Story = StoryObj<typeof CircularGauge>;

export const testValues = {
  zero: 0,
  visibility: 74,
  rating: 4.6,
  full: 100,
} as const;

export const testColors = {
  success: 'var(--s400)',
  warning: 'var(--w400)',
  danger: 'var(--e400)',
  amber: '#FF9F0A',
} as const;
