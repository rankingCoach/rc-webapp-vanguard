import '@testing-library/jest-dom/vitest';

import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment';
import React from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { render, screen, within } from '../../../test-utils/test-utils';
import { DatePicker } from './DatePicker';

const originalMatchMedia = window.matchMedia;
beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: true,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
  });
});
afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

test('preserves formconfig required, helper text and the unbound legacy ref', () => {
  const formconfig = {
    hasError: true,
    errors: ['Field is required'],
    validation: { required: true },
    _inputRef: { current: null },
  };
  const { container } = render(<DatePicker locale="en_US" label="Start date" formconfig={formconfig} />);
  expect(screen.getByTestId('vanguard-input-error-text')).toHaveTextContent('Field is required');
  expect(container.querySelector('input[aria-hidden="true"]')).toBeRequired();
  expect(formconfig._inputRef.current).toBeNull();
});

test('full date paste publishes milliseconds, select all delete clears to undefined, external restore and locale reformat', () => {
  const change = vi.fn();
  const { container, rerender } = render(<DatePicker locale="en_US" label="Date" onChange={change} />);
  const group = screen.getByRole('group', { name: 'Date Optional' });
  const section = within(group).getAllByRole('spinbutton')[0];
  fireEvent.focus(section);
  fireEvent.paste(section, { clipboardData: { getData: () => '03/20/2024' } });
  expect(change).toHaveBeenLastCalledWith(moment('2024-03-20').valueOf());
  rerender(<DatePicker locale="en_US" label="Date" value={moment('2024-03-20').valueOf()} onChange={change} />);
  fireEvent.focus(section);
  fireEvent.keyDown(screen.getAllByRole('spinbutton')[0], { key: 'a', ctrlKey: true });
  fireEvent.keyDown(container.querySelector('[contenteditable="true"]')!, { key: 'Delete' });
  expect(change).toHaveBeenLastCalledWith(undefined);
  rerender(<DatePicker locale="de_DE" label="Date" value={moment('2024-03-22').valueOf()} onChange={change} />);
  expect(container.querySelector('input[aria-hidden="true"]')).toHaveValue('22.03.2024');
});

test('publishes every partial numeric section edit as NaN', () => {
  const change = vi.fn();
  render(<DatePicker locale="en_US" label="Date" onChange={change} />);
  const section = screen.getAllByRole('spinbutton')[0];
  fireEvent.focus(section);
  for (const digit of '032') {
    section.textContent = digit;
    fireEvent.input(section, { inputType: 'insertText', data: digit });
  }
  expect(change.mock.calls.map(([value]) => Number.isNaN(value))).toEqual([true, true, true]);
});

test('mobile keyboard uses real editable sections with the current date', async () => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
  });
  const change = vi.fn();
  render(<DatePicker locale="de_DE" label="Date" value={moment('2024-03-15').valueOf()} onChange={change} />);
  await userEvent.click(screen.getByRole('group', { name: 'Choose date, selected date is Mar 15, 2024' }));
  const dialog = within(await screen.findByRole('dialog'));
  await userEvent.click(dialog.getByRole('button', { name: 'go to text input view' }));
  expect(dialog.getAllByRole('spinbutton')).toHaveLength(3);
  expect(document.querySelector('[role="dialog"] input[aria-hidden="true"]')).toHaveValue('15.03.2024');
  const section = dialog.getAllByRole('spinbutton')[0];
  fireEvent.focus(section);
  fireEvent.paste(section, { clipboardData: { getData: () => '99.99.2024' } });
  expect(change).not.toHaveBeenCalled();
  fireEvent.paste(section, { clipboardData: { getData: () => '27.03.2024' } });
  expect(change).toHaveBeenLastCalledWith(moment('2024-03-27').valueOf());
});
