import { useOutsideCallback } from '@custom-hooks/use-outside-callback';
import { FormConfigElement } from '@custom-hooks/useFormConfig';
// import { useLocationSettings } from "@redux-stores/settings/location-settings.store";
import { getDatePatternFromLocale } from '@helpers/locale';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DatePicker as DatePickerBase } from '@mui/x-date-pickers/DatePicker';
import { uuidv4 } from '@helpers/generate-uid';
import { datePickerValueParser } from '@vanguard/DatePicker/date-picker-value-parser';
import { Icon } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Input } from '@vanguard/Input/Input';
import { OVERLAY_BASE_Z_INDEX, OverlayStackingService } from '@vanguard/OverlayStacking/OverlayStackingService';
import moment from 'moment';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import styles from './DatePicker.module.scss';

export interface DatePickerProps {
  value?: number;
  required?: boolean;
  label?: string;
  minDate?: number;
  maxDate?: number;
  disablePast?: boolean;
  formconfig?: FormConfigElement;
  closeOnCLickAway?: boolean;
  onChange?: (value: number | null | undefined) => void;
  locale: string;
}

export const DatePicker = (props: DatePickerProps) => {
  const {
    closeOnCLickAway,
    onChange,
    value = null,
    label,
    required,
    formconfig,
    minDate,
    maxDate,
    disablePast,
    locale,
  } = props;

  // const { locale } = useLocationSettings();
  const datePattern = getDatePatternFromLocale(locale);

  const [internalValue, setInternalValue] = useState<string | undefined>(datePickerValueParser(value));
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLInputElement>(null);

  /**
   * Calendar popper stacking
   * -------
   * MUI X renders the calendar in a Popper portaled to <body> with no z-index, so
   * inside a stacked modal/drawer it paints *behind* the surface that opened it.
   * Register a 'popover' slot on open (sitting above everything mounted) and
   * release it on close — same pattern as the Select dropdown in InputBase.
   */
  const popperIdRef = useRef<string>(`date-picker-popper-${uuidv4()}`);
  const [popperZIndex, setPopperZIndex] = useState(OVERLAY_BASE_Z_INDEX);

  const handleOpen = () => {
    setPopperZIndex(OverlayStackingService.register(popperIdRef.current, 'popover'));
    setIsOpen(true);
  };
  const handleClose = () => {
    OverlayStackingService.unregister(popperIdRef.current);
    setPopperZIndex(OVERLAY_BASE_Z_INDEX);
    setIsOpen(false);
  };
  // Release the slot if the picker unmounts while the calendar is still open.
  useEffect(() => () => OverlayStackingService.unregister(popperIdRef.current), []);
  // Helper function to ensure date is in seconds, convert if in milliseconds
  const ensureUnixInSeconds = (date: number | undefined) => {
    if (!date) return undefined;
    // If the timestamp is in milliseconds (13 digits), convert to seconds (10 digits)
    return date.toString().length === 13 ? Math.floor(date / 1000) : date;
  };

  // Memoize minDate and maxDate, ensuring they're valid UNIX timestamps and in seconds
  const validatedMinDate = useMemo(() => {
    const normalizedMinDate = ensureUnixInSeconds(minDate);
    return normalizedMinDate && moment.unix(normalizedMinDate).isValid() ? moment.unix(normalizedMinDate) : undefined;
  }, [minDate]);

  const validatedMaxDate = useMemo(() => {
    const normalizedMaxDate = ensureUnixInSeconds(maxDate);
    return normalizedMaxDate && moment.unix(normalizedMaxDate).isValid() ? moment.unix(normalizedMaxDate) : undefined;
  }, [maxDate]);

  useOutsideCallback(popoverRef, (event) => {
    const target = event.target as HTMLElement | null;
    if (!closeOnCLickAway) {
      return false;
    }

    const allowedClasses = [
      'MuiCalendarPicker-root',
      'MuiPickersCalendarHeader-root',
      'MuiPickersDay-root',
      'MuiPickersArrowSwitcher-root',
      'MuiDayPicker-weekContainer',
      // Add more classes here if needed
    ];

    const clickedInsideCalendar = allowedClasses.some((className) => target?.closest(`.${className}`));

    if (!clickedInsideCalendar && popoverRef.current && !popoverRef.current.contains(target)) {
      handleClose();
    }
  });
  /**
   * Return View
   * ---
   */
  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <div ref={popoverRef} className={styles.container}>
        <Icon className={styles.icon} color={'--n500'}>
          {IconNames.calendar}
        </Icon>

        <DatePickerBase
          inputFormat={datePattern}
          open={isOpen}
          onOpen={handleOpen}
          onClose={handleClose}
          PopperProps={{
            // Override MUI's static z-index so the calendar stacks above any
            // modal/drawer it was opened from (see OverlayStackingService).
            sx: { zIndex: popperZIndex },
            popperOptions: {
              placement: 'bottom-end',
            },
          }}
          PaperProps={{
            className: styles.paper,
          }}
          disablePast={disablePast}
          value={value}
          minDate={validatedMinDate}
          maxDate={validatedMaxDate}
          onChange={(newValue) => {
            setInternalValue(datePickerValueParser(newValue));
            onChange && onChange(newValue?.valueOf());
          }}
          renderInput={(params) => {
            const controlledParams = params;
            controlledParams.autoComplete = 'off'; // disable autocomplete to prevent browser from filling in the input
            controlledParams.focused = isOpen;
            delete controlledParams.label; // label should be handled by the Input component
            delete controlledParams.InputProps; // remove adornment
            return (
              <Input
                formconfig={formconfig}
                textFieldProps={controlledParams}
                disabled={params.disabled}
                required={required}
                value={internalValue}
                onClick={handleOpen}
                label={label}
              />
            );
          }}
        />
      </div>
    </LocalizationProvider>
  );
};
