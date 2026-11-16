import '@testing-library/jest-dom/vitest';

import { fireEvent } from '@testing-library/react';
import React from 'react';
import { expect, test, vi } from 'vitest';

import { render, screen } from '../../../test-utils/test-utils';
import { DatePicker } from './DatePicker';

test('rejected text after a partial numeric edit preserves sections without publishing another NaN', () => {
  const change = vi.fn();
  render(<DatePicker locale="en_US" label="Date" onChange={change} />);
  const section = screen.getAllByRole('spinbutton')[0];
  fireEvent.focus(section);
  section.textContent = '3';
  fireEvent.input(section, { inputType: 'insertText', data: '3' });
  expect(change.mock.calls.map(([value]) => Number.isNaN(value))).toEqual([true]);
  const acceptedText = section.textContent;
  section.textContent = '!';
  fireEvent.input(section, { inputType: 'insertText', data: '!' });
  expect(section).toHaveTextContent(acceptedText!);
  expect(change.mock.calls.map(([value]) => Number.isNaN(value))).toEqual([true]);
});
