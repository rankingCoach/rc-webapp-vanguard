import '@testing-library/jest-dom/vitest';

import moment from 'moment';
import React, { useState } from 'react';
import { expect, test, vi } from 'vitest';

import { render } from '../../../test-utils/test-utils';
import { clearDate, editDateSection, pasteDate, serializedDateInput } from './date-picker-sections.test-helper';
import { DatePicker } from './DatePicker';

const LintEcho35 = ({ external }: { external?: number }) => {
    const [value, setValue] = useState<number | undefined>(undefined);
    return <DatePicker locale="en_US" value={external ?? value} onChange={(next) => setValue(next ?? undefined)} />;
  };

const LintEcho50 = () => {
    const [value, setValue] = useState<number | undefined>(MARCH);
    return <DatePicker locale="en_US" value={value} onChange={(next) => setValue(next ?? undefined)} />;
  };


const MARCH = moment('2024-03-15').valueOf();

test('a parent rejecting an invalid full date restores its accepted valid value', () => {
  const change = vi.fn();
  const accepted = moment('2024-02-15').valueOf();
  const { container, rerender } = render(<DatePicker locale="en_US" value={accepted} onChange={change} />);
  const input = serializedDateInput(container);
  editDateSection(input, 1, '31');
  expect(change.mock.calls.some(([value]) => Number.isNaN(value))).toBe(true);
  rerender(<DatePicker locale="en_US" value={accepted} onChange={change} />);
  expect(input).toHaveValue('02/15/2024');
});

test('a parent rejecting clear keeps its accepted date', () => {
  const change = vi.fn();
  const { container, rerender } = render(<DatePicker locale="en_US" value={MARCH} onChange={change} />);
  const input = serializedDateInput(container);
  clearDate(input);
  expect(change).toHaveBeenCalledWith(undefined);
  rerender(<DatePicker locale="en_US" value={MARCH} onChange={change} />);
  expect(input).toHaveValue('03/15/2024');
});

test('acknowledged NaN does not leak into a subsequent external valid restore', () => {
  const Echo = LintEcho35;
  const { container, rerender } = render(<Echo />);
  const input = serializedDateInput(container);
  editDateSection(input, 0, '02');
  editDateSection(input, 1, '31');
  editDateSection(input, 2, '2024');
  expect(input).toHaveValue('02/31/2024');
  rerender(<Echo external={moment('2025-06-12').valueOf()} />);
  expect(input).toHaveValue('06/12/2025');
});

test('a valid field edit is adopted when the parent echoes its timestamp', () => {
  const Echo = LintEcho50;
  const { container } = render(<Echo />);
  const input = serializedDateInput(container);
  pasteDate(input, '03/20/2024');
  expect(input).toHaveValue('03/20/2024');
});
