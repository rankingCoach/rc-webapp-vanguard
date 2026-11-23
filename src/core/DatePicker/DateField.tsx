// Numeric section editor adapted from @mui/x-date-pickers@9.17.0 DateField/useField and PickersTextField (MIT).
import type { Moment } from 'moment';
import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { cx } from '../../primitives/react/class-names';
import { useVanguardTypography } from '../../primitives/react/typography-context';
import { createCalendarAdapter } from './calendar-adapter';
import {
  boundaries,
  describeSectionValue,
  parseFieldFormat,
  sectionValues,
  serializeSections,
  validateFieldDate,
  type DateFieldError,
} from './date-field-sections';
import './DateField.scss';

export interface DateFieldProps {
  locale: string;
  format?: string;
  value?: Moment | null;
  referenceDate?: Moment;
  minDate?: Moment;
  maxDate?: Moment;
  disablePast?: boolean;
  disableFuture?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  label?: React.ReactNode;
  /** The private picker shell owns the ring while its desktop calendar has focus. */
  focused?: boolean;
  groupLabel?: string;
  /** Mirror picker validation on the hidden serialization input. */
  reportInputValidation?: boolean;
  /** DatePicker also publishes accepted section edits that do not produce a new field value. */
  onUnpublishedSectionEdit?: () => void;
  onSectionKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  onChange?: (value: Moment | null, context: { validationError: DateFieldError }) => void;
  onError?: (error: DateFieldError, value: Moment | null) => void;
}

type Selection = number | 'all' | null;
const pickersField = 'MuiPickersTextField-';
const pickersInput = 'MuiPickersInputBase-';
const sectionList = 'MuiPickersSectionList-';

const selectContents = (target: HTMLElement) => {
  if (target !== target.ownerDocument.activeElement) target.focus({ preventScroll: true });
  const range = target.ownerDocument.createRange();
  range.selectNodeContents(target);
  const documentSelection = target.ownerDocument.getSelection();
  documentSelection?.removeAllRanges();
  documentSelection?.addRange(range);
};

export const DateField = (props: DateFieldProps) => {
  const {
    locale,
    format = 'MM/DD/YYYY',
    value: controlledValue,
    referenceDate,
    disabled = false,
    readOnly = false,
    required = false,
    label,
    focused = false,
    groupLabel,
    reportInputValidation = false,
    onUnpublishedSectionEdit,
    onSectionKeyDown,
    onChange,
    onError,
  } = props;
  const typography = useVanguardTypography();
  const adapter = useMemo(() => createCalendarAdapter(locale), [locale]);
  const model = useMemo(() => parseFieldFormat(format), [format]);
  const [uncontrolledValue, setUncontrolledValue] = useState<Moment | null>(null);
  const value = controlledValue === undefined ? uncontrolledValue : controlledValue;
  const [parts, setParts] = useState(() => sectionValues(adapter, model, value));
  const [selection, setSelection] = useState<Selection>(null);
  const [selected, setSelected] = useState(false);
  const lastValid = useRef(value?.isValid() ? value : (referenceDate ?? adapter.start(adapter.now(), 'day')));
  const lastPublication = useRef<Moment | null | undefined>(undefined);
  const previousLayout = useRef({ adapter, model });
  const editor = useRef<HTMLDivElement>(null);
  const characterQuery = useRef<{ index: number; prefix: string; expires: number } | null>(null);
  const labelId = useId();
  const serialized = serializeSections(model, parts);
  const editable = !disabled && !readOnly;
  const pickerSectionEditing = onUnpublishedSectionEdit !== undefined;
  const error = validateFieldDate(value, adapter.now(), props);
  const previousError = useRef<DateFieldError>(null);

  useLayoutEffect(() => {
    if (value?.isValid()) lastValid.current = value;
    const layoutChanged = previousLayout.current.adapter !== adapter || previousLayout.current.model !== model;
    previousLayout.current = { adapter, model };
    if (layoutChanged) characterQuery.current = null;
    if (layoutChanged || value !== lastPublication.current || (pickerSectionEditing && value === null)) {
      setParts(sectionValues(adapter, model, value));
    }
  }, [adapter, model, value, pickerSectionEditing]);

  useEffect(() => {
    if (previousError.current !== error) {
      previousError.current = error;
      onError?.(error, value);
    }
  }, [error, onError, value]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: parts re-selects the active section after each committed edit (pruning loses the native Range; B log "DateField parts commit")
  useLayoutEffect(() => {
    if (!selected || selection === null) return;
    const enabler = editor.current;
    const target =
      selection === 'all'
        ? enabler
        : enabler?.querySelector<HTMLElement>(`[data-sectionindex="${selection}"] [role="spinbutton"]`);
    if (target) selectContents(target);
  }, [parts, selected, selection]);

  const publish = (next: Moment | null) => {
    const previous = value;
    if (previous === next || (previous?.isValid() && next?.isValid() && previous.valueOf() === next.valueOf())) return;
    if (previous && next && !previous.isValid() && !next.isValid()) return;
    lastPublication.current = next;
    if (next?.isValid()) lastValid.current = next;
    if (controlledValue === undefined) setUncontrolledValue(next);
    onChange?.(next, { validationError: validateFieldDate(next, adapter.now(), props) });
  };

  const updatePart = (index: number, nextPart: string, advance = false) => {
    const draft = parts.map((part, position) => (position === index ? nextPart : part));
    if (advance && index < model.length - 1) setSelection(index + 1);
    const complete = draft.every(Boolean);
    const date =
      complete || (value && draft.some(Boolean)) ? adapter.parse(serializeSections(model, draft), format) : null;
    // The picker keeps its last draft until the parent accepts a complete, valid edit.
    if (!pickerSectionEditing || !date?.isValid()) setParts(draft);
    if (date?.isValid()) {
      publish(complete ? adapter.mergeDateAndTime(date, lastValid.current) : date);
    } else if (onUnpublishedSectionEdit && (value ? !value.isValid() : !complete)) {
      onUnpublishedSectionEdit();
    } else if (complete || value) {
      publish(date);
    }
  };

  const changeFullDate = (text: string) => {
    const date = adapter.parse(text.trim(), format);
    const next = date.isValid() ? adapter.mergeDateAndTime(date, lastValid.current) : null;
    setParts(sectionValues(adapter, model, next));
    publish(next);
  };

  const clear = () => {
    characterQuery.current = null;
    setParts(sectionValues(adapter, model, null));
    setSelection(0);
    publish(null);
  };

  const clearPart = (index: number) => {
    if (!parts[index]) return;
    characterQuery.current = null;
    setParts((previous) => previous.map((part, position) => (position === index ? '' : part)));
    publish(null);
  };

  const handleKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (onSectionKeyDown) {
      // Run the theme handler and the edit on the section-list event.
      if (event.currentTarget === editor.current) onSectionKeyDown(event);
      else if (editor.current?.contains(event.target as Node)) return;
    }
    if (!editable) return;
    const index = typeof selection === 'number' ? selection : 0;
    const section = model[index];
    if (!section) return;
    if (event.key.toLowerCase() === 'a' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      setSelection('all');
      setSelected(true);
      return;
    }
    const move = (offset: number) => setSelection(Math.max(0, Math.min(model.length - 1, index + offset)));
    const adjust = (amount: number, edge?: 'min' | 'max') => {
      if (onSectionKeyDown) event.preventDefault();
      const [min, max] = boundaries(adapter, section.token, value);
      const current = parts[index] ? Number(parts[index]) : Number(adapter.format(lastValid.current, section.token));
      const range = max - min + 1;
      const stepped = min + ((((current + amount - min) % range) + range) % range);
      const next = edge === 'min' ? min : edge === 'max' ? max : stepped;
      updatePart(index, String(next).padStart(section.token.length, '0'));
    };
    switch (event.key) {
      case 'ArrowLeft':
        move(-1);
        break;
      case 'ArrowRight':
        move(1);
        break;
      case 'ArrowUp':
        adjust(1);
        break;
      case 'ArrowDown':
        adjust(-1);
        break;
      case 'PageUp':
        adjust(5);
        break;
      case 'PageDown':
        adjust(-5);
        break;
      case 'Home':
        adjust(0, 'min');
        break;
      case 'End':
        adjust(0, 'max');
        break;
      case 'Backspace':
        if (typeof selection !== 'number' || parts[index]) return;
        if (event.target instanceof HTMLElement) selectContents(event.target);
        break;
      case 'Delete':
        if (selection === 'all' || selection === null) clear();
        else clearPart(index);
        break;
      default:
        return;
    }
    characterQuery.current = null;
    event.preventDefault();
  };

  const handleInput = (event: React.FormEvent<HTMLSpanElement>, index: number) => {
    const section = model[index];
    const text = event.currentTarget.textContent ?? '';
    event.currentTarget.textContent = parts[index] || section.token;
    if (!editable || !/^\d*$/.test(text)) {
      if (selected) selectContents(event.currentTarget);
      return;
    }
    if (!text) {
      if (parts[index]) clearPart(index);
      else if (selected) selectContents(event.currentTarget);
      return;
    }
    // DatePicker validates the assembled date after accepting a numeric section.
    const [min, max] = boundaries(adapter, section.token, pickerSectionEditing ? null : value);
    const previous = characterQuery.current;
    const now = Date.now();
    const combined = previous?.index === index && previous.expires >= now ? previous.prefix + text : text;
    const digits = combined.length <= section.token.length && Number(combined) <= max ? combined : text;
    if (digits.length > section.token.length || Number(digits) > max) return;
    const advance = digits.length === section.token.length || Number(digits) * 10 > max;
    characterQuery.current = advance ? null : { index, prefix: digits, expires: now + 5000 };
    if (Number(digits) >= min || !advance) updatePart(index, digits.padStart(section.token.length, '0'), advance);
  };

  const handlePaste = (event: React.ClipboardEvent, index: number | 'all') => {
    event.preventDefault();
    if (!editable) return;
    const text = event.clipboardData.getData('text');
    characterQuery.current = null;
    if (index === 'all' || !/^[a-zA-Z0-9]+$/.test(text)) changeFullDate(text);
    else if (/^\d+$/.test(text)) updatePart(index, text, true);
  };

  const showFocus = selected || focused;
  const inputClasses = cx(
    pickersInput + 'root',
    'MuiPickersOutlinedInput-root',
    showFocus && 'Mui-focused',
    disabled && 'Mui-disabled',
    readOnly && 'Mui-readOnly',
    error && 'Mui-error',
    pickersInput + 'fullWidth',
    pickersInput + 'colorPrimary',
  );
  const hasNotch = showFocus || Boolean(serialized);

  return (
    <div
      className={cx(
        'MuiFormControl-root',
        pickersField + 'root',
        showFocus && 'Mui-focused',
        disabled && 'Mui-disabled',
        required && 'Mui-required',
        'MuiFormControl-fullWidth',
      )}
      data-vg-core=""
      data-slot="date-field"
      data-empty={!serialized || undefined}
      data-label={Boolean(label) || undefined}
      data-vg-typography={typography}
    >
      {label && (
        <label
          id={labelId}
          className={cx(
            'MuiInputLabel-root MuiInputLabel-formControl MuiInputLabel-animated MuiInputLabel-outlined',
            hasNotch && 'MuiInputLabel-shrink',
            showFocus && 'Mui-focused',
            disabled && 'Mui-disabled',
            error && 'Mui-error',
            required && 'Mui-required',
          )}
          data-shrink={hasNotch}
          onClick={() => {
            if (editable) {
              setSelection(0);
              setSelected(true);
            }
          }}
        >
          {label}
          {required && (
            <span aria-hidden="true" className="MuiFormLabel-asterisk MuiInputLabel-asterisk">
              {'\u2009'}
              {'*'}
            </span>
          )}
        </label>
      )}
      <div
        role="group"
        className={inputClasses}
        aria-label={groupLabel}
        aria-labelledby={label && groupLabel === undefined ? labelId : undefined}
        aria-invalid={Boolean(error)}
        onKeyDown={handleKey}
        onMouseDown={(event) => {
          // MUI X useFieldRootProps.handleMouseDown: a primary press inside the field resolves its own section. A
          // separator or section padding belongs to its section; the field padding and the blank space past the
          // sections pick the first section unless a section already has focus; a gap between sections picks the
          // closest one by x.
          if (disabled || selection === 'all' || event.button !== 0) return;
          const list = editor.current;
          const target = event.target as Element;
          if (!list) return;
          const inside = list.contains(target);
          if (
            !inside &&
            target !== event.currentTarget &&
            !target.classList.contains('MuiPickersOutlinedInput-notchedOutline')
          ) {
            return;
          }
          const section = inside ? target.closest<HTMLElement>('[data-sectionindex]') : null;
          const spin = (index: number) =>
            list.querySelector<HTMLElement>(`[data-sectionindex="${index}"] [role="spinbutton"]`);
          if (section) {
            if (target.getAttribute('role') === 'spinbutton') return;
            event.preventDefault();
            spin(Number(section.dataset.sectionindex))?.focus();
            return;
          }
          const sections = [...list.querySelectorAll<HTMLElement>('[data-sectionindex]')];
          const first = sections[0]?.getBoundingClientRect();
          const last = sections[sections.length - 1]?.getBoundingClientRect();
          const outside = !inside || !first || !last || event.clientX < first.left || event.clientX > last.right;
          event.preventDefault();
          if (outside) {
            if (!list.contains(document.activeElement)) spin(0)?.focus();
            return;
          }
          let closest = 0;
          let distance = Number.POSITIVE_INFINITY;
          sections.forEach((element, index) => {
            const box = element.getBoundingClientRect();
            const d = Math.min(Math.abs(event.clientX - box.left), Math.abs(event.clientX - box.right));
            if (d < distance) {
              distance = d;
              closest = index;
            }
          });
          spin(closest)?.focus();
        }}
        onBlur={(event) => {
          const focus = event.currentTarget.ownerDocument.activeElement;
          const movedInside = event.currentTarget.contains(event.relatedTarget);
          const staleBlur = event.target !== focus && event.currentTarget.contains(focus);
          if (!movedInside && !staleBlur) {
            setSelected(false);
            setSelection(null);
          }
        }}
      >
        <div
          ref={editor}
          className={cx(sectionList + 'root', pickersInput + 'sectionsContainer')}
          contentEditable={selection === 'all'}
          suppressContentEditableWarning
          onKeyDown={onSectionKeyDown ? handleKey : undefined}
          onPaste={selection === 'all' ? (event) => handlePaste(event, 'all') : undefined}
          onInput={
            selection === 'all'
              ? (event) => {
                  const text = event.currentTarget.textContent ?? '';
                  event.currentTarget.textContent = serialized || format;
                  if (text) changeFullDate(text);
                  else clear();
                }
              : undefined
          }
          tabIndex={selection === 'all' ? -1 : undefined}
        >
          {selection === 'all'
            ? serialized || format
            : model.map(({ token, label: sectionLabel, separator }, index) => {
                const part = parts[index];
                const [min, max] = boundaries(adapter, token, value);
                return (
                  <span key={token} className={sectionList + 'section'} data-sectionindex={index}>
                    <span className={pickersInput + 'sectionBefore'} />
                    <span
                      className={cx(sectionList + 'sectionContent', pickersInput + 'sectionContent')}
                      contentEditable={editable}
                      suppressContentEditableWarning
                      spellCheck={editable ? false : undefined}
                      autoCapitalize={editable ? 'none' : undefined}
                      autoCorrect={editable ? 'off' : undefined}
                      inputMode="numeric"
                      role="spinbutton"
                      aria-label={sectionLabel}
                      aria-readonly={readOnly}
                      aria-disabled={disabled}
                      aria-valuenow={part ? Number(part) : undefined}
                      aria-valuemin={min}
                      aria-valuemax={max}
                      aria-valuetext={describeSectionValue(adapter, token, part)}
                      tabIndex={editable && index === 0 ? 0 : -1}
                      onFocus={() => {
                        if (!editable) return;
                        if (selection !== index) characterQuery.current = null;
                        setSelection(index);
                        setSelected(true);
                      }}
                      onInput={(event) => handleInput(event, index)}
                      onMouseUp={(event) => event.preventDefault()}
                      onPaste={(event) => handlePaste(event, index)}
                    >
                      {part || token}
                    </span>
                    <span className={pickersInput + 'sectionAfter'}>{separator}</span>
                  </span>
                );
              })}
        </div>
        {/* MUI X order and classes (D2): notched outline, then the hidden input with the outlined alias class. */}
        <fieldset aria-hidden="true" className="MuiPickersOutlinedInput-notchedOutline" data-notched={hasNotch}>
          <legend>
            <span>
              {label || '\u200b'}
              {label && required ? '\u2009' : ''}
              {label && required ? '*' : ''}
            </span>
          </legend>
        </fieldset>
        <input
          type="text"
          className={cx(pickersInput + 'input', 'MuiPickersOutlinedInput-input')}
          aria-hidden="true"
          aria-invalid={reportInputValidation ? Boolean(error) : undefined}
          tabIndex={-1}
          autoComplete="off"
          disabled={disabled}
          required={required}
          readOnly={readOnly}
          value={serialized}
          onChange={(event) => changeFullDate(event.currentTarget.value)}
          onFocus={() => {
            if (editable) {
              setSelection(0);
              setSelected(true);
            }
          }}
        />
      </div>
    </div>
  );
};
