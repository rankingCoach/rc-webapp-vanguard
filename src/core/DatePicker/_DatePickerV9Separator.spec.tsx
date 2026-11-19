import '@testing-library/jest-dom/vitest';

import moment from 'moment';
import React from 'react';
import { expect, test, vi } from 'vitest';

import { render } from '../../../test-utils/test-utils';
import { navigateSeparator, selectedDateSection, serializedDateInput } from './date-picker-sections.test-helper';
import { DatePicker } from './DatePicker';

test.each(['{Backspace}', '{Delete}'])('v9 separator navigation for %s does not shift digits or publish', (key) => {
  const change = vi.fn();
  const { container } = render(<DatePicker locale="en_US" value={moment('2024-03-15').valueOf()} onChange={change} />);
  const input = serializedDateInput(container);
  navigateSeparator(input, key);
  expect(input).toHaveValue('03/15/2024');
  expect(selectedDateSection()).toBe(key === '{Backspace}' ? '03' : '15');
  expect(change).not.toHaveBeenCalled();
});
