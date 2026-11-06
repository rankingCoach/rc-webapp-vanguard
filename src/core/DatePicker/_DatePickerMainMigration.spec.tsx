import '@testing-library/jest-dom/vitest';

import userEvent from '@testing-library/user-event';
import moment from 'moment';
import React, { useState } from 'react';
import { expect, test, vi } from 'vitest';

import { fireEvent, render, screen, waitFor } from '../../../test-utils/test-utils';
import { dateSection, editDateSection, serializedDateInput } from './date-picker-sections.test-helper';
import { DatePicker } from './DatePicker';

const Echo = ({ external }: { external?: number }) => {
  const [value, setValue] = useState<number | undefined>(undefined);
  return <DatePicker locale="en_US" value={external ?? value} onChange={(next) => setValue(next ?? undefined)} />;
};

test('controlled invalid echo retains edited sections and genuine external dates restore', () => {
  const { container, rerender } = render(<Echo />);
  const input = serializedDateInput(container);
  editDateSection(input, 0, '03');
  editDateSection(input, 1, '20');
  expect(input).toHaveValue('03/20/YYYY');
  rerender(<Echo external={moment('2024-04-12').valueOf()} />);
  expect(input).toHaveValue('04/12/2024');
});

test('controlled impossible section date retains February 31 and validation', () => {
  const { container } = render(<Echo />);
  const input = serializedDateInput(container);
  editDateSection(input, 0, '02');
  editDateSection(input, 1, '31');
  editDateSection(input, 2, '2024');
  expect(input).toHaveValue('02/31/2024');
  expect(input).toHaveAttribute('aria-invalid', 'true');
});

test('v9 publishes valid intermediate years while year digits are entered', () => {
  const change = vi.fn();
  const { container } = render(<DatePicker locale="en_US" onChange={change} />);
  const input = serializedDateInput(container);
  for (const [index, value] of [
    [0, '0'],
    [0, '3'],
    [1, '2'],
    [1, '0'],
    [2, '2'],
    [2, '0'],
    [2, '2'],
    [2, '4'],
  ] as const) {
    editDateSection(input, index, value);
  }
  expect(change.mock.calls.map(([value]) => (Number.isNaN(value) ? 'NaN' : moment(value).format('YYYY')))).toEqual([
    'NaN',
    'NaN',
    'NaN',
    'NaN',
    '0002',
    '0020',
    '0202',
    '2024',
  ]);
});

test('v9 Delete of an unselected complete field publishes public undefined', () => {
  const change = vi.fn();
  const { container } = render(<DatePicker locale="en_US" value={moment('2024-03-20').valueOf()} onChange={change} />);
  const section = dateSection(serializedDateInput(container), 2);
  fireEvent.focus(section);
  fireEvent.keyDown(section, { key: 'Delete' });
  expect(change.mock.calls).toEqual([[undefined]]);
});

test('Escape restores real editor focus and tab out removes the focused ring', async () => {
  const { container } = render(
    <>
      <DatePicker locale="en_US" value={moment('2024-03-15').valueOf()} />
      <button>After</button>
    </>,
  );
  await userEvent.click(screen.getByRole('group'));
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(screen.getByRole('group').contains(document.activeElement)).toBe(true);
  expect(container.querySelector('.Mui-focused')).not.toBeNull();
  await userEvent.click(screen.getByRole('button', { name: 'After' }));
  expect(container.querySelector('.Mui-focused')).toBeNull();
});

test('mobile genuine editor has the date name, rejects typing and opens with Enter', async () => {
  const original = window.matchMedia;
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
  });
  try {
    const change = vi.fn();
    const { container } = render(
      <DatePicker locale="en_US" value={moment('2024-03-15').valueOf()} onChange={change} />,
    );
    const group = screen.getByRole('group', { name: 'Choose date, selected date is Mar 15, 2024' });
    const input = serializedDateInput(container);
    for (const section of group.querySelectorAll('[role="spinbutton"]')) {
      expect(section).toHaveAttribute('aria-readonly', 'true');
      expect(section).toHaveAttribute('contenteditable', 'false');
    }
    editDateSection(input, 0, '12');
    expect(input).toHaveValue('03/15/2024');
    expect(change).not.toHaveBeenCalled();
    fireEvent.keyDown(group, { key: 'Enter' });
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  } finally {
    window.matchMedia = original;
  }
});

test('section helper exits select-all through actual navigation and returns distinct date sections', () => {
  const { container } = render(<DatePicker locale="en_US" value={moment('2024-03-15').valueOf()} />);
  const input = serializedDateInput(container);
  const month = dateSection(input);
  fireEvent.focus(month);
  fireEvent.keyDown(month, { key: 'a', ctrlKey: true });
  expect(input.parentElement!.querySelectorAll('[role="spinbutton"]')).toHaveLength(0);
  expect(dateSection(input, 0)).toHaveTextContent('03');
  expect(dateSection(input, 1)).toHaveTextContent('15');
  expect(dateSection(input, 2)).toHaveTextContent('2024');
});
