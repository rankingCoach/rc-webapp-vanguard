/**
 * MUI upgrade contract tests for <DatePicker> (core v5 -> v9, @mui/x-date-pickers 5.0.16 -> 9.x).
 *
 * These tests lock the CURRENT observable behaviour through the public Vanguard props and the user-visible DOM.
 * The picker internals (renderInput, inputFormat, PopperProps, PaperProps) will be rewritten during the upgrade,
 * so these tests are the guarantee that the public behaviour survives. They must not be edited to make a bump pass,
 * unless the behaviour change is approved as an intentional incompatibility.
 *
 * Conventions:
 * 1. Input values are read through `readInputValue()`, which strips the bidi isolation characters pickers v6+ inject.
 * 2. Calendar days are found by role (`gridcell` + day number), month arrows by accessible name.
 * 3. MUI class names are only used where Vanguard production code depends on them (commented at each use).
 * 4. Title tags: `[bug-lock]` = locks a suspected Vanguard bug, `[v5-quirk]` = locks odd / MUI-v5-specific behaviour
 *    Vanguard did not choose. Both are baseline characterization, not a promised contract. Untagged = contract.
 *    Expected reds per bump stage: /tmp/mui-upgrade/registry-dates.md.
 */
import '@testing-library/jest-dom/vitest';

import userEvent from '@testing-library/user-event';
import { OVERLAY_BASE_Z_INDEX, OverlayStackingService } from '@vanguard/OverlayStacking/OverlayStackingService';
import React, { useState } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { act, fireEvent, render, screen, waitFor, within } from '../../../test-utils/test-utils';
import {
  clearDate,
  dateSection,
  editDateSection,
  pasteDate,
  serializedDateInput,
} from './date-picker-sections.test-helper';
import { DatePicker, DatePickerProps } from './DatePicker';
import styles from './DatePicker.module.scss';

// Each test opens the MUI calendar popper and drives real transitions (~1s isolated). In a full parallel
// spec run that exceeds the 5s default, so this file gets a longer per-test timeout.
vi.setConfig({ testTimeout: 20_000 });

/**
 * Helpers
 * ---------------------------------------------------------------------------------------------------------------------
 */
const BIDI_CHARS = /[⁦-⁩‎‏]/g;
const stripBidi = (value: string) => value.replace(BIDI_CHARS, '');

// Local-time timestamps (ms) so the tests are timezone independent.
const ms = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min).getTime();
const seconds = (y: number, m: number, d: number) => Math.floor(ms(y, m, d) / 1000);
const MARCH_15_2024 = ms(2024, 3, 15);
const MARCH_20_2024 = ms(2024, 3, 20);

const getInput = (container: HTMLElement) => {
  const input = serializedDateInput(container);
  expect(input).not.toBeNull();
  return input as HTMLInputElement;
};
const readInputValue = (container: HTMLElement) => stripBidi(getInput(container).value);

// MUI renders the required asterisk as "&thinsp;*": normalise whitespace
const getLabelText = () => document.querySelector('label')?.textContent?.replace(/\s/g, ' ');

const queryCalendar = () => screen.queryByRole('dialog');
const getCalendar = () => screen.getByRole('dialog');
const getDay = (day: number) => within(getCalendar()).getByRole('gridcell', { name: String(day) }) as HTMLButtonElement;
const getMonthLabel = () => within(getCalendar()).getByText(/^[A-Z][a-z]+ \d{4}$/).textContent;

const openCalendar = async (container: HTMLElement) => {
  await userEvent.click(container.querySelector('[role="group"]')!);
  await waitFor(() => expect(queryCalendar()).not.toBeNull());
};
const expectCalendarClosed = () => waitFor(() => expect(queryCalendar()).toBeNull());

/** Parent that keeps the value in state, the way every real consumer uses the picker. */
const ControlledDatePicker = ({
  initialValue,
  spy,
  ...rest
}: Omit<DatePickerProps, 'onChange' | 'value' | 'locale'> & {
  locale?: string;
  initialValue?: number;
  spy: (value: number | null | undefined) => void;
}) => {
  const [value, setValue] = useState<number | null | undefined>(initialValue);
  return (
    <DatePicker
      locale={'en_US'}
      {...rest}
      value={value ?? undefined}
      onChange={(next) => {
        spy(next);
        setValue(next);
      }}
    />
  );
};

const describePayload = (value: unknown) => {
  if (typeof value === 'number') return Number.isNaN(value) ? 'NaN' : 'number';
  return value === null ? 'null' : typeof value;
};

afterEach(() => {
  OverlayStackingService.__resetForTests();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/**
 * Rendering
 * ---------------------------------------------------------------------------------------------------------------------
 */
describe('DatePicker contract: rendering', () => {
  test('renders a single text input with autocomplete disabled and the calendar closed', () => {
    const { container } = render(<DatePicker locale={'en_US'} />);

    const input = getInput(container);
    expect(container.querySelectorAll('input')).toHaveLength(1);
    expect(input).toHaveAttribute('autocomplete', 'off');
    expect(queryCalendar()).toBeNull();
  });

  // Pickers v5 renders a masked `type="tel"` input. v6+ field uses inputMode instead; decide whether the change
  // of mobile keyboard is acceptable when this goes red.
  test('[v5-quirk] input is rendered as type="tel" (numeric keyboard on mobile)', () => {
    // Baseline characterization: not a promised contract.
    const { container } = render(<DatePicker locale={'en_US'} />);
    expect(dateSection(getInput(container))).toHaveAttribute('inputmode', 'numeric');
  });

  test('renders the Vanguard calendar icon next to the input (not the MUI open-picker button)', async () => {
    const { container } = render(<DatePicker locale={'en_US'} />);

    // Vanguard Icon renders (asynchronously) an svg with role="figure"
    await waitFor(() => expect(container.querySelectorAll('svg[role="figure"]')).toHaveLength(1));
    // MUI's own adornment (InputProps) is deleted in renderInput: no "Choose date" button
    expect(screen.queryByRole('button', { name: /choose date/i })).toBeNull();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  test('[bug-lock] clicking the Vanguard calendar icon does not open the calendar', async () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR (suspected bug): the icon is a decorative sibling of the field with no click handler.
    const { container } = render(<DatePicker locale={'en_US'} />);
    await waitFor(() => expect(container.querySelector('svg[role="figure"]')).not.toBeNull());

    await userEvent.click(container.querySelector('svg[role="figure"]') as SVGElement);

    expect(queryCalendar()).toBeNull();
  });

  test('label is rendered with the "Optional" suffix when not required', () => {
    render(<DatePicker locale={'en_US'} label={'Start date'} />);

    const label = document.querySelector('label');
    expect(label).not.toBeNull();
    expect(label?.textContent).toBe('Start dateOptional');
  });

  test('required: no "Optional" suffix, asterisk in label, input has the required attribute', () => {
    const { container } = render(<DatePicker locale={'en_US'} label={'Start date'} required={true} />);

    expect(getLabelText()).toBe('Start date *');
    expect(getInput(container)).toBeRequired();
  });

  test('without label no <label> is rendered', () => {
    render(<DatePicker locale={'en_US'} />);
    expect(document.querySelector('label')).toBeNull();
  });
});

/**
 * Locale -> display format
 * ---------------------------------------------------------------------------------------------------------------------
 */
describe('DatePicker contract: locale format pattern', () => {
  // getDatePatternFromLocale keys are underscore locales (en_US). value = 15 March 2024 (ms).
  const LOCALE_PLACEHOLDERS = [
    ['en_US', 'mm/dd/yyyy'],
    ['en_GB', 'dd/mm/yyyy'],
    ['de_DE', 'dd.mm.yyyy'],
    ['nl_NL', 'dd-mm-yyyy'],
    ['pl_PL', 'yyyy-mm-dd'],
    ['ja_JP', 'yyyy/mm/dd'],
  ];

  test.each([
    ['en_US', '03/15/2024', 'mm/dd/yyyy'],
    ['en_GB', '15/03/2024', 'dd/mm/yyyy'],
    ['de_DE', '15.03.2024', 'dd.mm.yyyy'],
    ['de_AT', '15.03.2024', 'dd.mm.yyyy'],
    ['fr_FR', '15/03/2024', 'dd/mm/yyyy'],
    ['nl_NL', '15-03-2024', 'dd-mm-yyyy'],
    ['es_ES', '15/03/2024', 'dd/mm/yyyy'],
    ['it_IT', '15/03/2024', 'dd/mm/yyyy'],
    ['pl_PL', '2024-03-15', 'yyyy-mm-dd'],
    ['pt_PT', '15/03/2024', 'dd/mm/yyyy'],
    ['ja_JP', '2024/03/15', 'yyyy/mm/dd'],
    ['id_ID', '15/03/2024', 'dd/mm/yyyy'],
    ['fi_FI', '15.03.2024', 'dd.mm.yyyy'],
    ['sk_SK', '15.03.2024', 'dd.mm.yyyy'],
    ['sv_SE', '2024-03-15', 'yyyy-mm-dd'],
    ['cs_CZ', '15.03.2024', 'dd.mm.yyyy'],
    ['el_GR', '15/03/2024', 'dd/mm/yyyy'],
  ])('%s shows %s', (locale, expectedValue) => {
    const { container } = render(<DatePicker locale={locale} value={MARCH_15_2024} />);

    expect(readInputValue(container)).toBe(expectedValue);
  });

  test.each(LOCALE_PLACEHOLDERS)(
    '[v5-quirk] %s empty field placeholder is the lower-case pattern %s',
    (locale, placeholder) => {
      // Baseline characterization: not a promised contract.
      // CURRENT BEHAVIOUR: pickers v5 derives a lower-case placeholder from the format. v6+ uses the section
      // placeholders (e.g. "MM/DD/YYYY"); decide whether that is acceptable when this goes red.
      const { container } = render(<DatePicker locale={locale} />);
      expect(container.querySelector('[role="group"]')?.textContent?.toLowerCase()).toContain(placeholder);
    },
  );

  test.each(['en-US', 'de-DE', 'fr-FR', 'en-GB', 'xx_XX'])(
    // CURRENT BEHAVIOUR (suspected bug): BCP-47 hyphen locales (as used by the stories and the redux app
    // store, e.g. "de-DE") are not keys of getDatePatternFromLocale, so every one of them falls back to
    // DD.MM.YYYY and logs a console.error.
    '[bug-lock] %s (not in the pattern map) falls back to DD.MM.YYYY and logs an error',
    (locale) => {
      // Baseline characterization: not a promised contract.
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { container } = render(<DatePicker locale={locale} value={MARCH_15_2024} />);

      expect(readInputValue(container)).toBe('15.03.2024');
      expect(error).toHaveBeenCalledWith('ERROR | getDatePatternFromLocale | Details: locale not found ', locale);
    },
  );
});

/**
 * Value prop
 * ---------------------------------------------------------------------------------------------------------------------
 */
describe('DatePicker contract: value', () => {
  test('value is interpreted as a millisecond timestamp', () => {
    const { container } = render(<DatePicker locale={'en_US'} value={ms(2024, 3, 15, 13, 45)} />);
    expect(readInputValue(container)).toBe('03/15/2024');
  });

  test('[bug-lock] a unix-seconds value is NOT normalised (only minDate/maxDate are)', () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR (suspected bug): `value` goes to MUI as-is, so a 10-digit unix-seconds timestamp is read
    // as milliseconds and lands in January 1970. minDate/maxDate accept both seconds and ms.
    const { container } = render(<DatePicker locale={'en_US'} value={seconds(2024, 3, 15)} />);
    expect(readInputValue(container)).toBe('01/20/1970');
  });

  test.each([
    ['undefined', undefined],
    ['null', null as unknown as number],
  ])('%s value renders an empty, valid input', (_name, value) => {
    const { container } = render(<DatePicker locale={'en_US'} value={value} />);

    expect(readInputValue(container)).toBe('');
    expect(getInput(container)).toHaveAttribute('aria-invalid', 'false');
  });

  test('invalid value (NaN) renders an empty input flagged aria-invalid', () => {
    const { container } = render(<DatePicker locale={'en_US'} value={NaN} />);

    expect(readInputValue(container)).toBe('');
    expect(getInput(container)).toHaveAttribute('aria-invalid', 'true');
  });

  test('a new value prop re-renders the displayed date', () => {
    const { container, rerender } = render(<DatePicker locale={'en_US'} value={MARCH_15_2024} />);
    expect(readInputValue(container)).toBe('03/15/2024');

    rerender(<DatePicker locale={'en_US'} value={MARCH_20_2024} />);
    expect(readInputValue(container)).toBe('03/20/2024');

    rerender(<DatePicker locale={'en_US'} value={undefined} />);
    expect(readInputValue(container)).toBe('');
  });

  test('[bug-lock] the picker is fully controlled: without a parent updating `value` the input keeps the old date', async () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR (suspected bug): the component keeps an `internalValue` state, but MUI's renderInput params
    // override it, so picking a day without feeding `value` back changes nothing on screen.
    const onChange = vi.fn();
    const { container } = render(<DatePicker locale={'en_US'} value={MARCH_15_2024} onChange={onChange} />);

    await openCalendar(container);
    await userEvent.click(getDay(20));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(MARCH_20_2024);
    expect(readInputValue(container)).toBe('03/15/2024');
  });
});

/**
 * onChange payloads
 * ---------------------------------------------------------------------------------------------------------------------
 */
describe('DatePicker contract: onChange payload', () => {
  test('picking a day emits a millisecond timestamp (moment.valueOf()) and keeps the time of the current value', async () => {
    const spy = vi.fn();
    const { container } = render(<ControlledDatePicker spy={spy} initialValue={ms(2024, 3, 15, 10, 30)} />);

    await openCalendar(container);
    await userEvent.click(getDay(20));

    expect(spy).toHaveBeenCalledTimes(1);
    const [payload] = spy.mock.calls[0];
    expect(typeof payload).toBe('number');
    expect(String(payload)).toHaveLength(13);
    expect(payload).toBe(ms(2024, 3, 20, 10, 30));
    expect(readInputValue(container)).toBe('03/20/2024');
  });

  test('picking a day with no value emits local midnight of that day (not "now" time)', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2024, 2, 15, 10, 30, 0));
    const spy = vi.fn();
    const { container } = render(<ControlledDatePicker spy={spy} />);

    await openCalendar(container);
    // calendar opens on the current month when there is no value
    expect(getMonthLabel()).toBe('March 2024');
    await userEvent.click(getDay(20));

    expect(spy.mock.calls).toEqual([[MARCH_20_2024]]);
    expect(readInputValue(container)).toBe('03/20/2024');
  });

  test('typing a full date emits the ms timestamp of local midnight as the last payload', () => {
    const spy = vi.fn();
    const { container } = render(<ControlledDatePicker spy={spy} />);

    pasteDate(getInput(container), '03/20/2024');

    expect(spy.mock.calls.at(-1)?.[0]).toBe(MARCH_20_2024);
    expect(readInputValue(container)).toBe('03/20/2024');
    expect(getInput(container)).toHaveAttribute('aria-invalid', 'false');
    // typing does not open the calendar
    expect(queryCalendar()).toBeNull();
  });

  test('[v5-quirk] typing a full date: NaN for every incomplete keystroke, 8 calls for 10 keys', () => {
    // Baseline characterization: not a promised contract.
    const spy = vi.fn();
    const { container } = render(<ControlledDatePicker spy={spy} />);

    editDateSection(getInput(container), 0, '0');
    editDateSection(getInput(container), 0, '3');
    editDateSection(getInput(container), 1, '2');
    editDateSection(getInput(container), 1, '0');
    editDateSection(getInput(container), 2, '2');
    editDateSection(getInput(container), 2, '0');
    editDateSection(getInput(container), 2, '2');
    editDateSection(getInput(container), 2, '4');

    // CURRENT BEHAVIOUR: pickers v5 masked input calls onChange per accepted keystroke with an invalid moment
    // (valueOf() === NaN) until the date is complete. The mask inserts the "/" itself, so 8 calls for 10 keys.
    // v6 changes the per-keystroke semantics, v8 emits null for partial dates.
    const payloads = spy.mock.calls.map(([value]) => describePayload(value));
    expect(payloads).toEqual(['NaN', 'NaN', 'NaN', 'NaN', 'number', 'number', 'number', 'number']);
  });

  test.each([
    ['de_DE', '20.03.2024', '20.03.2024'],
    ['en_GB', '20032024', '20/03/2024'],
    ['fr_FR', '20/03/2024', '20/03/2024'],
  ])('typing in %s (%s) emits the same ms timestamp and shows %s', (locale, keys, shown) => {
    const spy = vi.fn();
    const { container } = render(<ControlledDatePicker spy={spy} locale={locale} />);

    pasteDate(getInput(container), shown);

    expect(spy.mock.calls.at(-1)?.[0]).toBe(MARCH_20_2024);
    expect(readInputValue(container)).toBe(shown);
  });

  test('[v5-quirk] typing a partial date emits NaN (invalid moment) and keeps the partial text', () => {
    // Baseline characterization: not a promised contract.
    const spy = vi.fn();
    const { container } = render(<ControlledDatePicker spy={spy} />);

    editDateSection(getInput(container), 0, '03');
    editDateSection(getInput(container), 1, '20');

    // CURRENT BEHAVIOUR: partial date -> onChange(NaN). Pickers v8 keeps partial dates as null.
    expect(spy).toHaveBeenCalled();
    spy.mock.calls.forEach(([value]) => { expect(describePayload(value)).toBe('NaN'); });
    expect(readInputValue(container)).toBe('03/20/YYYY');
  });

  test('typing an impossible date keeps the text and marks the input aria-invalid', () => {
    const spy = vi.fn();
    const { container } = render(<ControlledDatePicker spy={spy} />);

    editDateSection(getInput(container), 0, '02');
    editDateSection(getInput(container), 1, '31');
    editDateSection(getInput(container), 2, '2024');

    expect(readInputValue(container)).toBe('02/31/2024');
    expect(getInput(container)).toHaveAttribute('aria-invalid', 'true');
  });

  test('[v5-quirk] typing an impossible date emits NaN on every keystroke', () => {
    // Baseline characterization: not a promised contract.
    const spy = vi.fn();
    const { container } = render(<ControlledDatePicker spy={spy} />);

    editDateSection(getInput(container), 0, '02');
    editDateSection(getInput(container), 1, '31');
    editDateSection(getInput(container), 2, '2024');

    expect(spy).toHaveBeenCalled();
    spy.mock.calls.forEach(([value]) => { expect(describePayload(value)).toBe('NaN'); });
  });

  test('[v5-quirk] deleting one character of a complete date emits NaN', () => {
    // Baseline characterization: not a promised contract.
    const spy = vi.fn();
    const { container } = render(<ControlledDatePicker spy={spy} initialValue={MARCH_20_2024} />);

    fireEvent.focus(dateSection(getInput(container), 2));
    fireEvent.keyDown(dateSection(getInput(container), 2), { key: 'Delete' });

    expect(spy.mock.calls.map(([value]) => describePayload(value))).toEqual(['undefined']);
    expect(readInputValue(container)).toBe('');
  });

  test('clearing the input emits undefined (null?.valueOf()), not null', () => {
    const spy = vi.fn();
    const { container } = render(<ControlledDatePicker spy={spy} initialValue={MARCH_20_2024} />);

    clearDate(getInput(container));

    expect(spy.mock.calls.map(([value]) => describePayload(value))).toEqual(['undefined']);
    expect(readInputValue(container)).toBe('');
  });

  test('without onChange, picking a day does not throw and closes the calendar', async () => {
    const { container } = render(<DatePicker locale={'en_US'} value={MARCH_15_2024} />);

    await openCalendar(container);
    await userEvent.click(getDay(20));
    await expectCalendarClosed();
  });
});

/**
 * Open / close
 * ---------------------------------------------------------------------------------------------------------------------
 */
describe('DatePicker contract: open / close', () => {
  test('click on the input opens the calendar in a portal outside the component, on the month of the value', async () => {
    const { container } = render(<DatePicker locale={'en_US'} value={MARCH_15_2024} />);

    await openCalendar(container);

    const calendar = getCalendar();
    expect(container.contains(calendar)).toBe(false);
    expect(document.body.contains(calendar)).toBe(true);
    expect(getMonthLabel()).toBe('March 2024');
    expect(getDay(15)).toHaveAttribute('aria-selected', 'true');
    expect(getDay(14)).toHaveAttribute('aria-selected', 'false');
  });

  test('click anywhere on the field wrapper (not only the <input>) opens the calendar', async () => {
    const { container } = render(<DatePicker locale={'en_US'} label={'Pick'} />);

    // .vanguard-input is Vanguard's own InputBase wrapper that carries the onClick
    await userEvent.click(container.querySelector('[role="group"]') as HTMLElement);
    await waitFor(() => expect(queryCalendar()).not.toBeNull());
  });

  test('calendar popper requests placement bottom-end', async () => {
    const { container } = render(<DatePicker locale={'en_US'} />);
    await openCalendar(container);

    // popper.js writes the resolved placement on the popper root
    expect(getCalendar()).toHaveAttribute('data-popper-placement', 'bottom-end');
  });

  test('calendar paper carries the Vanguard paper class (shadow + radius)', async () => {
    const { container } = render(<DatePicker locale={'en_US'} />);
    await openCalendar(container);

    expect(getCalendar().querySelector(`.${styles.paper}`)).not.toBeNull();
  });

  test('field is shown as focused while the calendar is open and not focused once it closes', async () => {
    const { container } = render(<DatePicker locale={'en_US'} value={MARCH_15_2024} />);
    // .Mui-focused drives the focused outline in InputBase.scss:40 (production dependency)
    const isFieldFocused = () => !!container.querySelector('.Mui-focused');

    expect(isFieldFocused()).toBe(false);
    await openCalendar(container);
    // focus moved into the calendar, yet the field still renders focused (renderInput forces focused=isOpen)
    expect(container.contains(document.activeElement)).toBe(false);
    expect(isFieldFocused()).toBe(true);

    await userEvent.keyboard('{Escape}');
    await expectCalendarClosed();
    expect(container.querySelector('[role="group"]')?.contains(document.activeElement)).toBe(true);
    expect(isFieldFocused()).toBe(true);
    await userEvent.click(document.body);
    expect(isFieldFocused()).toBe(false);
  });

  test('Escape closes the calendar without emitting onChange', async () => {
    const onChange = vi.fn();
    const { container } = render(<DatePicker locale={'en_US'} value={MARCH_15_2024} onChange={onChange} />);

    await openCalendar(container);
    await userEvent.keyboard('{Escape}');

    await expectCalendarClosed();
    expect(onChange).not.toHaveBeenCalled();
  });

  test('selecting a day closes the calendar', async () => {
    const spy = vi.fn();
    const { container } = render(<ControlledDatePicker spy={spy} initialValue={MARCH_15_2024} />);

    await openCalendar(container);
    await userEvent.click(getDay(20));

    await expectCalendarClosed();
  });

  test('month arrows navigate without emitting onChange or closing', async () => {
    const onChange = vi.fn();
    const { container } = render(<DatePicker locale={'en_US'} value={MARCH_15_2024} onChange={onChange} />);
    await openCalendar(container);

    await userEvent.click(screen.getByRole('button', { name: 'Next month' }));
    await waitFor(() => expect(getMonthLabel()).toBe('April 2024'));

    await userEvent.click(screen.getByRole('button', { name: 'Previous month' }));
    await userEvent.click(screen.getByRole('button', { name: 'Previous month' }));
    await waitFor(() => expect(getMonthLabel()).toBe('February 2024'));

    expect(onChange).not.toHaveBeenCalled();
    expect(queryCalendar()).not.toBeNull();
  });

  test('[v5-quirk] year view: picking a year emits onChange immediately and stays open on the day view', async () => {
    // Baseline characterization: not a promised contract.
    const spy = vi.fn();
    const { container } = render(<ControlledDatePicker spy={spy} initialValue={MARCH_15_2024} />);
    await openCalendar(container);

    await userEvent.click(screen.getByRole('button', { name: /switch to year view/i }));
    await userEvent.click(await screen.findByRole('button', { name: '2026' }));

    // CURRENT BEHAVIOUR: v5 commits the year as a partial selection (same day/month, new year).
    expect(spy.mock.calls).toEqual([[ms(2026, 3, 15)]]);
    expect(queryCalendar()).not.toBeNull();
    await waitFor(() => expect(getMonthLabel()).toBe('March 2026'));
  });
});

/**
 * Overlay stacking
 * ---------------------------------------------------------------------------------------------------------------------
 */
describe('DatePicker contract: overlay stacking (OverlayStackingService)', () => {
  const zIndexOf = (el: HTMLElement) => Number(getComputedStyle(el).zIndex);

  test('registers a popover slot on open and applies it as the popper z-index', async () => {
    const { container } = render(<DatePicker locale={'en_US'} />);
    expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(OVERLAY_BASE_Z_INDEX);

    await openCalendar(container);

    expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(OVERLAY_BASE_Z_INDEX + 1);
    expect(zIndexOf(getCalendar())).toBe(OVERLAY_BASE_Z_INDEX + 1);
  });

  test('stacks above a modal that raised the stacking floor', async () => {
    const hostModalZIndex = OverlayStackingService.register('host-modal', 'modal', 2147483004);
    const { container } = render(<DatePicker locale={'en_US'} />);

    await openCalendar(container);

    expect(zIndexOf(getCalendar())).toBeGreaterThan(hostModalZIndex);
  });

  test('unregisters on close (Escape) and on close by day selection', async () => {
    const spy = vi.fn();
    const { container } = render(<ControlledDatePicker spy={spy} initialValue={MARCH_15_2024} />);

    await openCalendar(container);
    await userEvent.keyboard('{Escape}');
    await expectCalendarClosed();
    expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(OVERLAY_BASE_Z_INDEX);

    await openCalendar(container);
    expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(OVERLAY_BASE_Z_INDEX + 1);
    await userEvent.click(getDay(20));
    await expectCalendarClosed();
    expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(OVERLAY_BASE_Z_INDEX);
  });

  test('unregisters when unmounted while open', async () => {
    const { container, unmount } = render(<DatePicker locale={'en_US'} />);
    await openCalendar(container);
    expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(OVERLAY_BASE_Z_INDEX + 1);

    unmount();

    expect(OverlayStackingService.getTopmostZIndex()).toBe(OVERLAY_BASE_Z_INDEX);
    expect(OverlayStackingService.register('after', 'modal')).toBe(OVERLAY_BASE_Z_INDEX + 1);
  });
});

/**
 * minDate / maxDate / disablePast
 * ---------------------------------------------------------------------------------------------------------------------
 */
describe('DatePicker contract: minDate / maxDate / disablePast', () => {
  test.each([
    ['unix seconds', seconds(2024, 3, 10), seconds(2024, 3, 20)],
    ['milliseconds (13 digits, normalised)', ms(2024, 3, 10), ms(2024, 3, 20)],
  ])('min/max as %s disable the days outside the range', async (_name, minDate, maxDate) => {
    const { container } = render(
      <DatePicker locale={'en_US'} value={MARCH_15_2024} minDate={minDate} maxDate={maxDate} />,
    );
    await openCalendar(container);

    expect(getDay(9)).toBeDisabled();
    expect(getDay(10)).toBeEnabled();
    expect(getDay(15)).toBeEnabled();
    expect(getDay(20)).toBeEnabled();
    expect(getDay(21)).toBeDisabled();
    // the month arrows cannot leave the allowed range
    expect(screen.getByRole('button', { name: 'Previous month' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next month' })).toBeDisabled();
  });

  test.each([
    ['0', 0],
    ['NaN', NaN],
  ])('minDate/maxDate = %s means "no limit"', async (_name, limit) => {
    const { container } = render(<DatePicker locale={'en_US'} value={MARCH_15_2024} minDate={limit} maxDate={limit} />);
    await openCalendar(container);

    expect(getDay(1)).toBeEnabled();
    expect(getDay(31)).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Previous month' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Next month' })).toBeEnabled();
  });

  test('clicking a disabled day does not emit onChange and keeps the calendar open', async () => {
    const onChange = vi.fn();
    const { container } = render(
      <DatePicker locale={'en_US'} value={MARCH_15_2024} maxDate={seconds(2024, 3, 20)} onChange={onChange} />,
    );
    await openCalendar(container);

    // disabled days have pointer-events: none; force the click to prove nothing happens
    await userEvent.setup({ pointerEventsCheck: 0 }).click(getDay(25));

    expect(onChange).not.toHaveBeenCalled();
    expect(queryCalendar()).not.toBeNull();
  });

  test('[v5-quirk] typing a date after maxDate still emits it, and flags the input aria-invalid', () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR: min/max only validate; a typed out-of-range date reaches the consumer unchanged.
    const spy = vi.fn();
    const { container } = render(<ControlledDatePicker spy={spy} maxDate={seconds(2024, 3, 10)} />);

    editDateSection(getInput(container), 0, '0');
    editDateSection(getInput(container), 0, '3');
    editDateSection(getInput(container), 1, '2');
    editDateSection(getInput(container), 1, '0');
    editDateSection(getInput(container), 2, '2');
    editDateSection(getInput(container), 2, '0');
    editDateSection(getInput(container), 2, '2');
    editDateSection(getInput(container), 2, '4');

    expect(spy.mock.calls.at(-1)?.[0]).toBe(MARCH_20_2024);
    expect(getInput(container)).toHaveAttribute('aria-invalid', 'true');
  });

  test('[v5-quirk] typing a date before minDate still emits it, and flags the input aria-invalid', () => {
    // Baseline characterization: not a promised contract.
    const spy = vi.fn();
    const { container } = render(<ControlledDatePicker spy={spy} minDate={ms(2024, 4, 1)} />);

    editDateSection(getInput(container), 0, '0');
    editDateSection(getInput(container), 0, '3');
    editDateSection(getInput(container), 1, '2');
    editDateSection(getInput(container), 1, '0');
    editDateSection(getInput(container), 2, '2');
    editDateSection(getInput(container), 2, '0');
    editDateSection(getInput(container), 2, '2');
    editDateSection(getInput(container), 2, '4');

    expect(spy.mock.calls.at(-1)?.[0]).toBe(MARCH_20_2024);
    expect(getInput(container)).toHaveAttribute('aria-invalid', 'true');
  });

  test('disablePast disables the days before today (frozen clock) and the previous-month arrow', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2024, 2, 15, 12, 0, 0));
    const { container } = render(<DatePicker locale={'en_US'} disablePast={true} />);

    await openCalendar(container);

    expect(getMonthLabel()).toBe('March 2024');
    expect(getDay(1)).toBeDisabled();
    expect(getDay(14)).toBeDisabled();
    expect(getDay(15)).toBeEnabled();
    expect(getDay(16)).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Previous month' })).toBeDisabled();
  });

  test('a past value with disablePast is shown but flagged aria-invalid', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2024, 2, 15, 12, 0, 0));
    const { container } = render(<DatePicker locale={'en_US'} disablePast={true} value={ms(2024, 3, 1)} />);

    expect(readInputValue(container)).toBe('03/01/2024');
    expect(getInput(container)).toHaveAttribute('aria-invalid', 'true');
  });
});

/**
 * formconfig
 * ---------------------------------------------------------------------------------------------------------------------
 */
describe('DatePicker contract: formconfig', () => {
  test('error from formconfig renders the error message; required comes from formconfig.validation', () => {
    const formconfig = {
      hasError: true,
      errors: ['Field is required'],
      validation: { required: true },
      _inputRef: { current: null },
    };
    const { container } = render(<DatePicker locale={'en_US'} label={'Start date'} formconfig={formconfig} />);

    expect(screen.getByTestId('vanguard-input-error-text')).toHaveTextContent('Field is required');
    expect(getLabelText()).toBe('Start date *');
    expect(getInput(container)).toBeRequired();
  });

  test('[bug-lock] formconfig error is NOT reflected as aria-invalid (MUI validation state wins)', () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR (suspected bug): renderInput params (error=false for a valid/empty date) are spread over
    // Vanguard's `error={hasError}`, so the field is not marked invalid although the error text is shown.
    const formconfig = { hasError: true, errors: ['Field is required'], _inputRef: { current: null } };
    const { container } = render(<DatePicker locale={'en_US'} formconfig={formconfig} />);

    expect(getInput(container)).toHaveAttribute('aria-invalid', 'false');
  });

  test('[bug-lock] formconfig._inputRef is NOT bound to the input (MUI inputRef wins)', () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR (suspected bug): params.inputRef overrides InputBase's formconfig._inputRef, so form
    // helpers that read `_inputRef.current.value` see null for a DatePicker field.
    const formconfig = { _inputRef: { current: null } };
    render(<DatePicker locale={'en_US'} value={MARCH_15_2024} formconfig={formconfig} />);

    expect(formconfig._inputRef.current).toBeNull();
  });

  test('without formconfig error no error text is rendered', () => {
    render(<DatePicker locale={'en_US'} formconfig={{ _inputRef: { current: null } }} />);
    expect(screen.queryByTestId('vanguard-input-error-text')).toBeNull();
  });
});

/**
 * closeOnCLickAway
 * ---------------------------------------------------------------------------------------------------------------------
 * Vanguard listens to `mousedown` on document; MUI's own popper listens to `click`. The allow-list in DatePicker.tsx
 * relies on MUI pickers v5 class names (.MuiCalendarPicker-root, .MuiPickersCalendarHeader-root, .MuiPickersDay-root,
 * .MuiPickersArrowSwitcher-root, .MuiDayPicker-weekContainer) which are renamed in v6 / v9. The tests below press
 * the mouse on each of those regions, so a rename turns them red.
 */
describe('DatePicker contract: closeOnCLickAway', () => {
  const renderWithOutside = (props: Partial<DatePickerProps> = {}) =>
    render(
      <div>
        <button type={'button'}>{'outside'}</button>
        <DatePicker locale={'en_US'} value={MARCH_15_2024} {...props} />
      </div>,
    );
  const mouseDown = async (el: Element) => {
    await act(() => {
      fireEvent.mouseDown(el);
    });
  };

  test('false (default): mousedown outside keeps the calendar open', async () => {
    const { container } = renderWithOutside();
    await openCalendar(container);

    await mouseDown(screen.getByText('outside'));

    expect(queryCalendar()).not.toBeNull();
  });

  test('[v5-quirk] false (default): a full click outside still closes it (MUI popper click-away)', async () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR: closeOnCLickAway=false does not make the calendar "sticky"; MUI closes on click outside.
    const { container } = renderWithOutside();
    await openCalendar(container);

    await userEvent.click(screen.getByText('outside'));

    await expectCalendarClosed();
    expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(OVERLAY_BASE_Z_INDEX);
  });

  test('true: mousedown outside closes the calendar and releases the stacking slot', async () => {
    const { container } = renderWithOutside({ closeOnCLickAway: true });
    await openCalendar(container);

    await mouseDown(screen.getByText('outside'));

    await expectCalendarClosed();
    expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(OVERLAY_BASE_Z_INDEX);
  });

  test('true: mousedown on the input (inside the component) keeps it open', async () => {
    const { container } = renderWithOutside({ closeOnCLickAway: true });
    await openCalendar(container);

    await mouseDown(getInput(container));

    expect(queryCalendar()).not.toBeNull();
  });

  // region -> how to reach it through the accessible DOM. Comment = allow-listed MUI v5 class it relies on.
  test.each([
    // .MuiPickersDay-root (renamed .MuiPickerDay-root in v9)
    ['a day', () => getDay(20)],
    // .MuiPickersCalendarHeader-root
    ['the month label in the header', () => within(getCalendar()).getByText('March 2024')],
    // .MuiPickersArrowSwitcher-root
    ['the next-month arrow', () => screen.getByRole('button', { name: 'Next month' })],
    // .MuiDayPicker-weekContainer (renamed .MuiDayCalendar-weekContainer in v6)
    ['a week row', () => within(getCalendar()).getAllByRole('row')[1]],
    // .MuiCalendarPicker-root (renamed .MuiDateCalendar-root in v6)
    ['a weekday column header', () => within(getCalendar()).getAllByRole('columnheader')[0]],
    // .MuiCalendarPicker-root (renamed .MuiDateCalendar-root in v6)
    ['the day grid', () => within(getCalendar()).getByRole('grid')],
  ])('true: mousedown on %s keeps the calendar open', async (_region, getTarget) => {
    const { container } = renderWithOutside({ closeOnCLickAway: true });
    await openCalendar(container);

    await mouseDown(getTarget());

    expect(queryCalendar()).not.toBeNull();
    expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(OVERLAY_BASE_Z_INDEX + 1);
  });

  test('true: mousedown on a year in the year view keeps the calendar open', async () => {
    const { container } = renderWithOutside({ closeOnCLickAway: true });
    await openCalendar(container);
    await userEvent.click(screen.getByRole('button', { name: /switch to year view/i }));

    // year list lives inside .MuiCalendarPicker-root in v5
    await mouseDown(await screen.findByRole('button', { name: '2026' }));

    expect(queryCalendar()).not.toBeNull();
  });

  test('[bug-lock] true: mousedown on the paper outside the allow-listed regions closes the calendar', async () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR (suspected bug): the paper padding is not on the allow-list, so pressing on it closes.
    const { container } = renderWithOutside({ closeOnCLickAway: true });
    await openCalendar(container);

    await mouseDown(getCalendar().querySelector(`.${styles.paper}`) as HTMLElement);

    await expectCalendarClosed();
  });

  test('true: picking a day still selects and closes', async () => {
    const onChange = vi.fn();
    const { container } = renderWithOutside({ closeOnCLickAway: true, onChange });
    await openCalendar(container);

    await userEvent.click(getDay(20));

    expect(onChange).toHaveBeenCalledWith(MARCH_20_2024);
    await expectCalendarClosed();
  });
});

/**
 * Mobile variant
 * ---------------------------------------------------------------------------------------------------------------------
 * The responsive MUI v5 DatePicker renders DesktopDatePicker or MobileDatePicker from
 * `useMediaQuery('@media (pointer: fine)', { defaultMatches: true })`
 * (node_modules/@mui/x-date-pickers/DatePicker/DatePicker.js:30-39). jsdom has no matchMedia, so every other test
 * runs the desktop branch. Here `window.matchMedia` is stubbed so `(pointer: fine)` does NOT match (touch device)
 * and the real mobile branch renders. Pickers v8 changes the closeOnSelect defaults: these tests must go red if the
 * mobile accept flow changes.
 */
describe('DatePicker contract: mobile variant (pointer not fine)', () => {
  const originalMatchMedia = window.matchMedia;
  const mediaQueries: string[] = [];

  beforeEach(() => {
    window.matchMedia = ((query: string) => {
      mediaQueries.push(query);
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      };
    }) as unknown as typeof window.matchMedia;
  });
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    mediaQueries.length = 0;
  });

  const openDialog = async (container: HTMLElement) => {
    await userEvent.click(container.querySelector('[role="group"]')!);
    return screen.findByRole('dialog');
  };
  const pickMobileDay = (dialog: HTMLElement, day: number) =>
    userEvent.click(within(dialog).getByRole('gridcell', { name: String(day) }));
  /** the portal root (direct child of <body>) that holds the dialog */
  const portalRootOf = (el: HTMLElement) => {
    let node = el;
    while (node.parentElement && node.parentElement !== document.body) node = node.parentElement;
    return node;
  };
  const renderMobile = (initialValue: number | undefined = MARCH_15_2024) => {
    const spy = vi.fn();
    const utils = render(
      <div>
        <button type={'button'}>{'outside'}</button>
        <ControlledDatePicker spy={spy} initialValue={initialValue} />
      </div>,
    );
    return { spy, ...utils };
  };

  test('click on the input opens a modal dialog (portal) with Cancel and OK, on the month of the value', async () => {
    const { container } = renderMobile();
    // stub sanity: the responsive picker asked for the desktop media query
    expect.soft(mediaQueries).toContain('(pointer: fine)');
    expect(queryCalendar()).toBeNull();

    const dialog = await openDialog(container);

    expect(container.contains(dialog)).toBe(false);
    expect(within(dialog).getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'OK' })).toBeInTheDocument();
    expect(within(dialog).getByRole('gridcell', { name: '15' })).toHaveAttribute('aria-selected', 'true');
    expect(within(dialog).getByText('March 2024')).toBeInTheDocument();
  });

  test('[v5-quirk] the field is a read-only text input labelled "Choose date, selected date is ..."', () => {
    // Baseline characterization: not a promised contract.
    const { container } = renderMobile();

    const input = container.querySelector('[role="group"]') as HTMLElement;
    expect(
      within(input)
        .getAllByRole('spinbutton')
        .every((section) => section.getAttribute('aria-readonly') === 'true'),
    ).toBe(true);
    expect(input).toHaveAttribute('role', 'group');
    expect(input).toHaveAccessibleName('Choose date, selected date is Mar 15, 2024');
    expect(readInputValue(container)).toBe('03/15/2024');
  });

  test('[bug-lock] clicking the Vanguard calendar icon does not open the dialog', async () => {
    // Baseline characterization: not a promised contract.
    const { container } = renderMobile();
    await waitFor(() => expect(container.querySelector('svg[role="figure"]')).not.toBeNull());

    await userEvent.click(container.querySelector('svg[role="figure"]') as SVGElement);

    expect(queryCalendar()).toBeNull();
  });

  test('picking a day does not close the dialog (waits for OK)', async () => {
    const { container } = renderMobile();
    const dialog = await openDialog(container);

    await pickMobileDay(dialog, 20);

    expect(queryCalendar()).not.toBeNull();
    expect(within(dialog).getByRole('gridcell', { name: '20' })).toHaveAttribute('aria-selected', 'true');
  });

  test('[v5-quirk] picking a day emits onChange and updates the field before OK is pressed', async () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR: v5 fires onChange on every committed draft; OK only closes.
    const { container, spy } = renderMobile();
    const dialog = await openDialog(container);

    await pickMobileDay(dialog, 20);

    expect(spy.mock.calls).toEqual([[MARCH_20_2024]]);
    expect(readInputValue(container)).toBe('03/20/2024');
  });

  test('OK closes and keeps the picked date (no further onChange)', async () => {
    const { container, spy } = renderMobile();
    const dialog = await openDialog(container);

    await pickMobileDay(dialog, 22);
    await userEvent.click(within(dialog).getByRole('button', { name: 'OK' }));

    await expectCalendarClosed();
    expect(spy.mock.calls).toEqual([[ms(2024, 3, 22)]]);
    expect(readInputValue(container)).toBe('03/22/2024');
  });

  test('Cancel closes and restores the previous value (emitted again)', async () => {
    const { container, spy } = renderMobile();
    const dialog = await openDialog(container);

    await pickMobileDay(dialog, 20);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    await expectCalendarClosed();
    expect(spy.mock.calls).toEqual([[MARCH_20_2024], [MARCH_15_2024]]);
    expect(readInputValue(container)).toBe('03/15/2024');
  });

  test('[v5-quirk] Escape closes and keeps the picked date (no restore)', async () => {
    // Baseline characterization: not a promised contract.
    const { container, spy } = renderMobile();
    const dialog = await openDialog(container);

    await pickMobileDay(dialog, 25);
    await userEvent.keyboard('{Escape}');

    await expectCalendarClosed();
    expect(spy.mock.calls).toEqual([[ms(2024, 3, 25)]]);
    expect(readInputValue(container)).toBe('03/25/2024');
  });

  test('[v5-quirk] backdrop click closes and keeps the picked date (no restore)', async () => {
    // Baseline characterization: not a promised contract.
    const { container, spy } = renderMobile();
    const dialog = await openDialog(container);

    await pickMobileDay(dialog, 26);
    // the modal backdrop is the first child of the portal root
    await userEvent.click(portalRootOf(dialog).firstElementChild as HTMLElement);

    await expectCalendarClosed();
    expect(spy.mock.calls).toEqual([[ms(2024, 3, 26)]]);
    expect(readInputValue(container)).toBe('03/26/2024');
  });

  test('[v5-quirk] keyboard view (pen button) lets the user type a date; only the complete date is emitted', async () => {
    // Baseline characterization: not a promised contract.
    // The mobile keyboard view (toggleMobileKeyboardView) is removed in pickers v6.
    const { container, spy } = renderMobile();
    const dialog = await openDialog(container);

    await userEvent.click(within(dialog).getByRole('button', { name: /go to text input view/ }));
    const typed = serializedDateInput(dialog);
    expect(typed).not.toBeNull();
    pasteDate(typed, '03/27/2024');
    await userEvent.click(within(dialog).getByRole('button', { name: 'OK' }));

    await expectCalendarClosed();
    expect(spy.mock.calls).toEqual([[ms(2024, 3, 27)]]);
    expect(readInputValue(container)).toBe('03/27/2024');
  });

  test('registers a popover stacking slot on open and releases it on OK, Cancel, backdrop and unmount', async () => {
    const { container, unmount } = renderMobile();
    const top = () => OverlayStackingService.getTopmostZIndex('popover');

    let dialog = await openDialog(container);
    expect(top()).toBe(OVERLAY_BASE_Z_INDEX + 1);
    await userEvent.click(within(dialog).getByRole('button', { name: 'OK' }));
    await expectCalendarClosed();
    expect(top()).toBe(OVERLAY_BASE_Z_INDEX);

    dialog = await openDialog(container);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await expectCalendarClosed();
    expect(top()).toBe(OVERLAY_BASE_Z_INDEX);

    dialog = await openDialog(container);
    await userEvent.click(portalRootOf(dialog).firstElementChild as HTMLElement);
    await expectCalendarClosed();
    expect(top()).toBe(OVERLAY_BASE_Z_INDEX);

    await openDialog(container);
    expect(top()).toBe(OVERLAY_BASE_Z_INDEX + 1);
    unmount();
    expect(OverlayStackingService.getTopmostZIndex()).toBe(OVERLAY_BASE_Z_INDEX);
  });

  test("[bug-lock] the dialog keeps MUI's static z-index (1300) and paints behind a raised host modal", async () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR (suspected bug): the registered slot is only applied through PopperProps.sx (desktop);
    // the mobile Dialog ignores it, so inside a modal that raised the stacking floor it paints behind.
    const hostModalZIndex = OverlayStackingService.register('host-modal', 'modal', 2147483004);
    const { container } = renderMobile();

    const dialog = await openDialog(container);

    const zIndex = Number(getComputedStyle(portalRootOf(dialog)).zIndex);
    expect(zIndex).toBe(1300);
    expect(zIndex).toBeLessThan(hostModalZIndex);
  });

  test('[v5-quirk] the Vanguard paper class is not applied to the mobile dialog', async () => {
    // Baseline characterization: not a promised contract.
    // PaperProps only reaches the desktop popper paper.
    const { container } = renderMobile();

    const dialog = await openDialog(container);

    expect(dialog.classList.contains(styles.paper)).toBe(false);
    expect(dialog.querySelector(`.${styles.paper}`)).toBeNull();
  });
});
