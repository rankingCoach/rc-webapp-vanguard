/**
 * MUI upgrade contract tests for <DateTimePicker> (Tier B: Vanguard DatePicker (@mui/x-date-pickers) +
 * TimePicker (Vanguard Select -> MUI TextField select)).
 *
 * Unit contract of the public API:
 * 1. `date` prop and the `date` onChange argument are UNIX SECONDS of local midnight.
 * 2. `time` prop and the `time` onChange argument are "HH:mm" (24h), also when showAmPm displays "hh:mm AM".
 * 3. The third onChange argument is a moment (date + time) or undefined when one part is missing.
 * Title tags: `[bug-lock]` = baseline characterization, not a promised contract. Untagged = contract.
 */
import '@testing-library/jest-dom/vitest';

import userEvent from '@testing-library/user-event';
import { OverlayStackingService } from '@vanguard/OverlayStacking/OverlayStackingService';
import moment from 'moment';
import React, { createRef } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { fireEvent, render, screen, waitFor, within } from '../../../test-utils/test-utils';
import { clearDate, pasteDate, serializedDateInput } from '../DatePicker/date-picker-sections.test-helper';
import { DateTimePicker } from './DateTimePicker';

// Each test opens the MUI calendar popper and drives real transitions (~1s isolated). In a full parallel
// spec run that exceeds the 5s default, so this file gets a longer per-test timeout.
vi.setConfig({ testTimeout: 20_000 });

const BIDI_CHARS = /[⁦-⁩‎‏]/g;
const unixSeconds = (y: number, m: number, d: number, h = 0, min = 0) =>
  Math.floor(new Date(y, m - 1, d, h, min).getTime() / 1000);
const MARCH_15_2024_NOON = unixSeconds(2024, 3, 15, 12, 0);
const MARCH_15_2024_MIDNIGHT = unixSeconds(2024, 3, 15);

const getDateInput = (container: HTMLElement) => serializedDateInput(container);
const readDate = (container: HTMLElement) => getDateInput(container).value.replace(BIDI_CHARS, '');
const getTimeSelect = () => screen.getByRole('combobox');
const getLabels = () => Array.from(document.querySelectorAll('label')).map((l) => l.textContent?.replace(/\s/g, ' '));

const openCalendar = async (container: HTMLElement) => {
  await userEvent.click(container.querySelector('[role="group"]')!);
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeNull());
};
const pickDay = (dayNumber: number) =>
  userEvent.click(within(screen.getByRole('dialog')).getByRole('gridcell', { name: String(dayNumber) }));
const pickTime = async (label: string) => {
  await userEvent.click(getTimeSelect());
  await userEvent.click(await screen.findByRole('option', { name: label }));
};

/** onChange args as [seconds, time, formatted dateTime] for readable assertions */
const callsOf = (spy: ReturnType<typeof vi.fn>) =>
  spy.mock.calls.map(([date, time, dateTime]) => [
    date,
    time,
    dateTime === undefined ? undefined : moment.isMoment(dateTime) ? dateTime.format('YYYY-MM-DD HH:mm') : dateTime,
  ]);

afterEach(() => {
  OverlayStackingService.__resetForTests();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('DateTimePicker contract: rendering', () => {
  test('shows the date (unix seconds) in the locale format and the time in the select', () => {
    const { container } = render(<DateTimePicker locale={'en_US'} date={MARCH_15_2024_NOON} time={'09:00'} />);

    expect(readDate(container)).toBe('03/15/2024');
    expect(getTimeSelect()).toHaveTextContent('09:00');
  });

  test('de_DE locale formats the date as DD.MM.YYYY', () => {
    const { container } = render(<DateTimePicker locale={'de_DE'} date={MARCH_15_2024_NOON} time={'09:00'} />);
    expect(readDate(container)).toBe('15.03.2024');
  });

  test('default labels "Start date"/"Start time", both required (asterisk, no "Optional")', () => {
    const { container } = render(<DateTimePicker locale={'en_US'} />);

    expect(getLabels()).toEqual(['Start date *', 'Start time *']);
    expect(getDateInput(container)).toBeRequired();
  });

  test('custom labels', () => {
    render(<DateTimePicker locale={'en_US'} labelDate={'Publish on'} labelTime={'At'} />);
    expect(getLabels()).toEqual(['Publish on *', 'At *']);
  });

  test('empty date and time render an empty date input and an empty time select', () => {
    const { container } = render(<DateTimePicker locale={'en_US'} />);

    expect(readDate(container)).toBe('');
    expect(getTimeSelect().textContent?.replace(/​/g, '').trim()).toBe('');
  });

  test('pickerRef is bound to the wrapper that contains both fields', () => {
    const pickerRef = createRef<HTMLDivElement>();
    const { container } = render(<DateTimePicker locale={'en_US'} pickerRef={pickerRef} />);

    expect(pickerRef.current).not.toBeNull();
    expect(pickerRef.current?.contains(getDateInput(container))).toBe(true);
    expect(pickerRef.current?.contains(getTimeSelect())).toBe(true);
  });

  test('showAmPm displays the time as "hh:mm AM/PM"', () => {
    render(<DateTimePicker locale={'en_US'} date={MARCH_15_2024_NOON} time={'14:30'} showAmPm={true} />);
    expect(getTimeSelect()).toHaveTextContent('02:30 PM');
  });
});

describe('DateTimePicker contract: onChange payload', () => {
  test('on mount: (unix seconds of local midnight, "HH:mm", combined moment)', () => {
    const onChange = vi.fn();
    render(<DateTimePicker locale={'en_US'} date={MARCH_15_2024_NOON} time={'09:00'} onChange={onChange} />);

    expect(onChange).toHaveBeenCalledTimes(1);
    const [date, time, dateTime] = onChange.mock.calls[0];
    expect(typeof date).toBe('number');
    expect(String(date)).toHaveLength(10);
    expect(date).toBe(MARCH_15_2024_MIDNIGHT);
    expect(time).toBe('09:00');
    expect(moment.isMoment(dateTime)).toBe(true);
    expect(dateTime.format('YYYY-MM-DD HH:mm')).toBe('2024-03-15 09:00');
  });

  test('on mount with only a date: dateTime is undefined', () => {
    const onChange = vi.fn();
    render(<DateTimePicker locale={'en_US'} date={MARCH_15_2024_NOON} onChange={onChange} />);
    expect(callsOf(onChange)).toEqual([[MARCH_15_2024_MIDNIGHT, undefined, undefined]]);
  });

  test('on mount with nothing: all three arguments undefined', () => {
    const onChange = vi.fn();
    render(<DateTimePicker locale={'en_US'} onChange={onChange} />);
    expect(callsOf(onChange)).toEqual([[undefined, undefined, undefined]]);
  });

  test('picking a day emits the new day as unix seconds (midnight) and keeps the time', async () => {
    const onChange = vi.fn();
    const { container } = render(
      <DateTimePicker locale={'en_US'} date={MARCH_15_2024_NOON} time={'09:00'} onChange={onChange} />,
    );
    onChange.mockClear();

    await openCalendar(container);
    await pickDay(20);

    expect(callsOf(onChange)).toEqual([[unixSeconds(2024, 3, 20), '09:00', '2024-03-20 09:00']]);
    expect(readDate(container)).toBe('03/20/2024');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  test('picking a day without a time emits (seconds, undefined, undefined)', async () => {
    const onChange = vi.fn();
    const { container } = render(<DateTimePicker locale={'en_US'} date={MARCH_15_2024_NOON} onChange={onChange} />);
    onChange.mockClear();

    await openCalendar(container);
    await pickDay(20);

    expect(callsOf(onChange)).toEqual([[unixSeconds(2024, 3, 20), undefined, undefined]]);
  });

  test('picking a time emits the "HH:mm" string and the combined moment', async () => {
    const onChange = vi.fn();
    render(<DateTimePicker locale={'en_US'} date={MARCH_15_2024_NOON} time={'09:00'} onChange={onChange} />);
    onChange.mockClear();

    await pickTime('10:30');

    expect(callsOf(onChange)).toEqual([[MARCH_15_2024_MIDNIGHT, '10:30', '2024-03-15 10:30']]);
    expect(getTimeSelect()).toHaveTextContent('10:30');
  });

  test('showAmPm: picking "02:00 PM" still emits 24h "14:00"', async () => {
    const onChange = vi.fn();
    render(
      <DateTimePicker locale={'en_US'} date={MARCH_15_2024_NOON} time={'09:00'} showAmPm={true} onChange={onChange} />,
    );
    onChange.mockClear();

    await pickTime('02:00 PM');

    expect(callsOf(onChange)).toEqual([[MARCH_15_2024_MIDNIGHT, '14:00', '2024-03-15 14:00']]);
  });

  test('[bug-lock] typing a partial date or clearing it does not emit (falsy/NaN DatePicker payloads are ignored)', () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR (suspected bug): DatePicker emits NaN (partial) / undefined (cleared); handleDateChange ignores both, so
    // the consumer keeps the previous date and is never told the field was cleared.
    const onChange = vi.fn();
    const { container } = render(
      <DateTimePicker locale={'en_US'} date={MARCH_15_2024_NOON} time={'09:00'} onChange={onChange} />,
    );
    onChange.mockClear();

    clearDate(getDateInput(container));
    fireEvent.change(getDateInput(container), { target: { value: '03/2' } });

    expect(onChange).not.toHaveBeenCalled();
  });

  test('typing a full date emits it as unix seconds (midnight)', () => {
    const onChange = vi.fn();
    const { container } = render(<DateTimePicker locale={'en_US'} time={'09:00'} onChange={onChange} />);
    onChange.mockClear();

    pasteDate(getDateInput(container), '03/20/2024');

    expect(callsOf(onChange)).toEqual([[unixSeconds(2024, 3, 20), '09:00', '2024-03-20 09:00']]);
  });

  test('without onChange interactions do not throw', async () => {
    const { container } = render(<DateTimePicker locale={'en_US'} date={MARCH_15_2024_NOON} time={'09:00'} />);

    await openCalendar(container);
    await pickDay(20);
    await pickTime('10:00');

    expect(readDate(container)).toBe('03/20/2024');
  });
});

describe('DateTimePicker contract: limits', () => {
  test('minDate/maxDate (unix seconds) disable days outside the range in the calendar', async () => {
    const { container } = render(
      <DateTimePicker
        locale={'en_US'}
        date={MARCH_15_2024_NOON}
        minDate={unixSeconds(2024, 3, 10)}
        maxDate={unixSeconds(2024, 3, 20)}
      />,
    );
    await openCalendar(container);
    const calendar = screen.getByRole('dialog');

    expect(within(calendar).getByRole('gridcell', { name: '9' })).toBeDisabled();
    expect(within(calendar).getByRole('gridcell', { name: '10' })).toBeEnabled();
    expect(within(calendar).getByRole('gridcell', { name: '20' })).toBeEnabled();
    expect(within(calendar).getByRole('gridcell', { name: '21' })).toBeDisabled();
  });

  test('disablePast disables days before today (frozen clock)', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2024, 2, 15, 12, 0, 0));
    const { container } = render(<DateTimePicker locale={'en_US'} disablePast={true} />);

    await openCalendar(container);
    const calendar = screen.getByRole('dialog');

    expect(within(calendar).getByRole('gridcell', { name: '14' })).toBeDisabled();
    expect(within(calendar).getByRole('gridcell', { name: '15' })).toBeEnabled();
  });

  test('half-hour time list; minTime/maxTime disable the options outside the range', async () => {
    render(<DateTimePicker locale={'en_US'} minTime={'09:00'} maxTime={'10:00'} />);

    await userEvent.click(getTimeSelect());
    const options = await screen.findAllByRole('option');

    expect(options).toHaveLength(48);
    expect(options[0]).toHaveTextContent('00:00');
    expect(options[1]).toHaveTextContent('00:30');
    const byLabel = (label: string) => screen.getByRole('option', { name: label });
    expect(byLabel('08:30')).toHaveAttribute('aria-disabled', 'true');
    expect(byLabel('09:00')).not.toHaveAttribute('aria-disabled');
    expect(byLabel('10:00')).not.toHaveAttribute('aria-disabled');
    expect(byLabel('10:30')).toHaveAttribute('aria-disabled', 'true');
  });
});
