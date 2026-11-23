import { act, render } from '@testing-library/react';
import moment from 'moment';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DateFieldReference, type DateFieldFixtureProps } from './_DateField.mui-reference';
import { DateField } from './DateField';

/**
 * D2 parity of the outlined input's structure (V1 sweep A03): the own DateField renders the same direct children as
 * MUI X 9.17 inside `.MuiPickersOutlinedInput-root`, in the same order and with the same Mui* classes (emotion `css-*`
 * classes excluded). External consumers (WordPress plugin, tests) may rely on either.
 */
const date = (iso: string) => moment(iso, moment.ISO_8601).locale('en');
const base: DateFieldFixtureProps = {
  locale: 'en',
  format: 'MM/DD/YYYY',
  label: 'Start date',
  value: date('2024-03-15'),
  referenceDate: date('2024-03-15'),
  minDate: date('2024-01-01'),
  maxDate: date('2024-12-31'),
};

const structure = (Field: React.ComponentType<DateFieldFixtureProps>, props: DateFieldFixtureProps, focus: boolean) => {
  const view = render(<Field {...props} />);
  try {
    if (focus) {
      const section = view.container.querySelector<HTMLElement>('[role="spinbutton"]');
      act(() => section?.focus());
    }
    const root = view.container.querySelector('.MuiPickersOutlinedInput-root');
    expect(root, 'outlined input root').not.toBeNull();
    return [...(root as Element).children].map((child) => ({
      tag: child.tagName.toLowerCase(),
      classes: [...child.classList].filter((name) => name.startsWith('Mui')).sort(),
    }));
  } finally {
    view.unmount();
  }
};

describe('DateField outlined input structure against frozen MUI X 9.17.0', () => {
  beforeEach(() => vi.setSystemTime(new Date(2024, 2, 15, 12)));
  afterEach(() => vi.useRealTimers());

  it.each([
    { state: 'rest', props: {}, focus: false },
    { state: 'focus', props: {}, focus: true },
    { state: 'error', props: { value: date('2025-02-01') }, focus: false },
    { state: 'disabled', props: { disabled: true }, focus: false },
  ])('keeps child order and Mui* classes ($state)', ({ props, focus }) => {
    const options = { ...base, ...props };
    expect(structure(DateField, options, focus)).toEqual(structure(DateFieldReference, options, focus));
  });
});
