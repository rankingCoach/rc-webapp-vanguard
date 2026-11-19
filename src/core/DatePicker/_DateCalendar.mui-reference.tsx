import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DateCalendar as MuiDateCalendar, type DateCalendarProps } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import 'moment/locale/ro';
import React from 'react';

export type CalendarFixtureProps = Pick<
  DateCalendarProps,
  | 'autoFocus'
  | 'value'
  | 'referenceDate'
  | 'minDate'
  | 'maxDate'
  | 'disablePast'
  | 'disableFuture'
  | 'disabled'
  | 'readOnly'
  | 'disableHighlightToday'
  | 'showDaysOutsideCurrentMonth'
  | 'reduceAnimations'
  | 'onChange'
  | 'onMonthChange'
  | 'onYearChange'
  | 'onViewChange'
> & { locale: string };

export const DateCalendarReference = ({ locale, ...props }: CalendarFixtureProps) => (
  <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={locale}>
    <MuiDateCalendar className="MuiCalendarPicker-root" {...props} />
  </LocalizationProvider>
);
