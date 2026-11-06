import '@testing-library/jest-dom/vitest';

import React from 'react';
import { expect, test } from 'vitest';

import { render, screen } from '../../../test-utils/test-utils';
import { DatePicker } from './DatePicker';

test('real field retains autocomplete policy', () => {
  const { container } = render(<DatePicker locale="en_US" />);
  expect(container.querySelector('input[aria-hidden="true"]')).toHaveAttribute('autocomplete', 'off');
  expect(screen.getAllByRole('spinbutton')).toHaveLength(3);
});

test('real field retains Optional label', () => {
  const { container } = render(<DatePicker locale="en_US" label="Start date" />);
  expect(container.querySelector('label')).toHaveTextContent('Start dateOptional');
});

test('calendar affordance remains decorative', () => {
  render(<DatePicker locale="en_US" />);
  expect(screen.queryByRole('button', { name: /choose date/i })).toBeNull();
});

test('serialized input exposes picker validation rather than formconfig error', () => {
  const { container, rerender } = render(<DatePicker locale="en_US" value={NaN} />);
  expect(container.querySelector('input[aria-hidden="true"]')).toHaveAttribute('aria-invalid', 'true');
  rerender(<DatePicker locale="en_US" formconfig={{ hasError: true, errors: ['Required'] }} />);
  expect(container.querySelector('input[aria-hidden="true"]')).toHaveAttribute('aria-invalid', 'false');
});
