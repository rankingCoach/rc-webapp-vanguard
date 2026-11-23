import { DateField as MuiDateField, LocalizationProvider, type DateFieldProps } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import 'moment/locale/de';
import 'moment/locale/en-gb';
import 'moment/locale/ro';
import React from 'react';

export type DateFieldFixtureProps = Pick<
  DateFieldProps,
  | 'format'
  | 'value'
  | 'referenceDate'
  | 'minDate'
  | 'maxDate'
  | 'disablePast'
  | 'disableFuture'
  | 'disabled'
  | 'readOnly'
  | 'required'
  | 'label'
  | 'onChange'
  | 'onError'
> & { locale: string };

export const DateFieldReference = ({ locale, ...props }: DateFieldFixtureProps) => (
  <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={locale}>
    <MuiDateField
      {...props}
      fullWidth
      slotProps={{ textField: { slotProps: { htmlInput: { autoComplete: 'off' } } } }}
    />
  </LocalizationProvider>
);
