import moment, { type Moment } from 'moment';
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

import { useMediaQuery } from '../../custom-hooks/use-media-query/use-media-query';
import { getDatePatternFromLocale } from '../../helpers/locale';
import { ButtonBase } from '../../primitives/react/ButtonBase/ButtonBase';
import { ClickAway } from '../../primitives/react/ClickAway/ClickAway';
import { ModalHost } from '../../primitives/react/Modal/ModalHost';
import { OwnPopper } from '../../primitives/react/Popper/Popper';
import { Fade } from '../../primitives/react/Transitions/Fade';
import { Grow } from '../../primitives/react/Transitions/Grow';
import { translationService } from '../../services/translation.service';
import '../_internal/InputBase/InputBase.scss';
import { useThemeDefaultProps } from '../_internal/theme-default-props';
import { useResolvedFormConfig } from '../Form/use-resolved-form-config';
import { Icon } from '../Icon/Icon';
import { IconNames } from '../Icon/IconNames';
import { OVERLAY_BASE_Z_INDEX, OverlayStackingService } from '../OverlayStacking/OverlayStackingService';
import { Text } from '../Text/Text';
import { DateCalendar } from './DateCalendar';
import { DateField } from './DateField';
import type { DatePickerProps } from './DatePicker';
import styles from './DatePicker.module.scss';
import shellStyles from './DatePickerShell.module.scss';

const mobileZIndex = 1300;
const calendarTargets =
  '.MuiDateCalendar-root, .MuiPickersCalendarHeader-root, .MuiPickersDay-root, .MuiPickersArrowSwitcher-root, .MuiDayCalendar-weekContainer';

const boundaryDate = (stamp?: number) => {
  if (!stamp) return undefined;
  const seconds = stamp.toString().length === 13 ? Math.floor(stamp / 1000) : stamp;
  const date = moment.unix(seconds);
  return date.isValid() ? date : undefined;
};

export const DatePickerShell = ({
  value: publicValue,
  locale,
  onChange,
  label,
  required,
  formconfig,
  field,
  index,
  disablePast,
  minDate,
  maxDate,
  closeOnCLickAway,
}: DatePickerProps) => {
  const value = publicValue ?? undefined;
  const desktop = useMediaQuery('(pointer: fine)', { defaultMatches: true });
  const { disabled, readOnly } = useThemeDefaultProps<{ disabled?: boolean; readOnly?: boolean }>({}, 'MuiDatePicker');
  const { onKeyDown: onFieldKeyDown } = useThemeDefaultProps<{
    onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  }>({}, 'MuiDateField');
  const resolved = useResolvedFormConfig(formconfig, field, index);
  const requiredField = resolved?.validation?.required ?? required;
  const format = getDatePatternFromLocale(locale);
  // The frozen provider does not set an adapterLocale. The consumer locale selects the format separately.
  const adapterLocale = moment.locale();
  const min = useMemo(() => boundaryDate(minDate), [minDate]);
  const max = useMemo(() => boundaryDate(maxDate), [maxDate]);
  const accepted = useRef({ stamp: value, date: value === undefined ? null : moment(value) });
  const pendingField = useRef<{ date: Moment | null } | undefined>(undefined);
  const pendingSectionEdit = useRef(false);
  const [, refreshField] = useState(0);
  if (pendingField.current || !Object.is(accepted.current.stamp, value)) {
    const pending = pendingField.current;
    let date = value === undefined ? null : moment(value);
    if (Number.isNaN(value)) {
      if (pending?.date && !pending.date.isValid()) date = pending.date;
      else if (!pending && pendingSectionEdit.current) date = accepted.current.date;
    }
    accepted.current = {
      stamp: value,
      date,
    };
    pendingField.current = undefined;
    pendingSectionEdit.current = false;
  }
  const date = accepted.current.date;
  const [open, setOpen] = useState(false);
  const [mobileExiting, setMobileExiting] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const [zIndex, setZIndex] = useState(OVERLAY_BASE_Z_INDEX);
  const claim = useId();
  const title = useId();
  const live = useRef(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const fieldHost = useRef<HTMLDivElement>(null);
  const mobilePaperRef = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const originalStamp = useRef<number | undefined>(undefined);
  const focusRestore = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // MUI X focuses the field's first section after the picker closes (pick, OK/Cancel/backdrop/Escape on mobile).
  const firstSection = () => fieldHost.current?.querySelector<HTMLElement>('[role="spinbutton"]') ?? null;
  const restoreAfterMobileExit = useRef(false);
  // Remount the calendar on every open so its autoFocus moves focus to the selected day again (MUI X re-open).
  const [openCount, setOpenCount] = useState(0);

  useEffect(
    () => () => {
      clearTimeout(focusRestore.current);
      OverlayStackingService.unregister(claim);
    },
    [claim],
  );

  useEffect(() => {
    if (desktop) {
      // Leaving the mobile route unmounts its Fade, so it cannot finish an old exit on our behalf.
      setMobileExiting(false);
      setKeyboard(false);
    }
  }, [desktop]);

  const show = () => {
    if (disabled || readOnly || live.current) return;
    live.current = true;
    clearTimeout(focusRestore.current);
    const active = fieldHost.current?.ownerDocument.activeElement;
    opener.current = active instanceof HTMLElement ? active : null;
    originalStamp.current = value;
    setZIndex(OverlayStackingService.register(claim, 'popover'));
    setMobileExiting(false);
    setOpenCount((count) => count + 1);
    setOpen(true);
  };

  // `restoreTo`: the element to focus after closing (default: the element focused when the popup opened); `null` keeps
  // focus where it is (a click on the field already moved it to the clicked section).
  const dismiss = useCallback(
    (restoreTo?: HTMLElement | null) => {
      if (!live.current) return;
      live.current = false;
      OverlayStackingService.unregister(claim);
      setZIndex(OVERLAY_BASE_Z_INDEX);
      if (desktop) {
        const target = restoreTo === undefined ? opener.current : restoreTo;
        focusRestore.current = setTimeout(() => {
          if (target?.isConnected) target.focus();
        });
      } else {
        restoreAfterMobileExit.current = true;
        setMobileExiting(true);
      }
      setOpen(false);
    },
    [claim, desktop],
  );

  useEffect(() => {
    if (!open || !closeOnCLickAway) return;
    const owner = wrapper.current?.ownerDocument;
    const outsideDown = (event: MouseEvent) => {
      const target = event.target;
      // The mobile paper is portaled. Its buttons must finish their click before dismissing.
      if (
        target instanceof Element &&
        !wrapper.current?.contains(target) &&
        !mobilePaperRef.current?.contains(target) &&
        !target.closest(calendarTargets)
      )
        dismiss();
    };
    owner?.addEventListener('mousedown', outsideDown);
    return () => owner?.removeEventListener('mousedown', outsideDown);
  }, [closeOnCLickAway, dismiss, open]);

  const publish = (next: Moment | null) => {
    pendingField.current = { date: next };
    refreshField((version) => version + 1);
    onChange?.(next?.valueOf());
  };
  const publishSectionEdit = useCallback(() => {
    pendingSectionEdit.current = true;
    onChange?.(NaN);
  }, [onChange]);
  const choose: NonNullable<React.ComponentProps<typeof DateCalendar>['onChange']> = (next, selection) => {
    if (!Object.is(next?.valueOf(), value)) publish(next);
    if (desktop && selection === 'finish') dismiss(firstSection());
  };
  const cancel = () => {
    if (!Object.is(value, originalStamp.current)) onChange?.(originalStamp.current);
    dismiss();
  };

  const calendar = (
    <DateCalendar
      key={openCount}
      locale={adapterLocale}
      value={date}
      minDate={min}
      maxDate={max}
      disablePast={disablePast}
      autoFocus
      yearButtonRole="button"
      onChange={choose}
    />
  );
  const pickerLabel = label ? (
    <>
      {translationService.get(label, undefined).value}
      {!requiredField && (
        <span className="vanguard-input-label-optional">{translationService.get('Optional', undefined).value}</span>
      )}
    </>
  ) : undefined;
  const mobileLabel = date?.isValid() ? `Choose date, selected date is ${date.format('MMM D, YYYY')}` : 'Choose date';

  return (
    <ClickAway
      onClickAway={() => {
        if (desktop) dismiss();
      }}
    >
      <div ref={wrapper} className={styles.container}>
        <Icon className={styles.icon} color="--n500">
          {IconNames.calendar}
        </Icon>
        <div
          className={desktop ? `vanguard-input ${shellStyles.desktopField}` : 'vanguard-input'}
          ref={fieldHost}
          onClick={() => {
            // MUI X: a click on the field while the desktop popup is open closes it; focus stays on the clicked section.
            if (desktop && live.current) dismiss(null);
            else show();
          }}
          onKeyDownCapture={(event) => {
            if (!desktop && event.key === 'Enter') show();
            // MUI X: Escape in a date section closes the desktop popup and focuses the field's first section.
            if (desktop && live.current && event.key === 'Escape') {
              dismiss(fieldHost.current?.querySelector<HTMLElement>('[role="spinbutton"]') ?? null);
            }
          }}
        >
          <DateField
            locale={adapterLocale}
            format={format}
            value={date}
            disabled={disabled}
            readOnly={!desktop}
            required={requiredField}
            label={pickerLabel}
            minDate={min}
            maxDate={max}
            disablePast={disablePast}
            focused={open}
            groupLabel={desktop ? undefined : mobileLabel}
            reportInputValidation
            onUnpublishedSectionEdit={desktop ? publishSectionEdit : undefined}
            onSectionKeyDown={onFieldKeyDown}
            onChange={publish}
          />
          {resolved?.hasError && (
            <Text testId="vanguard-input-error-text" color="--e500" aria-live="polite" aria-atomic="true">
              {resolved.errors?.[0]}
            </Text>
          )}
        </div>
        {desktop ? (
          <OwnPopper
            open={open}
            anchorEl={() => fieldHost.current?.querySelector('.MuiPickersInputBase-root')}
            placement="bottom-end"
            transition
            role="dialog"
            className="MuiPickersPopper-root"
            style={{ zIndex }}
            onKeyDown={(event: React.KeyboardEvent) => {
              if (event.key === 'Tab') {
                // MUI X FocusTrap: Tab and Shift+Tab cycle inside the open desktop popup.
                const stops = [
                  ...event.currentTarget.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]',
                  ),
                ].filter(
                  (node) => node.tabIndex >= 0 && !node.hasAttribute('disabled') && node.getClientRects().length > 0,
                );
                if (stops.length === 0) return;
                const first = stops[0];
                const last = stops[stops.length - 1];
                const active = document.activeElement;
                const inside = event.currentTarget.contains(active);
                if (event.shiftKey && (active === first || !inside)) {
                  event.preventDefault();
                  last.focus();
                } else if (!event.shiftKey && (active === last || !inside)) {
                  event.preventDefault();
                  first.focus();
                }
                return;
              }
              if (event.key !== 'Escape') return;
              event.stopPropagation();
              const host = fieldHost.current;
              if (host && !host.contains(opener.current)) {
                // A click on the field's padding can open the calendar before a date section receives focus.
                opener.current = host.querySelector<HTMLElement>('[role="spinbutton"][tabindex="0"]');
              }
              dismiss();
            }}
          >
            {({ TransitionProps }) => (
              <Grow {...TransitionProps}>
                <div className={`MuiPickersPopper-paper ${styles.paper} ${shellStyles.desktopPaper}`}>{calendar}</div>
              </Grow>
            )}
          </OwnPopper>
        ) : (
          <ModalHost
            open={open}
            exiting={mobileExiting}
            closeAfterTransition
            className={`MuiDialog-root ${shellStyles.dialog}`}
            style={{ zIndex: mobileZIndex }}
            backdropInvisible={false}
            backdropTransition={{ enter: 225, exit: 195 }}
            onClose={() => dismiss()}
          >
            <Fade
              in={open}
              onExited={() => {
                setMobileExiting(false);
                setKeyboard(false);
                if (restoreAfterMobileExit.current) {
                  restoreAfterMobileExit.current = false;
                  firstSection()?.focus();
                }
              }}
            >
              <div
                ref={mobilePaperRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title}
                tabIndex={-1}
                className={`MuiDialog-paper ${shellStyles.mobilePaper}`}
              >
                <div className={`MuiDatePickerToolbar-root ${shellStyles.toolbar}`}>
                  <div id={title} className={shellStyles.toolbarLabel}>
                    Select date
                  </div>
                  <div className={shellStyles.toolbarDate}>{date?.isValid() ? date.format('ddd, MMM D') : '—'}</div>
                  <ButtonBase
                    focusRipple
                    aria-label={keyboard ? 'go to calendar view' : 'go to text input view'}
                    onClick={() => setKeyboard((current) => !current)}
                  >
                    ✎
                  </ButtonBase>
                </div>
                {keyboard ? (
                  <DateField
                    locale={adapterLocale}
                    format={format}
                    value={date}
                    onChange={(next) => {
                      if (next?.isValid() && next.valueOf() !== value) publish(next);
                    }}
                  />
                ) : (
                  calendar
                )}
                <div className={`MuiDialogActions-root ${shellStyles.actions}`}>
                  <ButtonBase focusRipple onClick={cancel}>
                    Cancel
                  </ButtonBase>
                  <ButtonBase focusRipple onClick={() => dismiss()}>
                    OK
                  </ButtonBase>
                </div>
              </div>
            </Fade>
          </ModalHost>
        )}
      </div>
    </ClickAway>
  );
};
