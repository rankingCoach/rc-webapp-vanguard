import { StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { DateRangeInput } from '../DateRangeInput';

export type Story = StoryObj<typeof DateRangeInput>;

export const createMockFormConfig = (initialValue?: string) => ({
  stateValue: initialValue || '',
  setStateValue: fn(),
  _inputRef: { current: null },
});

export const selectors = {
  container: 'data-testid="component-container"',
  input: 'input',
  button: 'button',
} as const;
