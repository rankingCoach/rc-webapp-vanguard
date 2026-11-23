import { act, fireEvent, render, within } from '@testing-library/react';
import moment, { type Moment } from 'moment';
import React, { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getDatePatternFromLocale } from '../../helpers/locale';
import { DateFieldReference, type DateFieldFixtureProps } from './_DateField.mui-reference';
import { DateField } from './DateField';
import { clearDate, dateSection, serializedDateInput } from './date-picker-sections.test-helper';

const date = (iso: string, locale = 'en') => moment(iso, moment.ISO_8601).locale(locale);
const formats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'DD.MM.YYYY', 'DD-MM-YYYY', 'YYYY-MM-DD', 'YYYY/MM/DD'];
const locales = ['en', 'en-gb', 'de', 'ro'];
const matrix = locales.flatMap((locale) => formats.map((format) => ({ locale, format })));

const options: DateFieldFixtureProps = {
  locale: 'en',
  format: 'MM/DD/YYYY',
  label: 'Start date',
  value: date('2024-03-15T13:42:56.789'),
  referenceDate: date('2024-03-15'),
  minDate: date('2024-01-01'),
  maxDate: date('2024-12-31'),
};

const cleanText = (text: string | null) => text?.replace(/[\u200e\u200f\u2066-\u2069]/g, '') ?? null;

const snapshot = (host: HTMLElement) => {
  const query = within(host);
  const group = query.getByRole('group');
  const hidden = serializedDateInput(host);
  const sectionIndex = [...group.querySelectorAll('[data-sectionindex]')].map((element) => {
    const spin = element.querySelector('[role="spinbutton"]');
    return {
      index: element.getAttribute('data-sectionindex'),
      section: element.getAttribute('data-sectiontype'),
      text: cleanText(element.textContent),
      role: spin?.getAttribute('role') ?? null,
      label: spin?.getAttribute('aria-label') ?? null,
      current: spin?.getAttribute('aria-valuenow') ?? null,
      min: spin?.getAttribute('aria-valuemin') ?? null,
      max: spin?.getAttribute('aria-valuemax') ?? null,
      readOnly: spin?.getAttribute('aria-readonly') ?? null,
      textValue: spin?.getAttribute('aria-valuetext') ?? null,
      live: spin?.getAttribute('aria-live') ?? null,
      tab: spin?.getAttribute('tabindex') ?? null,
      editable: spin?.getAttribute('contenteditable') ?? null,
      focused: spin === document.activeElement,
    };
  });
  const label = [...(group.getAttribute('aria-labelledby')?.split(' ') ?? [])].map(
    (id) => document.getElementById(id)?.textContent,
  );
  return {
    sections: sectionIndex,
    label,
    groupEditable: group.getAttribute('contenteditable'),
    groupDisabled: group.getAttribute('aria-disabled'),
    groupInvalid: group.getAttribute('aria-invalid'),
    groupTab: group.getAttribute('tabindex'),
    groupFocused: group === document.activeElement,
    aliases: [...group.classList].filter((token) => token.startsWith('Mui')),
    serialized: cleanText(hidden.value),
    native: {
      autocomplete: hidden.autocomplete,
      type: hidden.type,
      required: hidden.required,
      disabled: hidden.disabled,
      readOnly: hidden.readOnly,
      tab: hidden.tabIndex,
    },
    selectedText: cleanText(window.getSelection()?.toString() ?? ''),
  };
};

type Session = {
  host: HTMLElement;
  select: (index: number) => HTMLElement;
  snap: () => void;
  replaceValue: (value: Moment | null) => void;
};

const run = (
  Field: React.ComponentType<DateFieldFixtureProps>,
  overrides: Partial<DateFieldFixtureProps>,
  actions: (session: Session) => void,
) => {
  const props = { ...options, ...overrides };
  const events: unknown[] = [];
  const trace: Array<ReturnType<typeof snapshot>> = [];
  let setExternalValue: ((value: Moment | null) => void) | undefined;
  const log = (value: Moment | null) =>
    value == null
      ? null
      : !value.isValid()
        ? 'invalid'
        : { iso: value.format('YYYY-MM-DDTHH:mm:ss.SSSZ'), locale: value.locale() };
  const Stage = () => {
    const [value, setValue] = useState(props.value);
    setExternalValue = setValue;
    return (
      <Field
        {...props}
        value={value}
        onChange={(next, context) => {
          events.push(['change', log(next), context.validationError]);
          setValue(next);
        }}
        onError={(validation, next) => events.push(['error', validation, log(next)])}
      />
    );
  };
  const view = render(<Stage />);
  try {
    const snap = () => trace.push(snapshot(view.container));
    const select = (index: number) => {
      const item = dateSection(serializedDateInput(view.container), index);
      act(() => item.focus());
      return item;
    };
    snap();
    actions({
      host: view.container,
      select,
      snap,
      replaceValue: (value) => act(() => setExternalValue?.(value)),
    });
    return { trace, events };
  } finally {
    view.unmount();
    window.getSelection()?.removeAllRanges();
  }
};

const pair = (props: Partial<DateFieldFixtureProps>, actions: (session: Session) => void) => {
  const frozen = run(DateFieldReference, props, actions);
  const candidate = run(DateField, props, actions);
  expect(candidate.events).toEqual(frozen.events);
  expect(candidate.trace).toHaveLength(frozen.trace.length);
  for (const [index, frame] of frozen.trace.entries()) {
    expect(candidate.trace[index], `edit frame ${index}`).toEqual(frame);
  }
  return frozen;
};

const paste = (target: HTMLElement, value: string) =>
  fireEvent.paste(target, { clipboardData: { getData: () => value } });
const key = (target: Element, key: string, ctrlKey = false) => fireEvent.keyDown(target, { key, ctrlKey });
const type = (target: HTMLElement, value: string, composing = false) => {
  target.textContent = value;
  fireEvent.input(target, {
    inputType: composing ? 'insertCompositionText' : 'insertText',
    data: value,
    isComposing: composing,
  });
};

describe('internal DateField against frozen MUI X 9.17.0', () => {
  beforeEach(() => vi.setSystemTime(new Date(2024, 2, 15, 12)));
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it.each(matrix)('serializes, edits and republishes $format in $locale', ({ locale, format }) => {
    const value = date('2024-03-15T13:42:56.789', locale);
    const pasted = date('2024-03-20', locale).format(format);
    pair({ locale, format, value }, ({ select, snap }) => {
      const first = select(0);
      snap();
      expect(first.getAttribute('aria-label')).toMatch(/^(Month|Day|Year)$/);
      paste(first, pasted);
      snap();
      key(select(1), 'ArrowUp');
      snap();
    });
  });

  it('preserves the consumer dash-locale fallback and separates it from the adapter locale', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const format = getDatePatternFromLocale('en-GB');
    expect(format).toBe('DD.MM.YYYY');
    pair({ locale: 'en', format }, ({ select, snap }) => {
      paste(select(0), '21.03.2024');
      snap();
    });
  });

  it('covers partial digits, IME, cross-section navigation and clearing during controlled edits', () => {
    pair({ value: null, required: true }, ({ select, snap, host, replaceValue }) => {
      type(select(0), '0');
      snap();
      const selected = select(0);
      fireEvent.compositionStart(selected);
      type(selected, '０３', true);
      fireEvent.compositionEnd(selected, { data: '０３' });
      snap();
      type(select(0), '3');
      snap();
      key(select(0), 'ArrowRight');
      snap();
      const day = select(1);
      key(day, 'Backspace');
      snap();
      day.textContent = '';
      fireEvent.input(day, { inputType: 'deleteContentBackward' });
      snap();
      replaceValue(date('2024-03-22T07:08:09.123'));
      snap();
      key(select(1), 'ArrowLeft');
      snap();
      key(select(0), 'a', true);
      snap();
      clearDate(serializedDateInput(host));
      snap();
      expect(serializedDateInput(host).value).toBe('');
    });
  });

  it('keeps invalid paste, validation boundaries, correction and callback order', () => {
    pair({ minDate: date('2024-03-14'), maxDate: date('2024-03-20'), disablePast: true }, ({ select, snap }) => {
      for (const text of ['02/30/2024', '03/14/2024', '03/15/2024', '03/20/2024', '03/21/2024', '03/20/2024']) {
        paste(select(0), text);
        snap();
      }
    });
  });

  it('clears a filled section, retains the other sections, and restores a controlled date', () => {
    pair({}, ({ select, snap, replaceValue }) => {
      key(select(0), 'ArrowRight');
      snap();
      const day = select(1);
      key(day, 'Backspace');
      snap();
      day.textContent = '';
      fireEvent.input(day, { inputType: 'deleteContentBackward' });
      snap();
      replaceValue(date('2024-02-29T05:06:07.008'));
      snap();
      key(select(1), 'ArrowUp');
      snap();
    });
  });

  it('reselects the focused day after a controlled value replacement and on empty Backspace', () => {
    const view = render(<DateField {...options} />);
    const day = view.getByRole('spinbutton', { name: 'Day' });
    const selection = day.ownerDocument.getSelection()!;
    const expectSelectedDay = (step: string, text: string) => {
      const range = selection.rangeCount ? selection.getRangeAt(0) : null;
      const observed = {
        activeDay: day.ownerDocument.activeElement === day,
        rangeCount: selection.rangeCount,
        startsInDay: range?.startContainer === day,
        endsInDay: range?.endContainer === day,
        start: range?.startOffset,
        end: range?.endOffset,
        text: selection.toString(),
      };
      expect(observed, step).toEqual({
        activeDay: true,
        rangeCount: 1,
        startsInDay: true,
        endsInDay: true,
        start: 0,
        end: day.childNodes.length,
        text,
      });
    };

    try {
      act(() => day.focus());
      expectSelectedDay('initial focus', '15');
      selection.collapse(day, 0);
      expect(selection.isCollapsed).toBe(true);

      view.rerender(<DateField {...options} value={date('2024-03-22T07:08:09.123')} />);
      expect(day.textContent).toBe('22');
      expectSelectedDay('controlled replacement', '22');

      view.rerender(<DateField {...options} value={null} />);
      expectSelectedDay('controlled clear', 'DD');
      selection.collapse(day, 0);
      expect(selection.isCollapsed).toBe(true);
      key(day, 'Backspace');
      expectSelectedDay('empty Backspace', 'DD');
    } finally {
      view.unmount();
      selection.removeAllRanges();
    }
  });

  it('rebuilds the sections when the parent changes format on the exact emitted Moment', () => {
    const trace = (Field: React.ComponentType<DateFieldFixtureProps>) => {
      const onChange = vi.fn<NonNullable<DateFieldFixtureProps['onChange']>>();
      const mounted = render(<Field {...options} onChange={onChange} />);
      try {
        const month = within(mounted.container).getByRole('spinbutton', { name: 'Month' });
        act(() => month.focus());
        paste(month, '03/20/2024');
        expect(onChange).toHaveBeenCalledTimes(1);
        const [echoed] = onChange.mock.calls[0];
        expect(echoed?.format('YYYY-MM-DD')).toBe('2024-03-20');
        mounted.rerender(<Field {...options} value={echoed} onChange={onChange} />);
        const echoedBeforeFormat = snapshot(mounted.container);
        mounted.rerender(<Field {...options} value={echoed} format="DD/MM/YYYY" onChange={onChange} />);
        const echoedAfterFormat = snapshot(mounted.container);
        mounted.rerender(<Field {...options} value={echoed} format="DD/MM/YYYY" locale="de" onChange={onChange} />);
        const echoedAfterLocale = snapshot(mounted.container);
        expect(onChange).toHaveBeenCalledTimes(1);
        return [echoedBeforeFormat, echoedAfterFormat, echoedAfterLocale];
      } finally {
        mounted.unmount();
        window.getSelection()?.removeAllRanges();
      }
    };
    const reference = trace(DateFieldReference);
    expect(reference.map(({ serialized }) => serialized)).toEqual(['03/20/2024', '20/03/2024', '20/03/2024']);
    expect(reference[2].sections.map(({ label, textValue }) => [label, textValue])).toEqual([
      ['Day', '20'],
      ['Month', 'März'],
      ['Year', null],
    ]);
    expect(trace(DateField)).toEqual(reference);
  });

  it.each(['disabled', 'readOnly'] as const)('pins field accessibility and edits when %s', (prop) => {
    const frozen = pair({ [prop]: true }, ({ host, snap }) => {
      const first = host.querySelector<HTMLElement>('[data-sectionindex="0"] [role="spinbutton"]');
      if (first) {
        key(first, 'ArrowUp');
        paste(first, '03/20/2024');
        key(first, 'Backspace');
      }
      snap();
    });
    expect(frozen.events).toEqual([]);
  });
});
