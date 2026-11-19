import '@testing-library/jest-dom/vitest';

import userEvent from '@testing-library/user-event';
import moment from 'moment';
import React from 'react';
import { afterEach, expect, test, vi } from 'vitest';

import { render, screen, within } from '../../../test-utils/test-utils';
import { pasteDate, serializedDateInput, typePartialDate } from './date-picker-sections.test-helper';
import { DatePicker } from './DatePicker';




const ControlledHarness51 = ({ change }: { change: ReturnType<typeof vi.fn<(...args: unknown[]) => unknown>> }) => {
    const [value, setValue] = React.useState<number | null | undefined>();
    return (
      <DatePicker
        locale="en_US"
        value={value ?? undefined}
        onChange={(next) => {
          change(next);
          setValue(next);
        }}
      />
    );
  };


const originalMatchMedia = window.matchMedia;
afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

test('custom field obtains format and controlled value from picker context', () => {
  const change = vi.fn();
  const { container, rerender } = render(
    <DatePicker locale="de_DE" value={moment('2024-03-15').valueOf()} onChange={change} />,
  );
  const input = serializedDateInput(container);
  expect(input).toHaveValue('15.03.2024');
  pasteDate(input, '20.03.2024');
  expect(change).toHaveBeenLastCalledWith(moment('2024-03-20').valueOf());
  rerender(<DatePicker locale="en_US" value={moment('2024-03-22').valueOf()} onChange={change} />);
  expect(input).toHaveValue('03/22/2024');
});

test('mobile layout obtains selected value and change action from picker context', async () => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
  });
  const change = vi.fn();
  const { container } = render(<DatePicker locale="de_DE" value={moment('2024-03-15').valueOf()} onChange={change} />);
  await userEvent.click(container.querySelector('[role="group"]')!);
  const dialog = within(await screen.findByRole('dialog'));
  await userEvent.click(dialog.getByRole('button', { name: 'go to text input view' }));
  const input = serializedDateInput(document.querySelector('[role="dialog"]')!);
  expect(input).toHaveValue('15.03.2024');
  pasteDate(input, '27.03.2024');
  expect(change).toHaveBeenLastCalledWith(moment('2024-03-27').valueOf());
});

test('custom field publishes each incomplete edit even when invalid Moments compare equal', () => {
  const change = vi.fn();
  const Controlled = ControlledHarness51;
  const { container } = render(<Controlled change={change} />);
  typePartialDate(serializedDateInput(container), '032');
  expect(change.mock.calls.map(([value]) => Number.isNaN(value))).toEqual([true, true, true]);
});

test('calendar retains the legacy popper class for host overlay stacking', async () => {
  const { container } = render(<DatePicker locale="en_US" value={moment('2024-03-15').valueOf()} />);
  await userEvent.click(container.querySelector('[role="group"]')!);
  const calendar = document.querySelector('.MuiCalendarPicker-root')!;
  expect(calendar.closest('.MuiPickersPopper-root')).not.toBeNull();
});
