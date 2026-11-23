// Calendar behavior adapted from @mui/x-date-pickers@9.17.0 DateCalendar, DayCalendar,
// PickersCalendarHeader, PickersSlideTransition and YearCalendar (MIT).
import type { Moment } from 'moment';
import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useMediaQuery } from '../../custom-hooks/use-media-query/use-media-query';
import { Fade } from '../../primitives/react/Transitions/Fade';
import { ButtonBase } from '../../primitives/react/ButtonBase/ButtonBase';
import { cx } from '../../primitives/react/class-names';
import { useVanguardTypography } from '../../primitives/react/typography-context';
import { createCalendarAdapter } from './calendar-adapter';
import './DateCalendar.scss';

type View = 'day' | 'year';
type Direction = 'left' | 'right';

export interface DateCalendarProps {
  locale: string;
  value?: Moment | null;
  referenceDate?: Moment;
  minDate?: Moment;
  maxDate?: Moment;
  autoFocus?: boolean;
  disablePast?: boolean;
  disableFuture?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  disableHighlightToday?: boolean;
  showDaysOutsideCurrentMonth?: boolean;
  reduceAnimations?: boolean;
  yearButtonRole?: 'button' | 'radio';
  onChange?: (value: Moment | null, selection: 'finish' | 'partial', view?: View) => void;
  onMonthChange?: (value: Moment) => void;
  onYearChange?: (value: Moment) => void;
  onViewChange?: (view: View) => void;
}

const paths = {
  toggle: 'M7 10l5 5 5-5z',
  previous: 'M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z',
  next: 'M8.59 16.59 10 18l6-6-6-6-1.41 1.41L13.17 12z',
};

const CalendarIcon = ({ name }: { name: keyof typeof paths }) => (
  <svg
    className={cx(
      'MuiSvgIcon-root',
      'MuiSvgIcon-fontSizeInherit',
      name === 'toggle' && 'MuiPickersCalendarHeader-switchViewIcon',
    )}
    viewBox="0 0 24 24"
    focusable="false"
    aria-hidden="true"
  >
    <path d={paths[name]} />
  </svg>
);

const slideDuration = 375;
const slideClass = 'MuiPickersSlideTransition-';
const weekdayColumns = [1, 2, 3, 4, 5, 6, 7] as const;
const yearFillerSlots = ['first-year-filler', 'second-year-filler'] as const;

export const DateCalendar = ({
  locale,
  value: controlledValue,
  referenceDate,
  minDate,
  maxDate,
  autoFocus = false,
  disablePast = false,
  disableFuture = false,
  disabled = false,
  readOnly = false,
  disableHighlightToday = false,
  showDaysOutsideCurrentMonth = false,
  reduceAnimations,
  yearButtonRole = 'radio',
  onChange,
  onMonthChange,
  onYearChange,
  onViewChange,
}: DateCalendarProps) => {
  const typography = useVanguardTypography();
  const adapter = useMemo(() => createCalendarAdapter(locale), [locale]);
  const [today] = useState(() => adapter.now());
  const min = minDate ?? today.clone().year(1900).startOf('year');
  const max = maxDate ?? today.clone().year(2099).endOf('year').startOf('day');
  const lower = disablePast && today.isAfter(min, 'day') ? today : min;
  const upper = disableFuture && today.isBefore(max, 'day') ? today : max;
  const cannotSelect = (day: Moment) => day.isBefore(lower, 'day') || day.isAfter(upper, 'day');

  const [uncontrolledValue, setUncontrolledValue] = useState<Moment | null>(null);
  const value = controlledValue === undefined ? uncontrolledValue : controlledValue;
  const [reference] = useState(() => {
    if (value?.isValid()) return value.clone();
    if (referenceDate) return referenceDate.clone();
    if (today.isBefore(lower, 'day')) return adapter.start(lower, 'day');
    if (today.isAfter(upper, 'day')) return adapter.start(upper, 'day');
    return adapter.start(today, 'day');
  });
  const [month, setMonth] = useState(() => adapter.setDayOfMonth(reference, 1));
  const [dayFocus, setDayFocus] = useState<Moment | null>(() => reference);
  const [focusGrid, setFocusGrid] = useState(autoFocus);
  const [yearFocus, setYearFocus] = useState(reference.year());
  const [view, setView] = useState<View>('day');
  const [slide, setSlide] = useState<{
    previous: Moment;
    direction: Direction;
  } | null>(null);
  const [moving, setMoving] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const yearGrid = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const reducedMotionQuery = useMediaQuery('(prefers-reduced-motion: reduce)');
  const prefersReducedMotion = reduceAnimations ?? reducedMotionQuery;
  const rtl = () => root.current?.closest('[dir]')?.getAttribute('dir') === 'rtl';

  const moveTo = (target: Moment, reason: 'header' | 'cell' | 'value') => {
    const differentMonth = !target.isSame(month, 'month');
    const nextMonth = differentMonth ? adapter.start(target, 'month') : month;
    let targetDay: Moment | null = target;
    if (reason !== 'cell' && cannotSelect(target)) {
      const monthStart = adapter.start(target, 'month');
      const monthEnd = adapter.end(target, 'month');
      const nearest = target.isBefore(lower, 'day') ? lower : upper;
      targetDay = nearest.isBetween(monthStart, monthEnd, 'day', '[]') ? nearest : null;
    }
    if (differentMonth) {
      if (reason !== 'cell' && !prefersReducedMotion) {
        setSlide({
          previous: month,
          direction: target.isAfter(month, 'month') ? 'left' : 'right',
        });
        setMoving(false);
      }
      setMonth(nextMonth);
      onMonthChange?.(nextMonth);
      if (nextMonth.year() !== month.year()) onYearChange?.(adapter.start(nextMonth, 'year'));
    }
    setDayFocus((previous) => (previous && targetDay && adapter.isSameDay(previous, targetDay) ? previous : targetDay));
  };

  const previousValue = useRef(value);
  useEffect(() => {
    if (previousValue.current === value) return;
    previousValue.current = value;
    if (value?.isValid()) moveTo(value, 'value');
  });

  useLayoutEffect(() => {
    if (!slide) return;
    const entering = root.current?.querySelector('.MuiDayCalendar-monthContainer:last-child');
    entering?.getBoundingClientRect();
    setMoving(true);
    const timeout = window.setTimeout(() => setSlide(null), slideDuration);
    return () => window.clearTimeout(timeout);
  }, [slide]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: dayFocus/yearFocus rearm the focus transfer on every cursor move (pruning loses grid focus; B log "DateCalendar day/year roving-focus rearm")
  useLayoutEffect(() => {
    if (!focusGrid || slide) return;
    const focused =
      view === 'day'
        ? root.current?.querySelector<HTMLElement>('[role="gridcell"][tabindex="0"]')
        : yearGrid.current?.querySelector<HTMLButtonElement>('button[tabindex="0"]');
    focused?.focus();
  }, [dayFocus, focusGrid, slide, view, yearFocus]);

  useEffect(() => {
    if (view !== 'year' || focusGrid) return;
    const grid = yearGrid.current;
    const button = grid?.querySelector<HTMLElement>('[tabindex="0"]');
    if (!grid || !button || button.offsetHeight > grid.clientHeight || button.offsetTop < grid.scrollTop) return;
    grid.scrollTop = button.offsetTop + (button.offsetHeight - grid.clientHeight) / 2;
  }, [view, focusGrid]);

  const choose = (next: Moment, source: View) => {
    if (controlledValue === undefined) setUncontrolledValue(next);
    onChange?.(next, source === 'year' ? 'partial' : 'finish', source === 'day' ? 'day' : undefined);
  };

  const chooseDay = (day: Moment) => {
    if (!readOnly && !disabled && !cannotSelect(day)) choose(adapter.mergeDateAndTime(day, value ?? reference), 'day');
  };

  const focusDay = (day: Moment) => {
    if (disabled || cannotSelect(day)) return;
    if (dayFocus && adapter.isSameDay(dayFocus, day)) {
      setFocusGrid(true);
      return;
    }
    moveTo(day, 'cell');
    setFocusGrid(true);
  };

  const horizontalDay = (day: Moment, step: number) => {
    const limit = adapter.addMonths(day, step);
    const edge = step === 1 ? adapter.end(limit, 'month') : adapter.start(limit, 'month');
    for (
      let next = adapter.addDays(day, step);
      step === 1 ? !next.isAfter(edge, 'day') : !next.isBefore(edge, 'day');
    ) {
      if (!cannotSelect(next)) return next;
      next = adapter.addDays(next, step);
    }
    return day;
  };

  const handleDayKey = (event: React.KeyboardEvent, day: Moment) => {
    const direction = rtl() ? -1 : 1;
    switch (event.key) {
      case 'ArrowLeft':
        focusDay(horizontalDay(day, -direction));
        break;
      case 'ArrowRight':
        focusDay(horizontalDay(day, direction));
        break;
      case 'ArrowUp':
        focusDay(adapter.addDays(day, -7));
        break;
      case 'ArrowDown':
        focusDay(adapter.addDays(day, 7));
        break;
      case 'Home':
        focusDay(adapter.startOfWeek(day));
        break;
      case 'End':
        focusDay(adapter.endOfWeek(day));
        break;
      case 'PageUp':
        focusDay(adapter.addMonths(day, 1));
        break;
      case 'PageDown':
        focusDay(adapter.addMonths(day, -1));
        break;
      case 'Enter':
      case ' ':
        chooseDay(day);
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  const showView = (next: View) => {
    if (next === 'year') setYearFocus(value?.year() ?? reference.year());
    setView(next);
    onViewChange?.(next);
  };

  const chooseYear = (year: number) => {
    if (readOnly || disabled) return;
    const proposed = adapter.setYear(value ?? reference, year);
    const next = proposed.isBefore(lower, 'day') ? lower : proposed.isAfter(upper, 'day') ? upper : proposed;
    choose(next, 'year');
    showView('day');
    moveTo(next, 'cell');
  };

  const handleYearKey = (event: React.KeyboardEvent, year: number) => {
    const direction = rtl() ? -1 : 1;
    let target = year;
    switch (event.key) {
      case 'ArrowLeft':
        target -= direction;
        break;
      case 'ArrowRight':
        target += direction;
        break;
      case 'ArrowUp':
        target -= 3;
        break;
      case 'ArrowDown':
        target += 3;
        break;
      case 'Enter':
      case ' ':
        chooseYear(year);
        break;
      default:
        return;
    }
    event.preventDefault();
    if (target >= lower.year() && target <= upper.year()) setYearFocus(target);
  };

  const renderWeeks = (visibleMonth: Moment, className?: string) => (
    <div
      role="rowgroup"
      className={cx('MuiDayCalendar-monthContainer', className)}
      key={visibleMonth.format('YYYY-MM')}
    >
      {adapter.getWeekArray(visibleMonth).map((week, weekIndex) => (
        <div role="row" className="MuiDayCalendar-weekContainer" aria-rowindex={weekIndex + 2} key={week[0].valueOf()}>
          {week.map((day, index) => {
            const outside = !day.isSame(visibleMonth, 'month');
            const unavailable = disabled || cannotSelect(day);
            const filler = outside && !showDaysOutsideCurrentMonth;
            if (filler) {
              return (
                <div
                  key={day.valueOf()}
                  role="gridcell"
                  aria-colindex={index + 1}
                  className={cx(
                    'MuiPickerDay-root',
                    unavailable && 'Mui-disabled',
                    'MuiPickerDay-dayOutsideMonth',
                    'MuiPickerDay-fillerCell',
                    'MuiPickersDay-root',
                    'MuiPickersDay-hiddenDaySpacingFiller',
                  )}
                />
              );
            }
            const selected = !!value && adapter.isSameDay(value, day);
            const current = adapter.isSameDay(today, day);
            return (
              <ButtonBase
                key={day.valueOf()}
                role="gridcell"
                centerRipple
                disabled={unavailable}
                data-timestamp={day.valueOf()}
                tabIndex={dayFocus && adapter.isSameDay(dayFocus, day) ? 0 : -1}
                aria-colindex={index + 1}
                aria-selected={selected}
                aria-current={current ? 'date' : undefined}
                className={cx(
                  'MuiPickerDay-root',
                  selected && 'Mui-selected',
                  current && !selected && !disableHighlightToday && 'MuiPickerDay-today',
                  outside && 'MuiPickerDay-dayOutsideMonth',
                  'MuiPickersDay-root',
                )}
                onClick={(event) => {
                  chooseDay(day);
                  if (outside) event.currentTarget.focus();
                }}
                onFocus={() => focusDay(day)}
                onBlur={(event) => {
                  if (!root.current?.contains(event.relatedTarget)) setFocusGrid(false);
                }}
                onKeyDown={(event) => handleDayKey(event, day)}
              >
                {adapter.format(day, 'D')}
              </ButtonBase>
            );
          })}
        </div>
      ))}
    </div>
  );

  const navigateMonth = (offset: number) => (event: React.MouseEvent) => {
    if (event.currentTarget === document.activeElement) setFocusGrid(false);
    moveTo(adapter.addMonths(month, offset), 'header');
  };
  const weeks = adapter.getWeekArray(month);
  const years = Array.from({ length: Math.max(0, max.year() - min.year() + 1) }, (_, index) => min.year() + index);

  const heading = (
    <div id={headingId} className="MuiPickersCalendarHeader-label">
      {adapter.format(month, 'MMMM YYYY')}
    </div>
  );
  const content = (
    <div>
      {view === 'day' ? (
        <div
          role="grid"
          aria-labelledby={headingId}
          aria-colcount={7}
          aria-rowcount={weeks.length + 1}
          className="MuiDayCalendar-root"
        >
          <div role="row" aria-rowindex={1} className="MuiDayCalendar-header">
            {weekdayColumns.map((column) => {
              const day = weeks[0][column - 1];
              return (
                <span
                  key={column}
                  role="columnheader"
                  aria-colindex={column}
                  aria-label={adapter.format(day, 'dddd')}
                  className="MuiTypography-root MuiTypography-caption MuiDayCalendar-weekDayLabel"
                >
                  {adapter.format(day, 'ddd').charAt(0).toUpperCase()}
                </span>
              );
            })}
          </div>
          <div
            role="none"
            className="MuiPickersSlideTransition-root MuiDayCalendar-slideTransition"
            data-reduced-motion={prefersReducedMotion || undefined}
          >
            {slide &&
              renderWeeks(
                slide.previous,
                cx(slideClass + 'slideExit', moving && slideClass + 'slideExitActiveLeft-' + slide.direction),
              )}
            {renderWeeks(
              month,
              slide
                ? cx(slideClass + 'slideEnter-' + slide.direction, moving && slideClass + 'slideEnterActive')
                : undefined,
            )}
          </div>
        </div>
      ) : (
        <div role="radiogroup" ref={yearGrid} aria-labelledby={headingId} className="MuiYearCalendar-root">
          {years.map((year) => {
            const selected = year === value?.year();
            const yearDisabled = disabled || year < lower.year() || year > upper.year();
            return (
              <button
                type="button"
                role={yearButtonRole}
                key={year}
                aria-checked={selected}
                aria-current={year === today.year() ? 'date' : undefined}
                disabled={yearDisabled}
                tabIndex={year === yearFocus && !yearDisabled ? 0 : -1}
                className={cx('MuiYearCalendar-button', yearDisabled && 'Mui-disabled', selected && 'Mui-selected')}
                onFocus={() => {
                  setYearFocus(year);
                  setFocusGrid(true);
                }}
                onClick={() => chooseYear(year)}
                onKeyDown={(event) => handleYearKey(event, year)}
              >
                {year}
              </button>
            );
          })}
          {yearFillerSlots.slice(0, (3 - (years.length % 3)) % 3).map((slot) => (
            <div key={slot} className="MuiYearCalendar-buttonFiller" />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div
      className="MuiDateCalendar-root MuiCalendarPicker-root"
      data-vg-core=""
      data-slot="date-calendar"
      data-vg-typography={typography}
      data-view={view}
      ref={root}
    >
      <div className="MuiPickersCalendarHeader-root">
        <div
          role="none"
          aria-live="polite"
          className="MuiPickersCalendarHeader-labelContainer"
          onClick={() => {
            if (disabled) return;
            showView(view === 'day' ? 'year' : 'day');
            // MUI X focuses the newly shown view (the selected year / day), not the switch button.
            setFocusGrid(true);
          }}
        >
          {prefersReducedMotion ? (
            heading
          ) : (
            <div className="MuiPickersFadeTransitionGroup-root">
              <Fade key={month.format('YYYY-MM')} in appear={false}>
                {heading}
              </Fade>
            </div>
          )}
          {!disabled && (
            <ButtonBase
              className="MuiIconButton-root MuiIconButton-sizeSmall MuiPickersCalendarHeader-switchViewButton"
              aria-label={
                view === 'day'
                  ? 'calendar view is open, switch to year view'
                  : 'year view is open, switch to calendar view'
              }
              onFocus={() => setFocusGrid(false)}
            >
              <CalendarIcon name="toggle" />
            </ButtonBase>
          )}
        </div>
        <Fade in={view === 'day'} appear={!prefersReducedMotion} enter={!prefersReducedMotion}>
          <div className="MuiPickersArrowSwitcher-root">
            <ButtonBase
              className="MuiIconButton-root MuiIconButton-edgeEnd MuiIconButton-sizeMedium MuiPickersArrowSwitcher-button MuiPickersArrowSwitcher-previousIconButton"
              onClick={navigateMonth(-1)}
              aria-label="Previous month"
              title="Previous month"
              disabled={disabled || month.isSameOrBefore(lower, 'month')}
            >
              <CalendarIcon name={rtl() ? 'next' : 'previous'} />
            </ButtonBase>
            <div className="MuiPickersArrowSwitcher-spacer" />
            <ButtonBase
              className="MuiIconButton-root MuiIconButton-edgeStart MuiIconButton-sizeMedium MuiPickersArrowSwitcher-button MuiPickersArrowSwitcher-nextIconButton"
              onClick={navigateMonth(1)}
              aria-label="Next month"
              title="Next month"
              disabled={disabled || month.isSameOrAfter(upper, 'month')}
            >
              <CalendarIcon name={rtl() ? 'previous' : 'next'} />
            </ButtonBase>
          </div>
        </Fade>
      </div>
      {prefersReducedMotion ? (
        content
      ) : (
        <div className="MuiPickersFadeTransitionGroup-root MuiDateCalendar-viewTransitionContainer">
          <Fade key={view} in appear={false}>
            {content}
          </Fade>
        </div>
      )}
    </div>
  );
};
