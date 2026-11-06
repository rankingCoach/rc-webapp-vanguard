import '@testing-library/jest-dom/vitest';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import moment from 'moment';
import React, { useState } from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { fireEvent, render, screen } from '../../../test-utils/test-utils';
import { editDateSection, serializedDateInput } from './date-picker-sections.test-helper';
import { DatePicker } from './DatePicker';

const LintEcho76 = ({ locale, external }: { locale: string; external?: number }) => {
    const [value, setValue] = useState<number | undefined>();
    return <DatePicker locale={locale} value={external ?? value} onChange={(next) => setValue(next ?? undefined)} />;
  };


const original = window.matchMedia;
beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
  });
});
afterEach(() => {
  window.matchMedia = original;
});
const date = moment('2024-03-15').valueOf();

test('mobile Enter bubbles to a consumer handler and opens exactly one dialog on repeated requests', () => {
  const key = vi.fn();
  render(
    <div onKeyDown={key}>
      <DatePicker locale="en_US" value={date} />
    </div>,
  );
  const field = screen.getByRole('group');
  fireEvent.keyDown(field, { key: 'Enter' });
  fireEvent.keyDown(field, { key: 'Enter' });
  expect(key).toHaveBeenCalledTimes(2);
  expect(screen.getAllByRole('dialog')).toHaveLength(1);
});

test('desktop Enter does not open the mobile dialog', () => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: true,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
  });
  render(<DatePicker locale="en_US" value={date} />);
  fireEvent.keyDown(screen.getByRole('group'), { key: 'Enter' });
  expect(screen.queryByRole('dialog')).toBeNull();
});

for (const mode of ['disabled', 'readOnly'] as const) {
  test(`mobile Enter honors the picker ${mode} state`, () => {
    const theme = createTheme({ components: { MuiDatePicker: { defaultProps: { [mode]: true } } } });
    render(
      <ThemeProvider theme={theme}>
        <DatePicker locale="en_US" value={date} />
      </ThemeProvider>,
    );
    fireEvent.keyDown(screen.getByRole('group'), { key: 'Enter' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
}

test('an acknowledged invalid edit does not leak into a locale restore or remount', () => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: true,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
  });
  const Echo = LintEcho76;
  const view = render(<Echo locale="en_US" />);
  const input = serializedDateInput(view.container);
  editDateSection(input, 0, '02');
  editDateSection(input, 1, '31');
  editDateSection(input, 2, '2024');
  expect(input).toHaveValue('02/31/2024');
  view.rerender(<Echo locale="de_DE" external={moment('2025-06-12').valueOf()} />);
  expect(serializedDateInput(view.container)).toHaveValue('12.06.2025');
  view.unmount();
  const fresh = render(<DatePicker locale="en_US" value={date} />);
  expect(serializedDateInput(fresh.container)).toHaveValue('03/15/2024');
});

test('a consumer DateField key handler still receives mobile Enter', () => {
  const key = vi.fn();
  const theme = createTheme({ components: { MuiDateField: { defaultProps: { onKeyDown: key } } } });
  render(
    <ThemeProvider theme={theme}>
      <DatePicker locale="en_US" value={date} />
    </ThemeProvider>,
  );
  fireEvent.keyDown(screen.getAllByRole('spinbutton')[0], { key: 'Enter' });
  expect(key).toHaveBeenCalledTimes(1);
  expect(screen.getAllByRole('dialog')).toHaveLength(1);
});
