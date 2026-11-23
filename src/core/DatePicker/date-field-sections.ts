// Numeric date sections adapted from @mui/x-date-pickers@9.17.0 useField (MIT).
import type { Moment } from 'moment';
import type { createCalendarAdapter } from './calendar-adapter';

export type DateFieldError = 'invalidDate' | 'disableFuture' | 'disablePast' | 'minDate' | 'maxDate' | null;
type Adapter = ReturnType<typeof createCalendarAdapter>;
type Token = 'MM' | 'DD' | 'YYYY';

const tokenLabels = { MM: 'Month', DD: 'Day', YYYY: 'Year' } as const;
export const parseFieldFormat = (format: string) =>
  Array.from(format.matchAll(/MM|DD|YYYY/g)).map(([token], index, matches) => {
    const offset = matches[index].index! + token.length;
    return {
      token: token as Token,
      label: tokenLabels[token as Token],
      separator: format.slice(offset, matches[index + 1]?.index),
    };
  });

export type DateFieldSection = ReturnType<typeof parseFieldFormat>[number];
export const sectionValues = (adapter: Adapter, model: DateFieldSection[], value: Moment | null) =>
  model.map(({ token }) => (value?.isValid() ? adapter.format(value, token) : ''));

export const serializeSections = (model: DateFieldSection[], parts: string[]) =>
  parts.some(Boolean) ? model.map(({ token, separator }, index) => (parts[index] || token) + separator).join('') : '';

export const boundaries = (adapter: Adapter, token: Token, value: Moment | null) => {
  switch (token) {
    case 'MM':
      return [1, 12] as const;
    case 'DD':
      return [1, value?.isValid() ? adapter.daysInMonth(value) : 31] as const;
    case 'YYYY':
      return [0, 9999] as const;
  }
};

export const validateFieldDate = (
  value: Moment | null,
  now: Moment,
  options: { disablePast?: boolean; disableFuture?: boolean; minDate?: Moment; maxDate?: Moment },
): DateFieldError => {
  if (!value) return null;
  if (!value.isValid()) return 'invalidDate';
  if (options.disableFuture && value.isAfter(now, 'day')) return 'disableFuture';
  if (options.disablePast && value.isBefore(now, 'day')) return 'disablePast';
  if (options.minDate && value.isBefore(options.minDate, 'day')) return 'minDate';
  if (options.maxDate && value.isAfter(options.maxDate, 'day')) return 'maxDate';
  return null;
};

export const describeSectionValue = (adapter: Adapter, token: Token, value: string) => {
  if (!value) return 'Empty';
  switch (token) {
    case 'MM':
      return adapter.format(adapter.setMonth(adapter.now(), Number(value) - 1), 'MMMM');
    case 'DD':
      return adapter.format(adapter.setDayOfMonth(adapter.start(adapter.now(), 'year'), Number(value)), 'D');
    case 'YYYY':
      return undefined;
  }
};
