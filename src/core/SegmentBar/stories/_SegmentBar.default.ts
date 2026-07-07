import { StoryObj } from '@storybook/react';

import { SegmentBar } from '../SegmentBar';

export type Story = StoryObj<typeof SegmentBar>;

export const testSegments = {
  sentiment: [
    { value: 11, color: '#34C759' },
    { value: 2, color: '#FF9F0A' },
    { value: 1, color: '#FF453A' },
  ],
  coverage: [
    { value: 18, color: 'var(--s400)' },
    { value: 5, color: 'var(--w400)' },
    { value: 3, color: 'var(--n300)' },
  ],
} as const;
