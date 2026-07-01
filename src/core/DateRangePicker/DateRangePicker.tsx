import './DateRangePicker.scss';

import { useInsideClickCallback } from '@custom-hooks/use-inside-click-callback';
import { useOutsideCallback } from '@custom-hooks/use-outside-callback';
import { dFlex } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { dateIsBefore, dateIsSameDay } from '@helpers/date-helpers';
import { uuidv4 } from '@helpers/generate-uid';
import { Fade, Popper } from '@mui/material';
import { translationService } from '@services/translation.service';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { DateRangePickerResp } from '@vanguard/DateRange/DateRange';
import { OVERLAY_BASE_Z_INDEX, OverlayStackingService } from '@vanguard/OverlayStacking/OverlayStackingService';
import {
  ensureIsRealDate,
  formatDateForComparison,
} from '@vanguard/DateRangePicker/date-range-picker-utils/date-range-picker-utils';
import {
  StaticRangeWithDefault,
  useDateRangePickerStaticRanges,
} from '@vanguard/DateRangePicker/DateRangePicker.config';
import {
  dateRangePickerFormatter,
  DateRangePickerFormatterDayMonth,
} from '@vanguard/DateRangePicker/DateRangePicker.formatter';
import { DateRangePickerBase } from '@vanguard/DateRangePicker/DateRangePickerBase/DateRangePickerBase';
import { DateRangePickerBaseInputAdornment } from '@vanguard/DateRangePicker/DateRangePickerBase/DateRangePickerBaseInputAdornment/DateRangePickerBaseInputAdornment';
import { DateRangePickerIMaskInput } from '@vanguard/DateRangePicker/DateRangePickerIMaskInput';
import { Input } from '@vanguard/Input/Input';
import moment from 'moment';
import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { StaticRange } from 'react-date-range';
import { a, useSpring } from 'react-spring';

/**
 * date-range-picker :: allows the user to manually select ranges of dates
 * static-range-picker :: allows the user to select from a predefined list of date ranges
 * */
export type DateRangePickerState = 'date-range-picker' | 'static-range-picker';
export type DateRangePickerReturn = { startDate?: Date; endDate?: Date };
type OnDateRangeSelectedFull = (startDate: Date, endDate: Date) => void;
type OnDateRangeSelectedEmpty = (startDate: undefined, endDate: undefined) => void;
type OnDateRangeSelected = OnDateRangeSelectedEmpty | OnDateRangeSelectedFull;

export interface DateRangePickerProps {
  disabled?: boolean;
  /**
   * -Will disable dates in calendar view
   * -Will remove from static selector list dates that whos startDate is after the minDate
   * */
  minDate?: Date;
  /**
   * -Will disable dates in calendar view
   * */
  maxDate?: Date;
  /**
   * Notifier parent component of changes in min/max dates that happen
   * */
  onChange?: (dates: DateRangePickerReturn, source: 'MANUAL' | 'AUTOMATIC') => void;
  /**
   * Notifier parent component when the view state changes between calendar and static ranges
   * */
  onStateChange?: (state: DateRangePickerState) => void;
  /**
   * Callback when any date is clicked in the calendar view with type identifier
   */
  onDateRangeSelected?: OnDateRangeSelected;
  ranges?: StaticRangeWithDefault[];
  startDate?: Date;
  endDate?: Date;
  testId?: string;
  className?: string;
  state?: DateRangePickerState;
}

export const DateRangePicker = (props: DateRangePickerProps) => {
  /**
   * Destructure props for eay access
   * */
  const {
    maxDate,
    minDate,
    onChange,
    onStateChange,
    onDateRangeSelected,
    ranges,
    startDate,
    endDate,
    testId,
    className,
    disabled,
  } = props;

  const [, render] = useReducer((p) => !p, false);

  // Track consecutive equal date selections
  const previousSelectionRef = useRef<{
    startDate?: Date;
    endDate?: Date;
  }>({});

  /**
   * Used to filter static input ranges
   */
  const [filterText, setFilterText] = useState('');

  /**
   * Default static ranges to be able to show the user in static range dropdown
   */
  const staticRanges = useRef(ranges ?? useDateRangePickerStaticRanges());

  /**
   * The selected state of the component allows us to switch from the date range picker and static ranges
   * */
  const [selectedState, setSelectedState] = useState<DateRangePickerState>(props.state ?? 'date-range-picker');
  /**
   * Used for popover to attach to
   * */
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  /**
   * Used to keep track of selected state of the date-range-picker
   * */
  const [isLeftFocused, setIsLeftFocused] = useState<boolean>(false);
  /**
   * Used to keep track of selected state of the static-range-picker
   * */
  const [isRightFocused, setIsRightFocused] = useState<boolean>(false);
  /**
   * Used to keep track of selected state of the popover
   * */
  const [isPopoverFocused, setIsPopoverFocused] = useState<boolean>(false);

  /**
   * Used to keep track of the real startDate and endDate in DATE format
   * */
  const [leftAbsoluteData, setLeftAbsoluteData] = useState<{
    startDate: Date | undefined;
    endDate: Date | undefined;
  }>({
    startDate: startDate,
    endDate: endDate,
  });

  /**
   * Used to keep track of the real startDate and endDate in STATIC format
   * */
  const [rightAbsoluteData, setRightAbsoluteData] = useState<{
    startDate: Date | undefined;
    endDate: Date | undefined;
  }>({
    startDate: startDate,
    endDate: endDate,
  });
  /**
   * Used to keep the value of the date-range-picker  input
   * */
  const [dateRangePickerValue, setDateRangePickerValue] = useState<string>('');

  /**
   *   Used to keep the value of the static-range-picker  input value
   **/
  const [staticRangePickerValue, setStaticRangePickerValue] = useState<string>('');
  /**
   * Used to open/close the popover
   * */
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

  /**
   * Popper stacking
   * -------
   * The dropdown below portals to <body> with no z-index, so inside a stacked
   * modal/drawer it paints *behind* the surface that opened it. `open` is
   * derived from several state setters, so we mirror the resolved boolean
   * into an effect: register a 'popover' slot while open, release it on close
   * — same pattern as the Select dropdown in InputBase.
   */
  const popperIdRef = useRef<string>(`date-range-picker-popper-${uuidv4()}`);
  const [popperZIndex, setPopperZIndex] = useState(OVERLAY_BASE_Z_INDEX);
  const popperIsOpen = isPopoverOpen && !!anchorEl && !disabled;

  useEffect(() => {
    if (popperIsOpen) {
      setPopperZIndex(OverlayStackingService.register(popperIdRef.current, 'popover'));
    } else {
      OverlayStackingService.unregister(popperIdRef.current);
      setPopperZIndex(OVERLAY_BASE_Z_INDEX);
    }
    return () => OverlayStackingService.unregister(popperIdRef.current);
  }, [popperIsOpen]);
  /**
   * Main ref of the component
   * */
  const parentRef = useRef<HTMLDivElement>(null);
  /**
   * Ref of the date-range-picker
   * */
  const leftRef = useRef<HTMLInputElement>(null);
  /**
   * Ref of the static-range-picker
   * */
  const rightRef = useRef<HTMLInputElement>(null);
  /**
   * Ref of the popover
   * */
  const popoverRef = useRef<HTMLInputElement>(null);

  useOutsideCallback(popoverRef, () => {
    setIsPopoverFocused(false);
  });
  useInsideClickCallback(popoverRef, () => {
    setIsPopoverFocused(true);
  });

  /**
   * Make sure it is always in date format
   * */
  const minDateAsDate = useMemo(() => ensureIsRealDate(minDate), [minDate]);

  /**
   * Keep a record of all ranges we filter this by date
   * Also we filter this when the user types inside the filed
   * */
  const [staticRangesInternal, setStaticRangesInternal] = useState<StaticRangeWithDefault[]>(
    staticRanges.current ?? [],
  );

  useEffect(() => {
    if (startDate && endDate && moment(startDate).isValid() && moment(endDate).isValid()) {
      const {
        range,
        label,
        replacements,
        startDate: startDateRange,
        endDate: endDateRange,
      } = staticRangesInternal.find((val: StaticRangeWithDefault): boolean => {
        return dateIsSameDay(val.startDate, startDate) && dateIsSameDay(val.endDate, endDate);
        // return val.isDefault;
      }) ?? {};

      if (!rightAbsoluteData.endDate && !rightAbsoluteData.startDate) {
        setRightAbsoluteData({
          startDate: startDate,
          endDate: endDate,
        });
        // defaultSet = true;
        onChange && onChange({ startDate, endDate }, 'AUTOMATIC');
      }
      if (!range) {
        if (!rightAbsoluteData.endDate && !rightAbsoluteData.startDate) {
          setSelectedState('static-range-picker');
          setDateRangePickerValue(dateRangePickerFormatter.formatDateRangePickerInput(startDate, endDate));
        }
        return;
      }

      // const { startDate, endDate } = range();
      setStaticRangePickerValue(translationService.get(label ?? '', replacements).value);
    }
  }, [startDate, endDate]);
  /**
   * On change of min date
   * We need to remove static ranges that are not
   * */
  useEffect(() => {
    if (minDateAsDate) {
      const filtered = staticRanges.current?.filter((staticRange) => {
        const staticStartDate = staticRange.range().startDate;
        const staticEndDate = staticRange.range().endDate;
        if (!minDateAsDate || !staticStartDate || !staticEndDate) {
          return true;
        }
        /**
         *Developer passes a minDate
         * WE filter out all dates whos startDate is after the minDate passed as a developer
         * EG
         *                staticStartDate   staticEndDate
         *                          |---------| Date 1
         *  |               |---|-------------| Date 2
         *  |           |-------|-------------| Date 3
         *  |       |-----------|--------------| Date 4
         *                     ^ Min Date(minDateAsDate)
         *       In this case we remove all dates exept Date 1
         * */
        return dateIsBefore(minDateAsDate, staticStartDate);
      });
      setStaticRangesInternal(filtered);
    }
  }, [staticRanges.current]);

  /**
   *  Open the popover when any of inputs are focused
   * */
  useEffect(() => {
    if ((isLeftFocused || isRightFocused || isPopoverFocused) && !disabled) {
      setIsPopoverOpen(true);
    } else {
      setIsPopoverFocused(false);
      setIsPopoverOpen(false);
    }
  }, [isLeftFocused, isRightFocused, isPopoverFocused, disabled]);

  /**
   *  This is a hack to force the inside click listener to bind
   *  It is needed because of popover
   * */
  useEffect(() => {
    if (isPopoverOpen) {
      setTimeout(() => {
        render();
      }, 0);
    }
  }, [isPopoverOpen]);
  /**
   *  If no date is set we set an initial
   *  date so we do not have all the calendar selected
   * */
  useEffect(() => {
    /**
     * If the developer selected a default value we preselect that one IF we can find it
     * */

    let { range, label, replacements } =
      staticRangesInternal.find((val: StaticRangeWithDefault) => val.isDefault) ?? {};

    /**
     *If we do not find one set the first one by default
     * ONE should always exist make sure in get ranges hook if
     * none exist we just create a default NON selectable one with a message
     * */
    let defaultSet = false;
    if (!range || !label) {
      ({ range, label, replacements } = staticRangesInternal[0]);
    }
    const { startDate, endDate } = range();
    setStaticRangePickerValue(translationService.get(label ?? '', replacements).value);

    if (!rightAbsoluteData.endDate && !rightAbsoluteData.startDate) {
      setRightAbsoluteData({
        startDate: startDate,
        endDate: endDate,
      });
      defaultSet = true;
      onChange && onChange({ startDate, endDate }, 'AUTOMATIC');
    }
    // no selected data? put today as a default
    if (!leftAbsoluteData.endDate && !leftAbsoluteData.startDate && !defaultSet) {
      const newDate = new Date();
      const startDate = newDate;
      const endDate = newDate;
      setLeftAbsoluteData({
        startDate: startDate,
        endDate: endDate,
      });
      onChange && onChange({ startDate, endDate }, 'AUTOMATIC');
      setDateRangePickerValue(dateRangePickerFormatter.formatDateRangePickerInput(startDate, endDate));
    }
  }, [staticRangesInternal]);

  /**
   *  Set the anchor element for the popover
   * */
  useEffect(() => {
    if (parentRef.current) {
      setAnchorEl(parentRef.current);
    }
  }, [parentRef.current]);

  /**
   *  When the user selects from the dropdown the
   *  calendar should also reflect the change
   * */
  useEffect(() => {
    setLeftAbsoluteData(rightAbsoluteData);
  }, [rightAbsoluteData]);

  /**
   *  animation props for date-range-picker
   * */
  const slidingPropsLeft: any = useSpring({
    height: 48,
    width: selectedState === 'date-range-picker' ? '52px' : '185px',
  });
  /**
   *  animation props for sta tic-range-picker
   * */
  const slidingPropsRight: any = useSpring({
    height: 48,
    width: selectedState === 'static-range-picker' ? '52px' : '185px',
  });

  /**
   *  toggles between static-range-picker and date-range-picker
   *    - expands and contracts the inputs
   *    - changes the popover component to date-range / static picker
   * */
  const toggleClick = (pos: 'left' | 'right') => {
    // Prevent toggle when disabled

    if (disabled) {
      return;
    }

    /**
     * Stop click event if we are in selected mode and oppen popover
     *
     * */
    if (pos === 'left' && selectedState === 'static-range-picker') {
      // console.log("DateRangePicker | Invalid state, do not trigger click | ", "left");
      // setIsPopoverFocused(false);
      // setIsPopoverOpen((prev) => !prev);
      setIsPopoverFocused(true);
      setIsLeftFocused(true);
      return;
    }
    if (pos === 'right' && selectedState === 'date-range-picker') {
      // console.log("DateRangePicker | Invalid state, do not trigger click | ", "right");
      // setIsPopoverFocused(false);
      // setIsPopoverOpen((prev) => !prev);
      setIsPopoverFocused(true);
      setIsRightFocused(true);
      return;
    }

    setSelectedState((prev) => {
      const next = prev === 'static-range-picker' ? 'date-range-picker' : 'static-range-picker';
      setTimeout(() => {
        next === 'date-range-picker' ? rightRef?.current?.focus() : leftRef?.current?.focus();
      }, 0);

      // Notify parent component about state change
      if (onStateChange) {
        onStateChange(next);
      }

      return next;
    });
  };

  const pickerChange = (e: DateRangePickerResp, pos: 'left' | 'right') => {
    // Return early if disabled
    if (disabled) {
      return;
    }

    const { startDate, endDate } = e.selection;
    setIsPopoverFocused(true);

    // save the absolute data
    if (pos === 'left') {
      if (startDate === undefined && endDate === undefined) {
        setIsPopoverFocused(false);
        return;
      }
      setLeftAbsoluteData({
        startDate,
        endDate,
      });
      // set the string data in the input
      const val = dateRangePickerFormatter.formatDateRangePickerInput(startDate, endDate);
      setDateRangePickerValue(val);
    }

    if (pos === 'right') {
      setRightAbsoluteData({
        startDate,
        endDate,
      });
      const selectedOne: StaticRangeWithDefault | undefined = staticRangesInternal.find(
        (x: StaticRange) =>
          formatDateForComparison(x.range().startDate) === formatDateForComparison(startDate) &&
          formatDateForComparison(x.range().endDate) === formatDateForComparison(endDate),
      );
      if (selectedOne?.label) {
        setStaticRangePickerValue(translationService.get(selectedOne.label, selectedOne.replacements).value);
      }
    }
    /**
     * Notify any listeners something was changed
     * */
    if (onChange) {
      onChange({ startDate, endDate }, 'MANUAL');
    }
  };

  const handleDateCLick = (startDate: Date | undefined, endDate: Date | undefined) => {
    const internalStartDate = startDate ?? previousSelectionRef.current.startDate;
    const internalEndDate = endDate ?? previousSelectionRef.current.endDate;

    if (disabled) {
      return;
    }
    if (!onDateRangeSelected) {
      return;
    }
    if (startDate) {
      previousSelectionRef.current.startDate = startDate;
    }
    if (endDate) {
      previousSelectionRef.current.endDate = endDate;
    }
    if (internalStartDate && internalEndDate) {
      onDateRangeSelected && (onDateRangeSelected as OnDateRangeSelectedFull)(internalStartDate, internalEndDate);
      previousSelectionRef.current.startDate = undefined;
      previousSelectionRef.current.endDate = undefined;
      setIsPopoverOpen(false);
      setIsPopoverFocused(false);
      setIsLeftFocused(false);
      setIsRightFocused(false);
    }

    if (!internalStartDate && !internalEndDate) {
      onDateRangeSelected && (onDateRangeSelected as OnDateRangeSelectedEmpty)(undefined, undefined);
      setIsPopoverOpen(false);
      setIsPopoverFocused(false);
      setIsLeftFocused(false);
      setIsRightFocused(false);
    }
  };

  // Apply disabled styling class if the component is disabled
  const containerClassName = classNames(dFlex, disabled ? 'date-range-picker-disabled' : '');

  return (
    <ComponentContainer className={className} testId={`${testId}-container`}>
      <div
        data-testid={`${testId}-references`}
        ref={parentRef}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
        className={containerClassName}
      >
        <a.div
          data-testid={`${testId}-left-reference-container`}
          style={slidingPropsLeft}
          onClick={() => toggleClick('left')}
          className={classNames(selectedState === 'date-range-picker' ? 'input-closed' : '')}
        >
          <Input
            id={'datepicker-reference-input'}
            testId={`${testId}-datepicker-reference-input`}
            value={dateRangePickerValue}
            type={'text'}
            disabled={disabled}
            onFocus={() => {
              if (!disabled) {
                setIsLeftFocused(true);
                setIsPopoverFocused(false);
              }
            }}
            onBlur={() => setIsLeftFocused(false)}
            onChange={(e) => {
              if (disabled) return;

              const setDate = (what: 'startDate' | 'endDate', date: DateRangePickerFormatterDayMonth | null) => {
                if (!date) {
                  return false;
                }
                const year = leftAbsoluteData[what]?.getFullYear();
                const newDate = moment(`${date.day} ${date.month} ${year}`, 'D M YYYY');
                const modified = {
                  ...leftAbsoluteData,
                };
                if (newDate.isValid()) {
                  modified[what] = newDate.toDate();
                  setLeftAbsoluteData(modified);
                }
              };
              const value = e?.target?.value ?? '';
              const { startDate, endDate } = dateRangePickerFormatter.formatStringToDates(value);
              setDate('startDate', startDate);
              setDate('endDate', endDate);
              setDateRangePickerValue(value);
            }}
            inputRef={leftRef}
            textFieldProps={{
              InputProps: {
                inputComponent: DateRangePickerIMaskInput as any,
              },
              inputProps: {
                readOnly: selectedState === 'date-range-picker' || disabled,
                'data-testid': 'datepicker-reference',
              },
            }}
            className={classNames('input-left', selectedState === 'date-range-picker' ? 'input-closed' : '')}
            endAdornment={
              <DateRangePickerBaseInputAdornment
                onClick={() => {
                  if (!disabled) {
                    leftRef.current?.focus();
                  }
                }}
              />
            }
          />
        </a.div>
        <a.div
          data-testid={`${testId}-right-reference-container`}
          onClick={() => toggleClick('right')}
          style={slidingPropsRight}
          className={classNames(selectedState === 'static-range-picker' ? 'input-closed' : '')}
        >
          {/*{JSON.stringify(startDate)}*/}
          {/*{JSON.stringify(endDate)}*/}
          {/*{JSON.stringify(rightAbsoluteData)}*/}
          {/*{JSON.stringify(startDate)}*/}
          {/*{JSON.stringify(endDate)}*/}
          <Input
            testId={`${testId}-rangeselector-reference-input`}
            value={staticRangePickerValue}
            type={'text'}
            disabled={disabled}
            onFocus={() => {
              if (!disabled) {
                setIsRightFocused(true);
                setIsPopoverFocused(false);
              }
            }}
            onBlur={() => setIsRightFocused(false)}
            onChange={(e) => {
              // Not handled - input is readOnly
            }}
            inputRef={rightRef}
            textFieldProps={{
              inputProps: {
                readOnly: true,
                'data-testid': 'rangeselector-reference-input',
              },
            }}
            className={classNames('input-right', selectedState === 'static-range-picker' ? 'input-closed' : '')}
            endAdornment={
              <DateRangePickerBaseInputAdornment
                onClick={() => {
                  if (!disabled) {
                    rightRef.current?.focus();
                  }
                }}
              />
            }
          />
        </a.div>
      </div>

      <Popper
        open={popperIsOpen}
        anchorEl={anchorEl}
        transition
        className={'date-range-picker-popper'}
        // Override MUI's default z-index so the dropdown stacks above any
        // modal/drawer it was opened from (see OverlayStackingService).
        style={{ zIndex: popperZIndex }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <div
              className={classNames(
                'date-range-picker-dropdown',
                selectedState === 'date-range-picker' ? 'date-range-picker-dropdown-predefined' : '',
              )}
            >
              <div
                ref={popoverRef}
                style={{
                  width: 53 + 185,
                  top: 20,
                }}
              >
                <DateRangePickerBase
                  onChange={(e) => pickerChange(e, 'left')}
                  view={'calendar'}
                  date={leftAbsoluteData}
                  condition={selectedState === 'static-range-picker'}
                  maxDate={maxDate}
                  minDate={minDate}
                  onSelectionComplete={() => {
                    setIsPopoverOpen(false);
                    setIsPopoverOpen(false);
                  }}
                  onDateClick={(startDate, endDate, source) => {
                    if (source === 'single' && selectedState === 'static-range-picker') {
                      handleDateCLick && handleDateCLick(startDate, endDate);
                    }
                  }}
                />
                <DateRangePickerBase
                  onChange={(e) => pickerChange(e, 'right')}
                  initialDate={rightAbsoluteData}
                  view={'predefined'}
                  staticRanges={staticRangesInternal}
                  condition={selectedState === 'date-range-picker'}
                  maxDate={maxDate}
                  onSelectionComplete={() => {
                    setIsPopoverOpen(false);
                    setIsPopoverOpen(false);
                  }}
                  minDate={minDate}
                  onDateClick={(startDate, endDate, source) => {
                    if (source === 'range' && selectedState === 'date-range-picker') {
                      handleDateCLick && handleDateCLick(startDate, endDate);
                    }
                  }}
                />
              </div>
            </div>
          </Fade>
        )}
      </Popper>
    </ComponentContainer>
  );
};
