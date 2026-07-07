import { StoryObj } from '@storybook/react';

import { Skeleton } from '../Skeleton';

export type Story = StoryObj<typeof Skeleton>;

export const testSizes = {
  line: { width: 200, height: 16 },
  title: { width: 280, height: 24 },
  avatar: { width: 48, height: 48 },
  box: { width: 200, height: 120 },
} as const;
