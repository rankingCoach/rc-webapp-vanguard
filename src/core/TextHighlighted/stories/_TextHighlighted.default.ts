import { StoryObj } from '@storybook/react';
import { TextHighlighted } from '../TextHighlighted';

export type Story = StoryObj<typeof TextHighlighted>;

export const highlightColors = {
  warning: 'rgba(var(--w400-rgb),0.4)',
  error: 'rgba(var(--e400-rgb),0.4)',
} as const;
