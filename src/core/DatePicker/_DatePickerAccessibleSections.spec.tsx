import '@testing-library/jest-dom/vitest';

import moment from 'moment';
import React from 'react';
import { expect, test } from 'vitest';

import { render, within } from '../../../test-utils/test-utils';
import { DatePicker } from './DatePicker';

// S5a migration requirement, added after the accepted initial captures.
// This guards the actual editor, rather than inferring migration from a removed prop.
test('uses the real accessible section editor with a hidden serialized value', () => {
  const { container } = render(
    <DatePicker locale="en_US" label="Pick a date" value={moment('2024-03-15').valueOf()} />,
  );
  const group = within(container).getByRole('group', { name: 'Pick a date Optional' });
  expect(within(group).getAllByRole('spinbutton')).toHaveLength(3);
  expect(container.querySelector('input[aria-hidden="true"]')).toHaveValue('03/15/2024');
  expect(container.querySelector('input[type="tel"]')).toBeNull();
});
