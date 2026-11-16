import '@testing-library/jest-dom/vitest';

import userEvent from '@testing-library/user-event';
import moment from 'moment';
import React from 'react';
import { afterEach, expect, test, vi } from 'vitest';

import { render, screen, within } from '../../../test-utils/test-utils';
import {
  navigateSeparator,
  pasteDate,
  selectedDateSection,
  serializedDateInput,
} from './date-picker-sections.test-helper';
import { DatePicker } from './DatePicker';




const ControlledHarness107 = ({ onChange }: { onChange: ReturnType<typeof vi.fn<(...args: unknown[]) => unknown>> }) => {
    const [value, setValue] = React.useState<number | null | undefined>(moment('2024-03-15').valueOf());
    return (
      <DatePicker
        locale="en_US"
        value={value ?? undefined}
        onChange={(next) => {
          onChange(next);
          setValue(next);
        }}
      />
    );
  };


const LintControlled66 = () => {
    const [value, setValue] = React.useState<number | null | undefined>(moment('2024-03-15').valueOf());
    return (
      <>
        <DatePicker locale="en_US" value={value ?? undefined} onChange={setValue} />
        <button onClick={() => setValue(moment('2024-03-22').valueOf())}>External date</button>
        <button onClick={() => setValue(moment('2024-03-20').valueOf())}>Restore typed date</button>
      </>
    );
  };

const LintControlled87 = () => {
    const [value, setValue] = React.useState<number | null | undefined>(moment('2024-03-15').valueOf());
    const [locale, setLocale] = React.useState('en_US');
    return (
      <>
        <DatePicker locale={locale} value={value ?? undefined} onChange={setValue} />
        <button onClick={() => setLocale('de_DE')}>Change locale</button>
      </>
    );
  };

const LintControlled53 = () => {
    const [value, setValue] = React.useState<number | null | undefined>(moment('2024-03-15').valueOf());
    return <DatePicker locale="en_US" value={value ?? undefined} onChange={setValue} />;
  };


const originalMatchMedia = window.matchMedia;
afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

test('mobile keyboard respects the locale format when toggled back from calendar', async () => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
  });
  const onChange = vi.fn();
  const { container } = render(
    <DatePicker locale="de_DE" value={moment('2024-03-15').valueOf()} onChange={onChange} />,
  );
  await userEvent.click(container.querySelector('[role="group"]')!);
  const dialog = within(await screen.findByRole('dialog'));
  await userEvent.click(dialog.getByRole('button', { name: 'go to text input view' }));
  const input = serializedDateInput(document.querySelector('[role="dialog"]')!);
  expect(input).toHaveValue('15.03.2024');
  pasteDate(input, '27.03.2024');
  expect(onChange.mock.calls).toEqual([[moment('2024-03-27').valueOf()]]);
  await userEvent.click(dialog.getByRole('button', { name: 'go to calendar view' }));
  expect(dialog.queryByRole('grid')).not.toBeNull();
});

test('mobile keyboard shows the current calendar selection', async () => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
  });
  const Controlled = LintControlled53;
  const { container } = render(<Controlled />);
  await userEvent.click(container.querySelector('[role="group"]')!);
  const dialog = within(await screen.findByRole('dialog'));
  await userEvent.click(dialog.getByRole('gridcell', { name: '20' }));
  await userEvent.click(dialog.getByRole('button', { name: 'go to text input view' }));
  expect(serializedDateInput(document.querySelector('[role="dialog"]')!)).toHaveValue('03/20/2024');
});

test('an externally restored previously typed date refreshes the field', async () => {
  const Controlled = LintControlled66;
  const { container } = render(<Controlled />);
  const input = serializedDateInput(container);
  pasteDate(input, '03/20/2024');
  expect(input).toHaveValue('03/20/2024');
  await userEvent.click(screen.getByRole('button', { name: 'External date' }));
  expect(input).toHaveValue('03/22/2024');
  await userEvent.click(screen.getByRole('button', { name: 'Restore typed date' }));
  expect(input).toHaveValue('03/20/2024');
});

test('a locale change reformats a date after controlled typing', async () => {
  const Controlled = LintControlled87;
  const { container } = render(<Controlled />);
  const input = serializedDateInput(container);
  pasteDate(input, '03/20/2024');
  expect(input).toHaveValue('03/20/2024');
  await userEvent.click(screen.getByRole('button', { name: 'Change locale' }));
  expect(input).toHaveValue('20.03.2024');
});

const renderControlledMask = () => {
  const onChange = vi.fn();
  const Controlled = ControlledHarness107;
  const { container } = render(<Controlled onChange={onChange} />);
  return { input: serializedDateInput(container), onChange };
};

const separatorEdits = [
  { key: '{Backspace}', start: 3, caret: 2 },
  { key: '{Delete}', start: 2, caret: 3 },
];

test.each(separatorEdits)('$key at a separator preserves the date, payload and caret', ({ key }) => {
  const { input, onChange } = renderControlledMask();
  navigateSeparator(input, key);
  expect(input).toHaveValue('03/15/2024');
  expect(selectedDateSection()).toBe(key === '{Backspace}' ? '03' : '15');
  expect(input.parentElement!.querySelectorAll('[role="spinbutton"]')).toHaveLength(3);
  expect(onChange).not.toHaveBeenCalled();
});

test.each(separatorEdits)('[v5-quirk] digit insertion after $key keeps the legacy mask and caret', ({ key }) => {
  // Baseline characterization: not a promised contract. Verified against the retained v5 packed runtime.
  const { input, onChange } = renderControlledMask();
  navigateSeparator(input, key);
  pasteDate(input, '03/21/5202');
  expect(input).toHaveValue('03/21/5202');
  expect(selectedDateSection()).toBe('03');
  expect(input.parentElement!.querySelectorAll('[role="spinbutton"]')).toHaveLength(3);
  expect(onChange.mock.calls).toEqual([[moment('5202-03-21').valueOf()]]);
});
