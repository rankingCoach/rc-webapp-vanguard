import { StoryObj } from '@storybook/react';
import { TextHighlighted } from '../TextHighlighted';

export type Story = StoryObj<typeof TextHighlighted>;

export const highlightColors = {
  warning: 'color-mix(in srgb, var(--w400) 40%, transparent)',
  error: 'color-mix(in srgb, var(--e400) 40%, transparent)',
} as const;
