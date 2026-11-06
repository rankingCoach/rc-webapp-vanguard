import { useOutsideCallback } from '@custom-hooks/use-outside-callback';
import { FormConfigElement } from '@custom-hooks/useFormConfig';
import { uuidv4 } from '@helpers/generate-uid';
// import { useLocationSettings } from "@redux-stores/settings/location-settings.store";
import { getDatePatternFromLocale } from '@helpers/locale';
import { IconButton, useMediaQuery } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DateField } from '@mui/x-date-pickers/DateField';
import {
  DatePicker as DatePickerBase,
  DatePickerFieldProps,
  DatePickerToolbar,
  DatePickerToolbarProps,
} from '@mui/x-date-pickers/DatePicker';
import { DateViewRendererProps, renderDateViewCalendar } from '@mui/x-date-pickers/dateViewRenderers';
import { usePickerContext } from '@mui/x-date-pickers/hooks';
import { DateView, FieldRef } from '@mui/x-date-pickers/models';
import { PickersLayout, PickersLayoutProps } from '@mui/x-date-pickers/PickersLayout';
import { translationService } from '@services/translation.service';
import { datePickerValueParser } from '@vanguard/DatePicker/date-picker-value-parser';
import { Icon } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { OVERLAY_BASE_Z_INDEX, OverlayStackingService } from '@vanguard/OverlayStacking/OverlayStackingService';
import { Text } from '@vanguard/Text/Text';
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

// Keep the slot component stable across controlled value and open-state updates.
const PickerInputContext = React.createContext<{
  formconfig?: FormConfigElement;
  required?: boolean;
  label?: string;
  onClick?: () => void;
  format?: string;
  onChange?: (value: moment.Moment | null, publishedFieldValue?: boolean) => void;
}>({});

// DateField owns editing, selection, validation and the accessible section DOM.
const PickerInput = React.forwardRef<HTMLDivElement, DatePickerFieldProps>((fieldProps, ref) => {
  const context = React.useContext(PickerInputContext);
  const picker = usePickerContext<moment.Moment | null>();
  const desktop = useMediaQuery('(pointer: fine)', { defaultMatches: true });
  const fieldRef = useRef<FieldRef<moment.Moment | null>>(null);
  const pendingEdit = useRef(false);
  const sectionsBeforeInput = useRef<ReturnType<FieldRef<moment.Moment | null>['getSections']> | undefined>(undefined);
  const published = useRef(false);
  const pendingClear = useRef(false);
  const [fieldError, setFieldError] = useState(false);
  const [, renderEdit] = useState(0);
  React.useLayoutEffect(() => {
    // A public null publication means clear the field, not retain the other sections.
    // Once the controlled value is null, clearValue resets sections without publishing again.
    if (pendingClear.current && picker.value === null) {
      pendingClear.current = false;
      fieldRef.current?.clearValue();
    } else if (pendingClear.current) {
      // A parent retaining its accepted value rejected this clear.
      pendingClear.current = false;
    }
    if (!pendingEdit.current) return;
    pendingEdit.current = false;
    const sections = fieldRef.current?.getSections();
    if (
      !published.current &&
      sections !== sectionsBeforeInput.current &&
      sections?.some((section) => section.value !== '')
    ) {
      context.onChange?.(moment.invalid());
    }
    published.current = false;
  });
  return (
    <DateField
      {...fieldProps}
      ref={ref}
      label={
        context.label ? (
          <>
            {translationService.get(context.label, undefined).value}
            {!(context.formconfig?.validation?.required ?? context.required) && (
              <span className="vanguard-input-label-optional">
                {translationService.get('Optional', undefined).value}
              </span>
            )}
          </>
        ) : undefined
      }
      slotProps={{
        textField: {
          slotProps: {
            htmlInput: { autoComplete: 'off', 'aria-invalid': fieldError },
            input: {
              sx: { cursor: 'pointer' },
              ...(!desktop && {
                'aria-labelledby': undefined,
                'aria-label': picker.value?.isValid()
                  ? `Choose date, selected date is ${picker.value.format('MMM D, YYYY')}`
                  : 'Choose date',
              }),
            },
          },
        },
      }}
      onError={(error) => setFieldError(error !== null)}
      required={context.formconfig?.validation?.required ?? context.required}
      fieldRef={fieldRef}
      helperText={
        context.formconfig?.hasError ? (
          <Text testId="vanguard-input-error-text" color="--e500" aria-live="polite" aria-atomic="true">
            {context.formconfig.errors?.[0]}
          </Text>
        ) : undefined
      }
      onInputCapture={() => {
        sectionsBeforeInput.current = fieldRef.current?.getSections();
        published.current = false;
      }}
      onInput={() => {
        if (!desktop) return;
        pendingEdit.current = true;
        renderEdit((version) => version + 1);
      }}
      onKeyDownCapture={(event) => {
        published.current = false;
        if (!desktop && !picker.disabled && !picker.readOnly && event.key === 'Enter') context.onClick?.();
      }}
      onChange={(date) => {
        published.current = true;
        pendingClear.current = date === null;
        context.onChange?.(date, true);
      }}
      readOnly={!desktop}
      onClick={() => {
        if (!picker.disabled && !picker.readOnly) context.onClick?.();
      }}
    />
  );
});

// Retain the calendar root hook used by existing overlay consumers while
// rendering the actual v7 DateCalendar through its public view renderer.
const renderCompatibilityCalendar = (props: DateViewRendererProps<DateView>) =>
  renderDateViewCalendar({
    ...props,
    className: [props.className, 'MuiCalendarPicker-root'].filter(Boolean).join(' '),
  });

const KeyboardViewContext = React.createContext<{ keyboard: boolean; toggle: () => void } | null>(null);

const CompatibilityToolbar = (props: DatePickerToolbarProps) => {
  const keyboardView = React.useContext(KeyboardViewContext);
  if (props.hidden || !keyboardView) return <DatePickerToolbar {...props} />;
  return (
    <div className={props.className} style={{ position: 'relative' }}>
      <DatePickerToolbar {...props} />
      <IconButton
        sx={{ position: 'absolute', right: 12, bottom: 12 }}
        aria-label={keyboardView.keyboard ? 'go to calendar view' : 'go to text input view'}
        onClick={keyboardView.toggle}
      >
        ✎
      </IconButton>
    </div>
  );
};

// v6 removed the mobile keyboard toggle. Restore it in the public layout slot.
function CompatibilityLayout(props: PickersLayoutProps<moment.Moment | null>) {
  const picker = usePickerContext<moment.Moment | null>();
  const { format = 'MM/DD/YYYY' } = React.useContext(PickerInputContext);
  const [keyboard, setKeyboard] = useState(false);
  if (picker.variant !== 'mobile') return <PickersLayout {...props} />;
  return (
    <KeyboardViewContext.Provider value={{ keyboard, toggle: () => setKeyboard(!keyboard) }}>
      <PickersLayout {...props}>
        {keyboard ? (
          <DateField
            format={format}
            value={picker.value}
            onChange={(date) => {
              if (date?.isValid()) picker.setValue(date, { changeImportance: 'set', source: 'field' });
            }}
          />
        ) : (
          props.children
        )}
      </PickersLayout>
    </KeyboardViewContext.Provider>
  );
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

  const [, setInternalValue] = useState<string | undefined>(datePickerValueParser(value));
  // MUI resynchronizes sections on external Moment identity changes. An echoed
  // invalid numeric publication acknowledges editing; it is not a new external date.
  const lastEmissionInvalid = useRef(false);
  const [, refreshPickerValue] = useState(0);
  const pickerValue = useRef({ value, date: value === null ? null : moment(value) });
  const pendingFieldPublication = useRef<{ date: moment.Moment | null } | undefined>(undefined);
  const incomingChanged = !Object.is(value, pickerValue.current.value);
  const pending = pendingFieldPublication.current;
  if (pending) {
    const invalidAck = Number.isNaN(value) && pending.date !== null && !pending.date.isValid();
    // Valid/clear values remain parent-controlled. Only an acknowledged invalid
    // publication needs its exact Moment identity to finish MUI's pending sections.
    pickerValue.current = {
      value,
      date: invalidAck ? pending.date : value === null ? null : moment(value),
    };
    pendingFieldPublication.current = undefined;
    lastEmissionInvalid.current = false;
  } else if (incomingChanged) {
    const partialEcho = Number.isNaN(value) && lastEmissionInvalid.current;
    pickerValue.current = {
      value,
      date: partialEcho ? pickerValue.current.date : value === null ? null : moment(value),
    };
    lastEmissionInvalid.current = false;
  }
  const publishDate = (date: moment.Moment | null, publishedFieldValue = false) => {
    if (publishedFieldValue) {
      pendingFieldPublication.current = { date };
      // Also observe a rejected publication when the parent does not rerender.
      refreshPickerValue((version) => version + 1);
    }
    lastEmissionInvalid.current = date !== null && !date.isValid();
    setInternalValue(datePickerValueParser(date));
    onChange?.(date?.valueOf());
  };
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLInputElement>(null);
  const openRef = useRef(false);

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
    // The field wrapper and the picker can both request opening for the same interaction.
    if (openRef.current) return;
    openRef.current = true;
    setPopperZIndex(OverlayStackingService.register(popperIdRef.current, 'popover'));
    setIsOpen(true);
  };
  const handleClose = () => {
    openRef.current = false;
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
      'MuiDateCalendar-root',
      'MuiPickersCalendarHeader-root',
      'MuiPickersDay-root',
      'MuiPickersArrowSwitcher-root',
      'MuiDayCalendar-weekContainer',
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

        <PickerInputContext.Provider
          value={{
            formconfig,
            required,
            label,
            onClick: handleOpen,
            format: datePattern,
            // Field publications use the public numeric callback, including invalid section edits.
            onChange: publishDate,
          }}
        >
          <DatePickerBase
            disableOpenPicker
            format={datePattern}
            yearsPerRow={3}
            viewRenderers={{
              day: renderCompatibilityCalendar,
              month: renderCompatibilityCalendar,
              year: renderCompatibilityCalendar,
            }}
            open={isOpen}
            onOpen={handleOpen}
            onClose={handleClose}
            slots={{ field: PickerInput, layout: CompatibilityLayout, toolbar: CompatibilityToolbar }}
            slotProps={{
              textField: { focused: isOpen },
              yearButton: { role: 'button' },
              popper: {
                className: 'MuiPickersPopper-root',
                sx: { zIndex: popperZIndex },
                placement: 'bottom-end',
                popperOptions: { placement: 'bottom-end' },
              },
              desktopPaper: { className: styles.paper },
            }}
            disablePast={disablePast}
            value={pickerValue.current.date}
            minDate={validatedMinDate}
            maxDate={validatedMaxDate}
            onChange={(date) => publishDate(date, true)}
          />
        </PickerInputContext.Provider>
      </div>
    </LocalizationProvider>
  );
};
