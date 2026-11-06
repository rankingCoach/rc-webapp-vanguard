# MUI v5 -> v9 breaking changes that touch Vanguard

Source: official guides (upgrade-to-v6, -v7, -v9, migrating-from-deprecated-apis; pickers migration v5..v8),
read 2026-11-03. Core v8 does not exist (v7 -> v9). "(UNVERIFIED)" = not stated on those pages.

## Core: by component we wrap

| Vanguard file | MUI API we use | Change | Removed in |
|---|---|---|---|
| `_internal/InputBase`, `Input`, `Textarea`, `PhoneNumberBase`, `VerificationPinInput`, public `textFieldProps` | TextField `InputProps`, `inputProps`, `InputLabelProps`, `SelectProps`, `FormHelperTextProps` | -> `slotProps.input` / `htmlInput` / `inputLabel` / `select` / `formHelperText` | v9 (deprecated since v6) |
| same | `<TextField select>` | InputLabel renders `<div>` instead of `<label>` | v9 |
| same | InputBase composed classes (`inputSizeSmall`, `inputMultiline`, `inputAdornedStart/End`) | -> `.MuiInputBase-sizeSmall > .MuiInputBase-input` etc. Our SCSS has an EMPTY rule for `.MuiInputBase-inputMultiline` (InputBase.scss:252-253), so nothing depends on it | v9 |
| `Autocomplete`, `SearchableSelect`, `AutocompleteWithAnchor` | `renderTags` | -> `renderValue(value, getItemProps, ownerState)` | v9 |
| same | `ChipProps`, `ListboxProps`, `ListboxComponent`, `PaperComponent`, `PopperComponent`, `componentsProps` | -> `slotProps.chip/listbox`, `slots.listbox/paper/popper` | v9 |
| same | `params.inputProps` in `renderInput` | -> `params.slotProps.htmlInput` | v9 |
| same | `onInputChange` reason | adds `blur`, `selectOption`, `removeOption` | v6 |
| same | right-click on input | no longer toggles listbox | v9 |
| `Menu`, `DropdownMenu`, `Select` (`MenuProps`) | `MenuListProps`, `PaperProps`, `TransitionProps` | -> `slotProps.list/paper/transition` | v9 |
| `Menu`, `MenuItem` | MenuList tabindex | roving tabindex: focused item `0`, others `-1`; `autoFocus` list stays `-1` | v9 |
| `MenuItem` | render outside Menu/MenuList | throws | v9 |
| `MenuItem`, `ToggleButton`, `Button` (ButtonBase) | Enter/Space | click bubbles, `onClick` gets `MouseEvent`; disabled non-native elements run no handlers; `nativeButton` prop + dev warning when `component` changes element | v9 |
| `Drawer` | `PaperProps`, `SlideProps`, `BackdropProps`, `BackdropComponent`; `paperAnchor*` classes | -> `slotProps.paper/transition/backdrop`, `slots.backdrop`; `.MuiDrawer-anchorLeft > .MuiDrawer-paper` | v9 (`ModalProps` UNVERIFIED) |
| `PopoverModal`, `Drawer`, Modal-based | Backdrop | no longer sets `aria-hidden="true"` on root; `components/componentsProps/TransitionComponent` removed | v9 |
| Modal-based | `disableEscapeKeyDown` | removed; check `reason !== 'escapeKeyDown'` in `onClose` | v9 |
| Modal-based | `onBackdropClick` | removed; `onClose` reason `backdropClick` | v7 |
| `Popover` (Tooltip) | `PopperProps`, `PopperComponent`, `TransitionComponent/Props`, `components/componentsProps` | -> `slots`/`slotProps` | v9 (`tooltipClasses` UNVERIFIED) |
| `PopoverPopper`, `Popper` users | `components/componentsProps` | -> `slots/slotProps` | v9 |
| `Snackbar`, `SnackbarRoot` | `TransitionComponent`, `TransitionProps`, `ContentProps`, `ClickAwayListenerProps` | -> `slots.transition`, `slotProps.transition/content/clickAwayListener` | v9 |
| `Slider` | `components/componentsProps`; composed classes `thumbSizeSmall`, `thumbColorPrimary` | -> `slots/slotProps`; `.MuiSlider-sizeSmall > .MuiSlider-thumb`. Pointer events: `onMouseDown` preventDefault no longer cancels drag | v9 |
| `ToggleButtonGroup` | classes `groupedHorizontal/Vertical` | -> `.MuiToggleButtonGroup-horizontal > .MuiToggleButtonGroup-grouped` | v9 |
| `ProgressBar` (LinearProgress) | classes `barColorPrimary`, `bar1Determinate`, ... | -> `.MuiLinearProgress-colorPrimary > .MuiLinearProgress-bar` | v9 |
| `Accordion` | `TransitionComponent/Props`; `.MuiAccordionSummary-contentGutters` | -> `slots/slotProps.transition`; summary wrapped in `<h3>` (v6), summary root is `<button>`, content `<span>` (v6.3) | v9 / v6 |
| `Box` users | system props (`mt`, `bgcolor`, ...) | -> `sx`; `color` forwarded to element | v9 |
| `Button`, `Chip`, ToggleButton | ripple | async: tests need `await` around mouseDown | v6 |
| `Chip` | Escape no longer blurs | | v6 |
| `AppBar`, `Toolbar`, `Collapse`, `Fade`, `Autocomplete`, `Popover` | deep imports `@mui/material/X/X`, `Tooltip/tooltipClasses` | max one level deep (`@mui/material/X`) | v7 |
| `hex-to-rgba` | `hexToRgb` from `@mui/system` | not mentioned (UNVERIFIED) | |
| all | `@mui/lab` ToggleButton/Autocomplete/Skeleton | moved to `@mui/material` (we already import from material) | v7 |

## Date pickers (5.0.16 -> 9.17.0)

| Change | Version |
|---|---|
| `renderInput` removed -> `slots.textField` / `slotProps.textField` | v6 |
| `inputFormat` -> `format` | v6 |
| `PopperProps` -> `slotProps.popper`; `PaperProps` -> `slotProps.desktopPaper`; `TransitionComponent` -> `slots.desktopTransition` | v6 (old removed v7) |
| `components`/`componentsProps` removed | v7 |
| `LocalizationProvider` `locale` -> `adapterLocale` | v6 |
| `CalendarPicker` -> `DateCalendar` (class `.MuiCalendarPicker-root` -> `.MuiDateCalendar-root`), `DayPicker` -> `DayCalendar` (`.MuiDayPicker-weekContainer` -> `.MuiDayCalendar-weekContainer`) | v6 |
| `onChange` fires on nearly every keypress in fields | v6 |
| input values contain bidi control characters (tests must strip) | v6 |
| date props strictly typed to adapter date type (moment) | v7 |
| `closeOnSelect` default false except `DesktopDatePicker` | v8 |
| accessible section DOM default (`enableAccessibleFieldDOMStructure`) | v8 |
| `onChange` for partial dates stays `null` until complete | v8 |
| field slot no longer receives `InputProps`, `inputProps`, `value`, `onChange`, `ref`, ... (use `usePickerContext()`) | v8 |
| `MuiPickersPopper` -> `MuiPickerPopper` | v8 |
| accessible DOM only; custom `textField` rendering a plain `<input>` CRASHES; `textField` slot takes `PickersTextFieldProps` only | v9 |
| `PickersDay` -> `PickerDay` (`.MuiPickersDay-root` -> `.MuiPickerDay-root`) | v9 |
| `unstableFieldRef` -> `fieldRef` | v9 |
| material/system must be `^7.3.0 || ^9.0.0` | v9 |

Our DatePicker today: `renderInput` that renders vanguard `<Input>` with mutated params, `inputFormat`,
`PopperProps`, `PaperProps`, and click-away allow-list of `.MuiCalendarPicker-root`, `.MuiPickersDay-root`,
`.MuiPickersCalendarHeader-root`, `.MuiPickersArrowSwitcher-root`, `.MuiDayPicker-weekContainer`.

## Platform

1. Browser baseline v9: Chrome 117 (was 109), Edge 121, Firefox 121 (was 115), Safari 17.0 macOS+iOS (was 15.4).
2. TypeScript >= 4.9 (v7). `@types/react*` must match React major.
3. Codemods: `npx @mui/codemod v6.0.0/preset-safe`, `v7.0.0/lab-removed-components`, `v9.0.0/system-props`,
   `deprecations/all` (or per component, e.g. `deprecations/text-field-props`); pickers
   `npx @mui/x-codemod v6.0.0/pickers/preset-safe`, `v7.0.0/pickers/preset-safe`, `v8.0.0/pickers/preset-safe`,
   `v9.0.0/pickers/preset-safe`, `v9.0.0/pickers/migrate-text-field-props`.

## MUI class names Vanguard depends on

SCSS (12 files): `.MuiOutlinedInput-root/-input`, `.MuiTooltip-tooltip/-arrow/-popper`,
`.MuiSlider-track/-thumb/-root/-rail/-dragging/-markLabel/-valueLabel(Open)`, `.MuiInputAdornment-root/-positionEnd/-positionStart`,
`.MuiInputLabel-root/-shrink/-asterisk`, `.MuiFormHelperText-root`, `.MuiAutocomplete-input/-popupIndicator/-paper/-listbox/-inputRoot/-endAdornment/-clearIndicator`,
`.MuiMenu-root/-paper/-list`, `.MuiMenuItem-root`, `.MuiList-root`, `.MuiPaper-root`, `.MuiSvgIcon-root`, `.MuiSelect-select/-icon`,
`.MuiInputBase-inputMultiline` (removed in v9; empty rule, no dependency), `.MuiFormControl-root`, `.MuiButtonBase-root`, `.MuiAccordion*`.

Runtime TS/TSX: `.MuiPopper-root`, `.MuiCalendarPicker-root` (renamed v6), `.MuiPopover-root`, `.MuiPickersPopper-root`
(renamed v8), `.MuiModal-root`, `.MuiAutocomplete-popper/-option`, `.MuiToggleButtonGroup-vertical`, `.MuiSnackbar-root`,
`.MuiSlider-*`, `.MuiMenu-paper`, `.MuiLinearProgress-bar`, `.MuiDrawer-root`, `.MuiChip-root`, `MuiPickersDay-root` (renamed v9),
`MuiPickersCalendarHeader-root`, `MuiPickersArrowSwitcher-root`, `MuiDayPicker-weekContainer` (renamed v6), `MuiInputLabel-*`.


### S5a authorized editor intentional incompatibilities (2026-11-05)

The genuine v9 section editor rejects out-of-range month/day typing such as
13/45/2024. Invalid-date validation must be exercised with accepted in-range
sections (first candidate: February 31), retaining invalid payload/validation checks.
Separators navigate sections or do nothing; they do not shift date digits through
a raw mask. Entry uses sections or the real hidden serialized input, for example:

```tsx
const section = screen.getAllByRole('spinbutton')[0];
fireEvent.focus(section);
fireEvent.paste(section, { clipboardData: { getData: () => '03/21/5202' } });
// Atomic accepted value entry through the real v9 serialization API:
fireEvent.change(container.querySelector('input[aria-hidden="true"]')!, {
  target: { value: '03/21/5202' },
});
```

Read serialized values from `input[aria-hidden="true"]`; edit the actual
contentEditable spinbuttons. Optional labels include the suffix in their accessible
names, e.g. `Date Optional`. Helper QA id `vanguard-input-error-text` remains on
Vanguard Text. The styled DateField/PickersTextField/SectionList path is retained.
No additional QA id relocation is implemented or claimed. Full callback-count and
frozen-action equivalence remains pending; examples are API guidance, not a claim
that every old test has been migrated. Vanguard major version recommended.
No version bump is authorized.

### S5a main picker candidate: onChange payload changes and focus policy

Pending awake validation. `onChange` may fire with valid intermediate years while typing
 the year (0002, 0020, 0202, then 2024 in the characterized sequence). A valid numeric
 timestamp alone does not mean the user has finished entering the intended date.
 Upstream MUI consumers can validate on blur/accept, or use upstream `onAccept`.
 Vanguard's public `DatePickerProps` exposes neither `onAccept` nor `onBlur`; those are
 not Vanguard props. Vanguard consumers should keep a draft through `onChange`, validate
 application date/year limits and completeness at their own form submission/confirmation,
 and only then persist it. A new wrapper API would require separate ROOT authorization.

For the characterized Delete action on an unselected complete field, upstream MUI clears
 to `null`; Vanguard's `date?.valueOf()` publishes **undefined**, allowed by its existing
 `number | null | undefined` callback type. This replaces the old NaN deletion quirk.
 Full select-all/Delete also publishes undefined. Accepted incomplete numeric section edits
 still publish NaN through the existing compatibility mapping; do not claim that every
 partial edit now publishes null or undefined. Public values here are milliseconds.

Escape returns actual DOM focus into the editor, so its focus ring stays visible. Moving
 focus outside the field removes the ring. The calendar-open focus assertions remain intact.
 Mobile fields expose a labelled group of read-only sections; use the actual group for
 opening and accessibility checks and the aria-hidden input only to read serialization.
