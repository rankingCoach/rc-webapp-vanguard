import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { act, fireEvent, render, within } from '@testing-library/react';
import moment, { type Moment } from 'moment';
import React, { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DateCalendarReference, type CalendarFixtureProps } from './_DateCalendar.mui-reference';
import { DateCalendar } from './DateCalendar';
import { createCalendarAdapter } from './calendar-adapter';

type CalendarAdapter = Pick<
  AdapterMoment,
  'addDays' | 'addMonths' | 'addYears' | 'startOfWeek' | 'endOfWeek' | 'getWeekArray' | 'isSameDay'
>;

const date = (iso: string, locale = 'en') => moment(iso, moment.ISO_8601).locale(locale);
const legacyDay = ['MuiPickersDay-root', 'MuiPickersDay-hiddenDaySpacingFiller'];
const utilityClasses = (element: HTMLElement) =>
  [...element.classList].filter((token) => token.startsWith('Mui') && !legacyDay.includes(token));

const calendarSnapshot = (host: HTMLElement) => {
  const root = host.querySelector<HTMLElement>('.MuiDateCalendar-root');
  if (!root) return undefined;
  const selectors = [
    '.MuiDateCalendar-root',
    '.MuiPickersCalendarHeader-root',
    '.MuiPickersCalendarHeader-labelContainer',
    '.MuiPickersCalendarHeader-label',
    '.MuiDateCalendar-viewTransitionContainer',
    '.MuiPickersSlideTransition-root',
    '[role]',
    'button',
  ].join(',');
  const cells = [root, ...root.querySelectorAll<HTMLElement>(selectors)].map((element) => {
    const role = element.getAttribute('role');
    const named = element.getAttribute('aria-labelledby');
    return {
      tag: element.tagName,
      role,
      label: element.getAttribute('aria-label') ?? (named && document.getElementById(named)?.textContent),
      text: element.children.length ? null : element.textContent,
      classes: utilityClasses(element),
      row: element.getAttribute('aria-rowindex'),
      col: element.getAttribute('aria-colindex'),
      rows: element.getAttribute('aria-rowcount'),
      cols: element.getAttribute('aria-colcount'),
      current: element.getAttribute('aria-current'),
      selected: element.getAttribute('aria-selected'),
      checked: element.getAttribute('aria-checked'),
      disabled: element.hasAttribute('disabled'),
      tab: element.getAttribute('tabindex'),
      timestamp: element.getAttribute('data-timestamp'),
    };
  });
  const focus = root.contains(document.activeElement) ? (document.activeElement as HTMLElement) : null;
  return {
    cells,
    focus: focus?.dataset.timestamp ?? focus?.getAttribute('aria-label') ?? focus?.textContent ?? null,
  };
};

const run = (
  Calendar: React.ComponentType<CalendarFixtureProps>,
  props: CalendarFixtureProps,
  actions: (host: HTMLElement, snap: () => void) => void,
) => {
  const trace: Array<ReturnType<typeof calendarSnapshot>> = [];
  const events: unknown[] = [];
  const originalValue = props.value;
  const logDate = (next: Moment | null) =>
    next && {
      identity: next === originalValue,
      value: next.format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
      locale: next.locale(),
    };
  const Stage = () => {
    const [value, setValue] = useState(originalValue);
    return (
      <Calendar
        {...props}
        value={value}
        onChange={(next, ...rest) => {
          events.push(['change', logDate(next), ...rest]);
          setValue(next);
        }}
        onMonthChange={(next) => events.push(['month', logDate(next)])}
        onYearChange={(next) => events.push(['year', logDate(next)])}
        onViewChange={(view) => events.push(['view', view])}
      />
    );
  };
  const mounted = render(<Stage />);
  try {
    const snap = () => trace.push(calendarSnapshot(mounted.container));
    snap();
    actions(mounted.container, snap);
    return { trace, events };
  } finally {
    mounted.unmount();
  }
};

const props: CalendarFixtureProps = {
  locale: 'en',
  reduceAnimations: true,
  value: date('2024-03-15T13:42:56.789'),
  minDate: date('2023-01-01'),
  maxDate: date('2025-12-31'),
};

const day = (host: HTMLElement, iso: string) =>
  host.querySelector<HTMLButtonElement>(`[data-timestamp="${date(iso).startOf('day').valueOf()}"]`)!;
const click = (host: HTMLElement, name: RegExp) => fireEvent.click(within(host).getByRole('button', { name }));
const press = (key: string) => fireEvent.keyDown(document.activeElement as HTMLElement, { key });

describe('DateCalendar compared with frozen MUI X 9.17.0', () => {
  beforeEach(() => vi.setSystemTime(new Date(2024, 2, 15, 12)));
  afterEach(() => vi.useRealTimers());

  it('matches the named grid and ordered utility classes and adds the consumer aliases at their positions', () => {
    const scoped = {
      ...props,
      disablePast: true,
      minDate: date('2024-03-14'),
      maxDate: date('2024-03-20'),
    };
    const reference = run(DateCalendarReference, scoped, (host) => {
      const root = host.firstElementChild!;
      expect(root.matches('.MuiDateCalendar-root.MuiCalendarPicker-root')).toBe(true);
      expect(day(host, '2024-03-14').disabled).toBe(true);
      expect(day(host, '2024-03-15').getAttribute('aria-current')).toBe('date');
      expect(day(host, '2024-03-20').disabled).toBe(false);
      expect(day(host, '2024-03-21').disabled).toBe(true);
      expect(within(host).getByRole('grid', { name: 'March 2024' })).toBeDefined();
      expect(within(host).getByRole('button', { name: 'Previous month' }).hasAttribute('disabled')).toBe(true);
      expect(within(host).getByRole('button', { name: 'Next month' }).hasAttribute('disabled')).toBe(true);
    });
    expect(
      run(DateCalendar, scoped, (host) => {
        expect(host.firstElementChild?.matches('.MuiDateCalendar-root.MuiCalendarPicker-root')).toBe(true);
        expect(
          host.querySelectorAll('.MuiPickersDay-root:not(.MuiPickersDay-hiddenDaySpacingFiller):not(.Mui-disabled)'),
        ).toHaveLength(6);
        const fillers = host.querySelectorAll('.MuiPickersDay-root.MuiPickersDay-hiddenDaySpacingFiller');
        expect(fillers).toHaveLength(11);
        expect([...fillers].every((cell) => cell.matches('div[role="gridcell"].MuiPickerDay-fillerCell'))).toBe(true);
      }),
    ).toEqual(reference);
  });

  it.each([
    { locale: 'en', input: '2024-03-15T13:42:56.789', picked: '2024-03-31' },
    { locale: 'ro', input: '2024-10-20T13:42:56.789', picked: '2024-10-27' },
  ])('publishes the frozen date, locale and selection state in $locale on $picked', ({ locale, input, picked }) => {
    const value = date(input, 'en');
    const options = { ...props, locale, value };
    const select = (host: HTMLElement, snap: () => void) => {
      fireEvent.click(day(host, picked));
      snap();
    };
    const reference = run(DateCalendarReference, options, select);
    expect(reference.events).toEqual([
      [
        'change',
        {
          identity: false,
          value: date(`${picked}T13:42:56.789`).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
          locale,
        },
        'finish',
        'day',
      ],
    ]);
    expect(value.format('YYYY-MM-DDTHH:mm:ss.SSS')).toBe(input);
    expect(value.locale()).toBe('en');
    expect(run(DateCalendar, options, select)).toEqual(reference);
  });

  it('uses the explicit reference with no selected value and follows calendar keys across months', () => {
    const options = {
      ...props,
      locale: 'ro',
      value: null,
      referenceDate: date('2024-01-31T09:08:07.654'),
      autoFocus: true,
    };
    const navigate = (host: HTMLElement, snap: () => void) => {
      expect(document.activeElement).toBe(day(host, '2024-01-31'));
      for (const key of [
        'PageUp',
        'PageDown',
        'ArrowRight',
        'ArrowLeft',
        'ArrowUp',
        'ArrowDown',
        'Home',
        'End',
        'Enter',
        ' ',
      ]) {
        press(key);
        const tabs = host.querySelectorAll('[role="gridcell"][tabindex="0"]');
        expect(tabs).toHaveLength(1);
        expect(tabs[0]).toBe(document.activeElement);
        snap();
      }
    };
    const reference = run(DateCalendarReference, options, navigate);
    expect(reference.trace[1]?.focus).toBe(String(date('2024-02-29').valueOf()));
    expect(run(DateCalendar, options, navigate)).toEqual(reference);
  });

  it('changes the leap-day year, clamps to the range and moves focus back to the day grid', () => {
    const options = {
      ...props,
      value: date('2024-02-29T08:09:10.345'),
      minDate: date('2023-01-01'),
      maxDate: date('2025-12-31'),
      autoFocus: true,
    };
    const selectYear = (host: HTMLElement, snap: () => void) => {
      click(host, /switch to year view/i);
      snap();
      const target = within(host).getByRole('radio', { name: '2023' });
      act(() => target.focus());
      fireEvent.click(target);
      snap();
      expect(within(host).getByRole('grid', { name: 'February 2023' })).toBeDefined();
    };
    const reference = run(DateCalendarReference, options, selectYear);
    expect(reference.events.map((event) => (event as string[])[0])).toEqual([
      'view',
      'change',
      'view',
      'month',
      'year',
    ]);
    expect(run(DateCalendar, options, selectYear)).toEqual(reference);
  });

  it('skips an unavailable horizontal target and leaves focus on an unavailable week jump', () => {
    const options = {
      ...props,
      value: date('2024-03-15'),
      minDate: date('2024-03-14'),
      maxDate: date('2024-03-20'),
      autoFocus: true,
      disablePast: true,
      showDaysOutsideCurrentMonth: true,
    };
    const navigate = (_host: HTMLElement, snap: () => void) => {
      for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'Home', 'End']) {
        press(key);
        snap();
      }
    };
    const reference = run(DateCalendarReference, options, navigate);
    expect(reference.trace[1]?.focus).toBe(reference.trace[0]?.focus);
    expect(reference.trace[3]?.focus).toBe(reference.trace[2]?.focus);
    expect(run(DateCalendar, options, navigate)).toEqual(reference);
  });
});

describe('Moment calendar adapter compared with frozen AdapterMoment', () => {
  it.each(['en', 'ro'])('preserves calendar days, duration and locale through DST and clamping in %s', (locale) => {
    const frozen = new AdapterMoment({ locale });
    const sample = (adapter: CalendarAdapter) => {
      const spring = date('2024-03-30T12:00:00', locale);
      const fall = date('2024-10-26T12:00:00', locale);
      const format = (value: Moment) => [value.format('YYYY-MM-DDTHH:mm:ss.SSSZ'), value.locale()];
      return {
        spring: format(adapter.addDays(spring, 1)),
        fall: format(adapter.addDays(fall, 1)),
        springElapsed: adapter.addDays(spring, 1).diff(spring, 'hours'),
        fallElapsed: adapter.addDays(fall, 1).diff(fall, 'hours'),
        clampMonth: format(adapter.addMonths(date('2024-01-31T12:03:04.567'), 1)),
        clampYear: format(adapter.addYears(date('2024-02-29T12:03:04.567'), 1)),
        week: [adapter.startOfWeek(spring), adapter.endOfWeek(spring)].map(format),
        weeks: [spring, fall].map((value) => adapter.getWeekArray(value).map((week) => week.map(format))),
        sameDay: adapter.isSameDay(spring, spring.clone().endOf('day')),
      };
    };
    const reference = sample(frozen);
    expect(reference.clampMonth[0]).toMatch(/^2024-02-29T12:03:04.567/);
    expect(reference.clampYear[0]).toMatch(/^2025-02-28T12:03:04.567/);
    const elapsed = (month: number, day: number) =>
      (new Date(2024, month, day + 1, 12).getTime() - new Date(2024, month, day, 12).getTime()) / 3_600_000;
    expect([reference.springElapsed, reference.fallElapsed]).toEqual([elapsed(2, 30), elapsed(9, 26)]);
    if (process.env.TZ === 'UTC') expect([reference.springElapsed, reference.fallElapsed]).toEqual([24, 24]);
    if (process.env.TZ === 'Europe/Bucharest')
      expect([reference.springElapsed, reference.fallElapsed]).toEqual([23, 25]);
    expect(sample(createCalendarAdapter(locale))).toEqual(reference);
  });
});
