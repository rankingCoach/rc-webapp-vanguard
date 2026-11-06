# Registry: dates group (DatePicker, DateRangeInput, DateRangePicker, DateRangePickerBaseInputAdornment, DateTimePicker)

Stages: S2 = material 5.16 + pickers 7.29 (covers pickers v6+v7) · S3 = core 6 · S4 = core 7 + pickers 8 · S5 = core 9 + pickers 9.
Files (abbrev): DP = src/core/DatePicker/_DatePicker.mui.spec.tsx · DPS = src/core/DatePicker/_DatePickerMuiContract.stories.tsx ·
DRI = src/core/DateRangeInput/_DateRangeInput.mui.spec.tsx · DRP = src/core/DateRangePicker/_DateRangePicker.mui.spec.tsx ·
DTP = src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx · VP = src/core/DatePicker/_date-picker-value-parser.spec.ts.
Production refs: DatePicker.tsx = src/core/DatePicker/DatePicker.tsx.

An expected red is a diagnostic prediction, NOT permission to skip/xfail/edit the test. Fix in production code or via an
approved contract change.

## A. Expected reds

| file | test title | expected red at | production dependency (file:line) | observable contract | planned production fix to return it to green |
|---|---|---|---|---|---|
| DP | renders a single text input with autocomplete disabled and the calendar closed | S2 (if renderInput not rewired), S5 (accessible section DOM, no plain editable input) | DatePicker.tsx:149-151 (renderInput sets autoComplete='off') | one field, browser autofill off | move to `slots.textField` (Vanguard Input wrapper) + `slotProps.textField={{ autoComplete:'off' }}`; v9: enableAccessibleFieldDOMStructure-compatible PickersTextField wrapper keeping a hidden input |
| DP | renders the Vanguard calendar icon next to the input (not the MUI open-picker button) | S2 | DatePicker.tsx:121-123 (Icon), :154 (`delete InputProps` removes MUI adornment) | only the Vanguard icon, no MUI "Choose date" button | `slots.openPickerButton: () => null` / `slotProps.inputAdornment` hidden; keep Vanguard Icon |
| DP | label is rendered with the "Optional" suffix when not required; required: no "Optional" suffix, asterisk...; without label no <label> | S2 (if label not routed through Vanguard Input) | DatePicker.tsx:153 (`delete label`), :160-163 (Vanguard Input label/required) | Vanguard label + Optional hint | textField slot = Vanguard Input; do not pass `label` to MUI field |
| DP | %s shows %s (17 locales) | S2 | DatePicker.tsx:47,126 (`inputFormat={datePattern}`) | locale display format | `inputFormat` -> `format={datePattern}` |
| DP | value is interpreted as a millisecond timestamp; a new value prop re-renders the displayed date | S2 (pickers v7 strict adapter date types) | DatePicker.tsx:142 (`value={value}` raw number) | `value` = ms number | convert at the boundary: `value={value != null ? moment(value) : null}` |
| DP | picking a day emits a millisecond timestamp ... keeps the time; picking a day with no value emits local midnight | S2 (only if payload conversion breaks) | DatePicker.tsx:145-147 (`newValue?.valueOf()`) | onChange(ms) | keep `onChange(newValue?.valueOf())` in the new onChange signature `(value, context)` |
| DP | typing a full date emits the ms timestamp of local midnight as the last payload; typing in %s (%s) emits the same ms timestamp and shows %s | S2 (section field typing: "/" keys, auto-advance), S5 (accessible DOM: typing goes to spinbutton sections, not the `<input>`) | DatePicker.tsx:126,149-165 | typed full date -> ms | field slot must accept keystrokes (v6+ sections); if test still fails because the DOM changed, decide contract change for "how to type" with overseer |
| DP | typing an impossible date keeps the text and marks the input aria-invalid | S2 / S5 | DatePicker.tsx:158 (params incl. `error` spread into Input) | invalid typed date flagged | forward `error` from field slot to Vanguard Input |
| DP | clearing the input emits undefined (null?.valueOf()), not null | S2 / S5 (clear gesture in section DOM) | DatePicker.tsx:147 | cleared -> undefined | keep `newValue?.valueOf()` |
| DP | click on the input opens the calendar in a portal ...; click anywhere on the field wrapper ... opens the calendar | S2 | DatePicker.tsx:127-129,162 (`open`, `onOpen`, Input `onClick={handleOpen}`) | click on field opens | keep controlled `open` + onClick on Vanguard field slot |
| DP | calendar popper requests placement bottom-end | S2 (PopperProps removed v7) | DatePicker.tsx:130-136 | calendar under field, right aligned | `slotProps.popper={{ placement:'bottom-end' }}` |
| DP | calendar paper carries the Vanguard paper class (shadow + radius) | S2 | DatePicker.tsx:138-140 (`PaperProps.className`) + DatePicker.module.scss `.paper` | Vanguard shadow/radius | `slotProps.desktopPaper={{ className: styles.paper }}` |
| DP | field is shown as focused while the calendar is open and not focused once it closes | S2 | DatePicker.tsx:152 (`focused = isOpen`); InputBase.scss:40 `.Mui-focused` | focused outline while open | `slotProps.textField={{ focused: isOpen }}` |
| DP | selecting a day closes the calendar; true: picking a day still selects and closes; without onChange, picking a day ... closes | S4 (pickers v8 closeOnSelect default false except DesktopDatePicker) | DatePicker.tsx:125 (responsive `DatePicker`, no `closeOnSelect`) | desktop: day pick closes | pass `closeOnSelect` explicitly for desktop (or use DesktopDatePicker branch) |
| DP | registers a popover slot ... z-index; stacks above a modal ...; unregisters on close ...; unregisters when unmounted while open | S2 (PopperProps.sx removed) | DatePicker.tsx:64-74,130-133 | calendar stacks above host modal | `slotProps.popper={{ sx:{ zIndex: popperZIndex } }}` |
| DP | min/max as %s disable the days outside the range; minDate/maxDate = %s means "no limit"; disablePast ... | S2 (strict moment types: already moments, low risk), S5 (`.MuiPickersDay` -> PickerDay does not matter: role-based) | DatePicker.tsx:81-89,141-144 | range limits | keep moment conversion |
| DP | error from formconfig renders the error message ...; without formconfig error no error text is rendered | S2 (if formconfig not passed to the new field slot) | DatePicker.tsx:157 | form error text | pass formconfig to Vanguard Input in textField slot |
| DP | true: mousedown on a weekday column header keeps the calendar open; true: mousedown on the day grid keeps the calendar open; true: mousedown on a year in the year view keeps the calendar open | S2 | DatePicker.tsx:100 `MuiCalendarPicker-root` (-> `.MuiDateCalendar-root` in v6) | clicks inside calendar don't close | update allow-list class (or use `slotProps.popper` ref + `contains()` instead of class names) |
| DP | true: mousedown on a week row keeps the calendar open | S2 | DatePicker.tsx:104 `MuiDayPicker-weekContainer` (-> `.MuiDayCalendar-weekContainer`) | idem | idem |
| DP | true: mousedown on a day keeps the calendar open | S5 | DatePicker.tsx:102 `MuiPickersDay-root` (-> `.MuiPickerDay-root` in v9) | idem | idem |
| DP | true: mousedown on the month label in the header / the next-month arrow keeps the calendar open | S2/S5 (only if header classes change) | DatePicker.tsx:101,103 | idem | idem |
| DP | true: mousedown outside closes ...; true: mousedown on the input ... keeps it open; false (default): mousedown outside keeps the calendar open | S2 (low risk) | DatePicker.tsx:94-113 | click-away contract | keep useOutsideCallback |
| DP | month arrows navigate without emitting onChange or closing | S2 (accessible names "Previous month"/"Next month" stable; low risk) | none (MUI) | month nav | none expected |
| DP (mobile) | click on the input opens a modal dialog (portal) with Cancel and OK ...; picking a day does not close the dialog (waits for OK); OK closes and keeps the picked date (no further onChange); Cancel closes and restores the previous value (emitted again) | S2 (mobile onChange/accept semantics change in v6), S4 (closeOnSelect defaults) | DatePicker.tsx:125 (responsive DatePicker), :127-129,147 | mobile: dialog + accept step, Cancel restores | keep responsive picker; set `closeOnSelect={false}` for mobile explicitly; if Cancel no longer re-emits, emit restore from `onClose`/`onAccept` handlers |
| DP (mobile) | registers a popover stacking slot on open and releases it on OK, Cancel, backdrop and unmount | S2 | DatePicker.tsx:64-74 | slot released | keep onOpen/onClose wiring |
| DPS | Calendar Placement Bottom End | S2 | DatePicker.tsx:130-136 | geometry bottom-end | slotProps.popper placement |
| DPS | Paper Styles | S2 | DatePicker.tsx:138-140, DatePicker.module.scss `.paper` | computed shadow/radius | slotProps.desktopPaper className |
| DPS | Icon And Input Layout | S2 / S5 (field DOM) | DatePicker.module.scss `.icon`, `.MuiOutlinedInput-input{cursor:pointer}` | icon position, pointer cursor | keep SCSS; v9: retarget `.MuiPickersInputBase-*` |
| DPS | Stacking Z Index | S2 | DatePicker.tsx:133 | z-index slot | slotProps.popper.sx |
| DPS | Click Away Enabled | S2 | DatePicker.tsx:100-104 | inside clicks keep open | allow-list update |
| DPS | Pick Day Closes And Shows Value | S4 | responsive closeOnSelect | desktop closes on pick | closeOnSelect explicit |
| DPS | Mobile Dialog Layout; Mobile Pick Then Ok; Mobile Pick Then Cancel | S2/S4 | responsive DatePicker | mobile dialog + accept | as DP mobile |
| DRI | renders one text input with the calendar button as end adornment inside the field; disabled disables both...; the calendar button shows the calendar icon | S5 (core v9 removes TextField `InputProps`; deprecated since S3) | DateRangeInput.tsx:107-121 (`textFieldProps.InputProps.endAdornment`), InputBase.tsx:533-541 | calendar button inside the field | InputBase: map legacy `InputProps` -> `slotProps.input` (S1/S3) |
| DRP | each input has a calendar icon end adornment placed after the input; adornment tests | S5 | InputBase.tsx:540-543 (`endAdornment` -> `textFieldProps.InputProps`) | icon inside field | idem |
| DRP | two read-only inputs ...; state="static-range-picker" starts in the date view; clicking the date input switches ... (readonly attr) | S5 (`inputProps` removed in core v9) | DateRangePicker.tsx:578-580,623-625 (`textFieldProps.inputProps.readOnly`, data-testid) | readOnly fields, QA test ids | map `inputProps` -> `slotProps.htmlInput` |
| DRP | the date input is an IMask field ("d m - d m"): clearing shows the mask placeholder; initial render mask placeholder | S5 | DateRangePicker.tsx:575-577 (`InputProps.inputComponent`) | IMask behaviour | `slotProps.input.inputComponent` |
| DRP | popper tests (role="tooltip", inline z-index, Fade exit) | S3/S5 (low risk: Popper/Fade stable) | DateRangePicker.tsx:642-652 | popper portal + stacking | none expected |
| DTP | all DatePicker-backed tests (rendering, onChange payloads, limits) | as DP (S2/S4/S5) | DateTimePicker.tsx:95-105 -> DatePicker | date seconds/ms mapping | fixed by the DatePicker fixes |
| DTP | half-hour time list; minTime/maxTime disable the options ...; picking a time ... | S3-S5 (Select menu, owned by Select group) | TimePicker -> Select -> InputBase select | time options | Select group fixes |

## B. Baseline characterization (`[bug-lock]` / `[v5-quirk]`)

Expected reds for these are also likely (noted in the last column) but they are NOT contracts: if one goes red, decide
with the overseer whether the new behaviour is acceptable (contract change) or must be restored.

| file | test title | tag | what it locks | why it is suspect |
|---|---|---|---|---|
| DP | [v5-quirk] input is rendered as type="tel" (numeric keyboard on mobile) | v5-quirk | masked v5 field type | MUI v5 choice; v6 field uses text + inputMode (red S2). Production dep: none |
| DP | [bug-lock] clicking the Vanguard calendar icon does not open the calendar | bug-lock | icon is decorative | users expect the calendar icon to open the picker |
| DP | [v5-quirk] %s empty field placeholder is the lower-case pattern %s | v5-quirk | "mm/dd/yyyy" placeholders | v6 uses section placeholders "MM/DD/YYYY" (red S2) |
| DP | [bug-lock] %s (not in the pattern map) falls back to DD.MM.YYYY and logs an error | bug-lock | hyphen locales (en-US, de-DE) fall back | stories/app store use hyphen locales; helper keys are underscore |
| DP | [bug-lock] a unix-seconds value is NOT normalised (only minDate/maxDate are) | bug-lock | seconds value -> 1970 | min/max normalise 13-digit, value does not; inconsistent API |
| DP | [bug-lock] the picker is fully controlled: without a parent updating `value` the input keeps the old date | bug-lock | dead `internalValue` state | component looks uncontrolled-capable but is not |
| DP | [v5-quirk] typing a full date: NaN for every incomplete keystroke, 8 calls for 10 keys | v5-quirk | per-keystroke NaN payloads | v6 per-keypress semantics, v8 null for partial (red S2/S4) |
| DP | [v5-quirk] typing a partial date emits NaN (invalid moment) and keeps the partial text | v5-quirk | NaN for partial | v8: partial stays null -> payload undefined (red S4) |
| DP | [v5-quirk] typing an impossible date emits NaN on every keystroke | v5-quirk | NaN payloads | idem (red S2/S4) |
| DP | [v5-quirk] deleting one character of a complete date emits NaN | v5-quirk | NaN on backspace | v6 sections clear a section instead (red S2) |
| DP | [v5-quirk] year view: picking a year emits onChange immediately and stays open on the day view | v5-quirk | partial year commit | v6+ year view may not emit until day (red S2 possible) |
| DP | [v5-quirk] typing a date after maxDate still emits it, and flags the input aria-invalid | v5-quirk | out-of-range typed value reaches consumer | consumer must re-validate |
| DP | [v5-quirk] typing a date before minDate still emits it, and flags the input aria-invalid | v5-quirk | idem | idem |
| DP | [bug-lock] formconfig error is NOT reflected as aria-invalid (MUI validation state wins) | bug-lock | params.error overrides hasError | error text shown but field not invalid (a11y) ; may flip at S4 (field slot no longer gets error) |
| DP | [bug-lock] formconfig._inputRef is NOT bound to the input (MUI inputRef wins) | bug-lock | `_inputRef.current === null` | form helpers reading _inputRef see null; may flip at S4 (no inputRef in slot props) |
| DP | [v5-quirk] false (default): a full click outside still closes it (MUI popper click-away) | v5-quirk | closeOnCLickAway=false is not sticky | prop name suggests otherwise |
| DP | [bug-lock] true: mousedown on the paper outside the allow-listed regions closes the calendar | bug-lock | paper padding closes | click inside the calendar surface closes it |
| DP (mobile) | [v5-quirk] the field is a read-only text input labelled "Choose date, selected date is ..." | v5-quirk | mobile read-only field + MUI aria-label | MUI v5 mobile choice; v6 mobile field differs (red S2) |
| DP (mobile) | [bug-lock] clicking the Vanguard calendar icon does not open the dialog | bug-lock | decorative icon | idem desktop |
| DP (mobile) | [v5-quirk] picking a day emits onChange and updates the field before OK is pressed | v5-quirk | onChange before accept | v6+ may emit only on accept (red S2) |
| DP (mobile) | [v5-quirk] Escape closes and keeps the picked date (no restore) | v5-quirk | dismiss keeps committed | inconsistent with Cancel |
| DP (mobile) | [v5-quirk] backdrop click closes and keeps the picked date (no restore) | v5-quirk | idem | idem |
| DP (mobile) | [v5-quirk] keyboard view (pen button) lets the user type a date; only the complete date is emitted | v5-quirk | mobile keyboard view | removed in pickers v6 (red S2) |
| DP (mobile) | [bug-lock] the dialog keeps MUI's static z-index (1300) and paints behind a raised host modal | bug-lock | slot registered but not applied | mobile dialog behind stacked modals/drawers; fix: DialogProps/slotProps.dialog sx zIndex |
| DP (mobile) | [v5-quirk] the Vanguard paper class is not applied to the mobile dialog | v5-quirk | no Vanguard paper styles on mobile | inconsistent styling |
| DPS | [v5-quirk] Click away disabled still closes on click | v5-quirk | as DP | as DP |
| DPS | [bug-lock] Mobile dialog z index | bug-lock | as DP mobile | as DP mobile |
| VP | [bug-lock] a moment is formatted as "MM/DD/yyyy " (trailing space) regardless of locale | bug-lock | trailing space, US format | formatDate template leaves `' '` |
| DRI | [bug-lock] a confirmed response with dates is applied even when isOk is false | bug-lock | isOk ignored | Cancel with data would write |
| DRP | [bug-lock] startDate/endDate that match no preset: nothing reflects them until the date view is opened | bug-lock | dead "no preset matched" branch | passed range invisible, wrong preset label |
| DRP | [bug-lock] startDate/endDate matching a custom range: initial preset label is still the default range | bug-lock | effect order overwrites label | wrong label |
| DRP | [bug-lock] clicking the preset container (not the input) opens the popper, which then ignores outside clicks | bug-lock | stuck popper | cannot close by clicking outside |
| DRP | [bug-lock] first open emits onChange(MANUAL) with the unchanged range | bug-lock | spurious MANUAL | consumers think the user changed something |
| DRP | [bug-lock] clicking a preset button outside its label text selects it but keeps the popper open | bug-lock | inconsistent close | depends on click position |
| DRP | [bug-lock] onDateRangeSelected fires on open with the unchanged range | bug-lock | spurious selection callback | idem |
| DRP | [bug-lock] typing into the IMask field loses the typed start day, keeps the typed end day | bug-lock | IMask overwrite/eager | typed input lost |
| DRP | [v5-quirk] without onDateRangeSelected two day clicks update the input and keep the popper open | v5-quirk | close only wired to onDateRangeSelected | odd UX |
| DTP | [bug-lock] typing a partial date or clearing it does not emit (falsy/NaN DatePicker payloads are ignored) | bug-lock | clear never reported | consumer keeps stale date; may change at S4 (partial -> undefined, still ignored) |

## M2 check (MUI internals asserted, kept with production dependency)

1. `.Mui-focused` (DP focused test): InputBase.scss:40 (`&.Mui-focused`), DatePicker.tsx:152.
2. `data-popper-placement="bottom-end"` (DP, DPS): DatePicker.tsx:135 (placement option); observable placement.
3. Click-away allow-list regions (DP closeOnCLickAway): DatePicker.tsx:100-104.
4. `styles.paper` class on paper (DP, DPS): DatePicker.tsx:139.
5. `type="tel"`, mobile `readonly`/accessible name, placeholders: no production dependency, but user-observable (keyboard type, editability, a11y name, hint text): kept as `[v5-quirk]`, not deleted.
6. Mobile portal root (`firstElementChild` = backdrop, computed z-index): used only to click outside the dialog / read computed z-index; observable.
7. DRI `input.parentElement.contains(button)`: DateRangeInput.tsx:109 (`InputProps.endAdornment`) - observable "button inside field".
No assertion matched rule 1.4(a) (MUI internal with no dependency and no observable meaning); nothing deleted.

### Added S2 mask characterization (not a promised new API)

`_DatePickerCompatibility.mui.spec.tsx` retains the v5 digit-shifting result when inserting after separator
Backspace/Delete (`03/21/5202`, caret4). This was reproduced in the retained S1/v5 packed consumer; see
verification-s2.md. Separator deletion itself must preserve the date/caret and emit no callback. The new
`[v5-quirk]` insertion assertions describe baseline behavior and do not authorize an unrelated correction.
