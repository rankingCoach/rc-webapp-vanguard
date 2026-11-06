# S2 picker bridge — started 2026-11-04

S1 FINAL accepted by overseer. S0/S1 history, root graph/type limitations, exact outer-suite-exit capture caveat
and S0 unreachable-handler coverage exception remain recorded. No commits/pushes or public contract approvals.

## Verified bridge before installation

Exact target pickers7.29.4 retains material/system5.16.14,EmotionReact11.14.0/Styled11.14.1,React/DOM19.2.0,
Moment2.30.1 and date-fns2.30.0. Public npm metadata for7.29.4 declares React/DOM^17||^18||^19,
material/system^5.15.14||^6||^7,Moment^2.29.4,EmotionReact^11.9.0/Styled^11.8.1. No incompatible retained core.

Fresh isolated consumer `/tmp/mui-upgrade/s2-bridge-peers` installed those pins with npm11.6.2 strict peers,
explicit public registry and ignored lifecycle scripts, exit0; no force/legacy. `verified.json` records installed
versions and AdapterMoment checks: valid Moment accepted, invalid Moment rejected, year2024 extracted.

Official references read before installing:
- https://mui.com/x/migration/migration-pickers-v5/
- https://mui.com/x/migration/migration-pickers-v6/

Migration implications include adapter-native values, inputFormat→format, renderInput→picker field/textField
slots, popper/paper slot props and responsive mobile acceptance behavior. Picker slots are distinct from
unsupported core-v5 TextField slotProps. Public Vanguard APIs and all baseline characterizations must survive.

Root bumped only package.json picker5.0.16→7.29.4 and ran `pnpm install --ignore-scripts`, exit0, updating lock.
Raw `/tmp/mui-upgrade/s2-install.log`; root development graph still reports other existing legacy peer issues.
Production picker implementation is unchanged at this point. The complete src spec/story SHA256 snapshot is
`/tmp/mui-upgrade/s2-characterization-before.json`; implementation worker must preserve it.

Next mandatory evidence: unchanged affected spec/browser/type fixture RED after bump, before any production
compatibility edits; exact failures and reasons retained. Then production-only compatibility, unchanged tests
GREEN, normal strict packed consumers including MUI-present probes, bounded sequential stage gates, fresh
read-only reviewer and overseer. No bug-lock rewrites, skips, thresholds reduction, baseline expansion or
intentional behavior change has been authorized.

## Implementation checkpoint — incomplete, not accepted

Read user rules, latest plan append, S1 verification, dates registry, gate/package README and affected
characterizations. Re-read official v5→v6 and v6→v7 migration guides during this implementation.
No commits, pushes, new worktrees, delegation, messages, assertion/story changes or waivers.

### Mandatory pre-production RED

All three commands completed serially before the first production edit, each in its own process group
with a 1800-second watchdog. No timeout occurred. Controller `/tmp/mui-upgrade/s2-red.py`.

- `pnpm vitest run --project spec src/core/DatePicker src/core/DateTimePicker src/core/TimePicker src/core/DateRangeInput src/core/DateRangePicker --maxWorkers=1 --no-file-parallelism`: exit **1**, 52.35s; raw `/tmp/mui-upgrade/s2-red-spec.log`.

- `pnpm vitest run --project storybook src/core/DatePicker/_DatePickerMuiContract.stories.tsx --maxWorkers=1 --no-file-parallelism`: exit **1**, 13.19s; raw `/tmp/mui-upgrade/s2-red-stories.log`.

- `bash agentic-plans/mui-upgrade-gates/tsc-contract.sh`: exit **2**, 4.96s; raw `/tmp/mui-upgrade/s2-red-types.log`.

Spec: all10 requested files ran; 116 failed/104 passed (220), 2 failed/8 passed files.
Browser: 11/11 failed. Types: TS2322 DatePicker.tsx142 number not assignable to Moment.
The dominant runtime failure is `TypeError: value.isValid is not a function`; empty values also expose
loss of renderInput/label wiring. Exact failing names follow (unchanged raw logs retained):

```text
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: rendering > [v5-quirk] input is rendered as type="tel" (numeric keyboard on mobile)
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: rendering > renders the Vanguard calendar icon next to the input (not the MUI open-picker button)
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: rendering > label is rendered with the "Optional" suffix when not required
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: rendering > required: no "Optional" suffix, asterisk in label, input has the required attribute
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: locale format pattern > en_US shows 03/15/2024
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: locale format pattern > en_GB shows 15/03/2024
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: locale format pattern > de_DE shows 15.03.2024
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: locale format pattern > de_AT shows 15.03.2024
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: locale format pattern > fr_FR shows 15/03/2024
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: locale format pattern > nl_NL shows 15-03-2024
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: locale format pattern > es_ES shows 15/03/2024
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: locale format pattern > it_IT shows 15/03/2024
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: locale format pattern > pl_PL shows 2024-03-15
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: locale format pattern > pt_PT shows 15/03/2024
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: locale format pattern > ja_JP shows 2024/03/15
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: locale format pattern > id_ID shows 15/03/2024
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: locale format pattern > fi_FI shows 15.03.2024
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: locale format pattern > sk_SK shows 15.03.2024
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: locale format pattern > sv_SE shows 2024-03-15
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: locale format pattern > cs_CZ shows 15.03.2024
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: locale format pattern > el_GR shows 15/03/2024
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: locale format pattern > [bug-lock] en-US (not in the pattern map) falls back to DD.MM.YYYY and logs an error
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: locale format pattern > [bug-lock] de-DE (not in the pattern map) falls back to DD.MM.YYYY and logs an error
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: locale format pattern > [bug-lock] fr-FR (not in the pattern map) falls back to DD.MM.YYYY and logs an error
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: locale format pattern > [bug-lock] en-GB (not in the pattern map) falls back to DD.MM.YYYY and logs an error
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: locale format pattern > [bug-lock] xx_XX (not in the pattern map) falls back to DD.MM.YYYY and logs an error
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: value > value is interpreted as a millisecond timestamp
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: value > [bug-lock] a unix-seconds value is NOT normalised (only minDate/maxDate are)
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: value > invalid value (NaN) renders an empty input flagged aria-invalid
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: value > a new value prop re-renders the displayed date
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: value > [bug-lock] the picker is fully controlled: without a parent updating `value` the input keeps the old date
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: onChange payload > picking a day emits a millisecond timestamp (moment.valueOf()) and keeps the time of the current value
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: onChange payload > [v5-quirk] deleting one character of a complete date emits NaN
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: onChange payload > clearing the input emits undefined (null?.valueOf()), not null
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: onChange payload > without onChange, picking a day does not throw and closes the calendar
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: open / close > click on the input opens the calendar in a portal outside the component, on the month of the value
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: open / close > field is shown as focused while the calendar is open and not focused once it closes
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: open / close > Escape closes the calendar without emitting onChange
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: open / close > selecting a day closes the calendar
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: open / close > month arrows navigate without emitting onChange or closing
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: open / close > [v5-quirk] year view: picking a year emits onChange immediately and stays open on the day view
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: overlay stacking (OverlayStackingService) > unregisters on close (Escape) and on close by day selection
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: minDate / maxDate / disablePast > min/max as unix seconds disable the days outside the range
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: minDate / maxDate / disablePast > min/max as milliseconds (13 digits, normalised) disable the days outside the range
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: minDate / maxDate / disablePast > minDate/maxDate = 0 means "no limit"
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: minDate / maxDate / disablePast > minDate/maxDate = NaN means "no limit"
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: minDate / maxDate / disablePast > clicking a disabled day does not emit onChange and keeps the calendar open
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: minDate / maxDate / disablePast > a past value with disablePast is shown but flagged aria-invalid
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: formconfig > [bug-lock] formconfig._inputRef is NOT bound to the input (MUI inputRef wins)
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: closeOnCLickAway > false (default): mousedown outside keeps the calendar open
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: closeOnCLickAway > [v5-quirk] false (default): a full click outside still closes it (MUI popper click-away)
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: closeOnCLickAway > true: mousedown outside closes the calendar and releases the stacking slot
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: closeOnCLickAway > true: mousedown on the input (inside the component) keeps it open
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: closeOnCLickAway > true: mousedown on a day keeps the calendar open
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: closeOnCLickAway > true: mousedown on the month label in the header keeps the calendar open
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: closeOnCLickAway > true: mousedown on the next-month arrow keeps the calendar open
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: closeOnCLickAway > true: mousedown on a week row keeps the calendar open
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: closeOnCLickAway > true: mousedown on a weekday column header keeps the calendar open
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: closeOnCLickAway > true: mousedown on the day grid keeps the calendar open
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: closeOnCLickAway > true: mousedown on a year in the year view keeps the calendar open
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: closeOnCLickAway > [bug-lock] true: mousedown on the paper outside the allow-listed regions closes the calendar
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: closeOnCLickAway > true: picking a day still selects and closes
 FAIL  |spec| src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx > DateTimePicker contract: rendering > shows the date (unix seconds) in the locale format and the time in the select
 FAIL  |spec| src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx > DateTimePicker contract: rendering > de_DE locale formats the date as DD.MM.YYYY
 FAIL  |spec| src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx > DateTimePicker contract: rendering > showAmPm displays the time as "hh:mm AM/PM"
 FAIL  |spec| src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx > DateTimePicker contract: onChange payload > on mount: (unix seconds of local midnight, "HH:mm", combined moment)
 FAIL  |spec| src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx > DateTimePicker contract: onChange payload > on mount with only a date: dateTime is undefined
 FAIL  |spec| src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx > DateTimePicker contract: onChange payload > picking a day emits the new day as unix seconds (midnight) and keeps the time
 FAIL  |spec| src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx > DateTimePicker contract: onChange payload > picking a day without a time emits (seconds, undefined, undefined)
 FAIL  |spec| src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx > DateTimePicker contract: onChange payload > picking a time emits the "HH:mm" string and the combined moment
 FAIL  |spec| src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx > DateTimePicker contract: onChange payload > showAmPm: picking "02:00 PM" still emits 24h "14:00"
 FAIL  |spec| src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx > DateTimePicker contract: onChange payload > [bug-lock] typing a partial date or clearing it does not emit (falsy/NaN DatePicker payloads are ignored)
 FAIL  |spec| src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx > DateTimePicker contract: onChange payload > without onChange interactions do not throw
 FAIL  |spec| src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx > DateTimePicker contract: limits > minDate/maxDate (unix seconds) disable days outside the range in the calendar
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: locale format pattern > [v5-quirk] en_US empty field placeholder is the lower-case pattern mm/dd/yyyy
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: locale format pattern > [v5-quirk] en_GB empty field placeholder is the lower-case pattern dd/mm/yyyy
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: locale format pattern > [v5-quirk] de_DE empty field placeholder is the lower-case pattern dd.mm.yyyy
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: locale format pattern > [v5-quirk] nl_NL empty field placeholder is the lower-case pattern dd-mm-yyyy
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: locale format pattern > [v5-quirk] pl_PL empty field placeholder is the lower-case pattern yyyy-mm-dd
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: locale format pattern > [v5-quirk] ja_JP empty field placeholder is the lower-case pattern yyyy/mm/dd
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: onChange payload > picking a day with no value emits local midnight of that day (not "now" time)
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: onChange payload > typing a full date emits the ms timestamp of local midnight as the last payload
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: onChange payload > [v5-quirk] typing a full date: NaN for every incomplete keystroke, 8 calls for 10 keys
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: onChange payload > typing in de_DE (20.03.2024) emits the same ms timestamp and shows 20.03.2024
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: onChange payload > typing in en_GB (20032024) emits the same ms timestamp and shows 20/03/2024
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: onChange payload > typing in fr_FR (20/03/2024) emits the same ms timestamp and shows 20/03/2024
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: onChange payload > [v5-quirk] typing a partial date emits NaN (invalid moment) and keeps the partial text
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: onChange payload > typing an impossible date keeps the text and marks the input aria-invalid
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: onChange payload > [v5-quirk] typing an impossible date emits NaN on every keystroke
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: minDate / maxDate / disablePast > [v5-quirk] typing a date after maxDate still emits it, and flags the input aria-invalid
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: minDate / maxDate / disablePast > [v5-quirk] typing a date before minDate still emits it, and flags the input aria-invalid
 FAIL  |spec| src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx > DateTimePicker contract: onChange payload > typing a full date emits it as unix seconds (midnight)
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: open / close > click anywhere on the field wrapper (not only the <input>) opens the calendar
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: open / close > calendar popper requests placement bottom-end
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: open / close > calendar paper carries the Vanguard paper class (shadow + radius)
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: overlay stacking (OverlayStackingService) > registers a popover slot on open and applies it as the popper z-index
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: overlay stacking (OverlayStackingService) > stacks above a modal that raised the stacking floor
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: overlay stacking (OverlayStackingService) > unregisters when unmounted while open
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: minDate / maxDate / disablePast > disablePast disables the days before today (frozen clock) and the previous-month arrow
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: formconfig > error from formconfig renders the error message; required comes from formconfig.validation
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: mobile variant (pointer not fine) > click on the input opens a modal dialog (portal) with Cancel and OK, on the month of the value
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: mobile variant (pointer not fine) > [v5-quirk] the field is a read-only text input labelled "Choose date, selected date is ..."
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: mobile variant (pointer not fine) > [bug-lock] clicking the Vanguard calendar icon does not open the dialog
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: mobile variant (pointer not fine) > picking a day does not close the dialog (waits for OK)
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: mobile variant (pointer not fine) > [v5-quirk] picking a day emits onChange and updates the field before OK is pressed
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: mobile variant (pointer not fine) > OK closes and keeps the picked date (no further onChange)
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: mobile variant (pointer not fine) > Cancel closes and restores the previous value (emitted again)
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: mobile variant (pointer not fine) > [v5-quirk] Escape closes and keeps the picked date (no restore)
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: mobile variant (pointer not fine) > [v5-quirk] backdrop click closes and keeps the picked date (no restore)
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: mobile variant (pointer not fine) > [v5-quirk] keyboard view (pen button) lets the user type a date; only the complete date is emitted
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: mobile variant (pointer not fine) > registers a popover stacking slot on open and releases it on OK, Cancel, backdrop and unmount
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: mobile variant (pointer not fine) > [bug-lock] the dialog keeps MUI's static z-index (1300) and paints behind a raised host modal
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: mobile variant (pointer not fine) > [v5-quirk] the Vanguard paper class is not applied to the mobile dialog
 FAIL  |spec| src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx > DateTimePicker contract: rendering > default labels "Start date"/"Start time", both required (asterisk, no "Optional")
 FAIL  |spec| src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx > DateTimePicker contract: rendering > custom labels
 FAIL  |spec| src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx > DateTimePicker contract: limits > disablePast disables days before today (frozen clock)
 FAIL  |storybook (chromium)| src/core/DatePicker/_DatePickerMuiContract.stories.tsx > Calendar Placement Bottom End
 FAIL  |storybook (chromium)| src/core/DatePicker/_DatePickerMuiContract.stories.tsx > Paper Styles
 FAIL  |storybook (chromium)| src/core/DatePicker/_DatePickerMuiContract.stories.tsx > Icon And Input Layout
 FAIL  |storybook (chromium)| src/core/DatePicker/_DatePickerMuiContract.stories.tsx > Stacking Z Index
 FAIL  |storybook (chromium)| src/core/DatePicker/_DatePickerMuiContract.stories.tsx > Click Away Enabled
 FAIL  |storybook (chromium)| src/core/DatePicker/_DatePickerMuiContract.stories.tsx > [v5-quirk] Click away disabled still closes on click
 FAIL  |storybook (chromium)| src/core/DatePicker/_DatePickerMuiContract.stories.tsx > Pick Day Closes And Shows Value
 FAIL  |storybook (chromium)| src/core/DatePicker/_DatePickerMuiContract.stories.tsx > Mobile Dialog Layout
 FAIL  |storybook (chromium)| src/core/DatePicker/_DatePickerMuiContract.stories.tsx > Mobile Pick Then Ok
 FAIL  |storybook (chromium)| src/core/DatePicker/_DatePickerMuiContract.stories.tsx > Mobile Pick Then Cancel
 FAIL  |storybook (chromium)| src/core/DatePicker/_DatePickerMuiContract.stories.tsx > [bug-lock] Mobile dialog z index
```

### Production changes and first bridge check

Only `src/core/DatePicker/DatePicker.tsx` edited: convert non-null value to Moment at adapter boundary;
inputFormat→format; stable module-level custom textField slot and context for Vanguard props; use core-v5
TextFieldProps; remove picker InputProps/label/ownerState before forwarding; preserve input event props;
slotProps for focused state, popper z-index/placement and desktop paper styles; update internal calendar
click-away classes. Retained wrapper APIs, locale helper, min/max normalization and payload conversion.
Later small adjustments forward picker input ref over form ref, request popperOptions placement too, and
retain three years per row. No other wrapper production logic changed.

First production bridge: same spec command exit1, 194 passed/26 failed, 8/10 files passed;
same browser command exit1, 7 passed/4 failed; same tsc-contract command exit0.
First browser raw retained at `/tmp/mui-upgrade/s2-bridge-attempt1-stories.log`, types at
`/tmp/mui-upgrade/s2-bridge-attempt1-types.log`, command/exit JSONs `s2-bridge-attempt1-*.json`.
Evidence capture limitation: the second targeted controller reused the first spec log filename before
it was renamed. First post-edit spec raw output was overwritten; its exit/counts were observed in tool
output and JSON retained. Mandatory pre-edit RED logs are intact. This is not a green result.

### Remaining implementation work

The v7 section field does not preserve the v5 mask: placeholder casing, empty invalid value, partial/impossible
text, NaN per accepted digit, deletion/clear behavior and locale typing are still red. DateTimePicker's
partial/full typing regressions derive from this. A stable custom field adapter is needed, with v5 mask
semantics and validation; using the default DateField does not meet the unchanged contract.
Mobile keyboard view was removed upstream and needs an explicit compatible toolbar/keyboard layout.
Other residual failures involve year buttons' accessible roles, mobile readonly/name and stacking lifecycle,
and desktop dialog placement attributes/real browser click-away. No behavior waiver is assumed or requested.

Full selftests/static/suite/coverage/package gates have NOT been run: targeted production compatibility
remains RED, so the prerequisite for those stage gates is unmet. No coverage or strict packed-consumer
GREEN claim. Broader S0 declaration/root peer limitations remain; React19 picker peer compatibility does
not establish validity of the whole legacy development graph. S2 is not accepted and S3 has not started.

Hash integrity: supplied `/tmp/mui-upgrade/s2-characterization-before.json` has462 entries; all match,
zero changed/missing. Result `/tmp/mui-upgrade/s2-characterization-integrity.json`.

### Latest targeted follow-up (after placement/ref adjustments)

`pnpm vitest run --project spec src/core/DatePicker src/core/DateTimePicker src/core/TimePicker src/core/DateRangeInput src/core/DateRangePicker --maxWorkers=1 --no-file-parallelism`: exit1, 50.76s; raw `/tmp/mui-upgrade/s2-bridge-attempt2-spec.log`.

```text
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: rendering > [v5-quirk] input is rendered as type="tel" (numeric keyboard on mobile)
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: locale format pattern > [v5-quirk] en_US empty field placeholder is the lower-case pattern mm/dd/yyyy
AssertionError: expected 'MM/DD/YYYY' to be 'mm/dd/yyyy' // Object.is equality
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: locale format pattern > [v5-quirk] en_GB empty field placeholder is the lower-case pattern dd/mm/yyyy
AssertionError: expected 'DD/MM/YYYY' to be 'dd/mm/yyyy' // Object.is equality
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: locale format pattern > [v5-quirk] de_DE empty field placeholder is the lower-case pattern dd.mm.yyyy
AssertionError: expected 'DD.MM.YYYY' to be 'dd.mm.yyyy' // Object.is equality
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: locale format pattern > [v5-quirk] nl_NL empty field placeholder is the lower-case pattern dd-mm-yyyy
AssertionError: expected 'DD-MM-YYYY' to be 'dd-mm-yyyy' // Object.is equality
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: locale format pattern > [v5-quirk] pl_PL empty field placeholder is the lower-case pattern yyyy-mm-dd
AssertionError: expected 'YYYY-MM-DD' to be 'yyyy-mm-dd' // Object.is equality
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: locale format pattern > [v5-quirk] ja_JP empty field placeholder is the lower-case pattern yyyy/mm/dd
AssertionError: expected 'YYYY/MM/DD' to be 'yyyy/mm/dd' // Object.is equality
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: value > invalid value (NaN) renders an empty input flagged aria-invalid
AssertionError: expected 'MM/DD/YYYY' to be '' // Object.is equality
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: onChange payload > [v5-quirk] typing a full date: NaN for every incomplete keystroke, 8 calls for 10 keys
AssertionError: expected [ 'NaN', 'number', 'number', …(2) ] to deeply equal [ 'NaN', 'NaN', 'NaN', 'NaN', …(4) ]
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: onChange payload > typing in de_DE (20.03.2024) emits the same ms timestamp and shows 20.03.2024
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: onChange payload > typing in en_GB (20032024) emits the same ms timestamp and shows 20/03/2024
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: onChange payload > typing in fr_FR (20/03/2024) emits the same ms timestamp and shows 20/03/2024
AssertionError: expected -61406991864000 to be 1710885600000 // Object.is equality
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: onChange payload > [v5-quirk] typing a partial date emits NaN (invalid moment) and keeps the partial text
AssertionError: expected '03/20/YYYY' to be '03/20/' // Object.is equality
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: onChange payload > typing an impossible date keeps the text and marks the input aria-invalid
AssertionError: expected '03/04/2024' to be '13/45/2024' // Object.is equality
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: onChange payload > [v5-quirk] typing an impossible date emits NaN on every keystroke
AssertionError: expected 'number' to be 'NaN' // Object.is equality
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: onChange payload > [v5-quirk] deleting one character of a complete date emits NaN
AssertionError: expected 'MM/20/2024' to be '03/20/202' // Object.is equality
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: onChange payload > clearing the input emits undefined (null?.valueOf()), not null
AssertionError: expected 'MM/DD/YYYY' to be '' // Object.is equality
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: open / close > calendar popper requests placement bottom-end
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: open / close > [v5-quirk] year view: picking a year emits onChange immediately and stays open on the day view
TestingLibraryElementError: Unable to find role="button" and name "2026"
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: closeOnCLickAway > true: mousedown on a year in the year view keeps the calendar open
TestingLibraryElementError: Unable to find role="button" and name "2026"
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: mobile variant (pointer not fine) > [v5-quirk] the field is a read-only text input labelled "Choose date, selected date is ..."
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: mobile variant (pointer not fine) > [v5-quirk] keyboard view (pen button) lets the user type a date; only the complete date is emitted
TestingLibraryElementError: Unable to find an accessible element with the role "button" and name `/go to text input view/`
 FAIL  |spec| src/core/DatePicker/_DatePicker.mui.spec.tsx > DatePicker contract: mobile variant (pointer not fine) > registers a popover stacking slot on open and releases it on OK, Cancel, backdrop and unmount
AssertionError: expected 1102 to be 1101 // Object.is equality
 FAIL  |spec| src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx > DateTimePicker contract: onChange payload > [bug-lock] typing a partial date or clearing it does not emit (falsy/NaN DatePicker payloads are ignored)
AssertionError: expected "vi.fn()" to not be called at all, but actually been called 1 times
 FAIL  |spec| src/core/DateTimePicker/_DateTimePicker.mui.spec.tsx > DateTimePicker contract: onChange payload > typing a full date emits it as unix seconds (midnight)
AssertionError: expected [ …(4) ] to deeply equal [ [ 1710885600, '09:00', …(1) ] ]
 Test Files  2 failed | 8 passed (10)
      Tests  25 failed | 195 passed (220)
```

`pnpm vitest run --project storybook src/core/DatePicker/_DatePickerMuiContract.stories.tsx --maxWorkers=1 --no-file-parallelism`: exit1, 23.42s; raw `/tmp/mui-upgrade/s2-bridge-stories.log`.

```text
 FAIL  |storybook (chromium)| src/core/DatePicker/_DatePickerMuiContract.stories.tsx > Calendar Placement Bottom End
 FAIL  |storybook (chromium)| src/core/DatePicker/_DatePickerMuiContract.stories.tsx > Click Away Enabled
TestingLibraryElementError: 
 FAIL  |storybook (chromium)| src/core/DatePicker/_DatePickerMuiContract.stories.tsx > Mobile Dialog Layout
 FAIL  |storybook (chromium)| src/core/DatePicker/_DatePickerMuiContract.stories.tsx > [bug-lock] Mobile dialog z index
AssertionError: 
 Test Files  1 failed (1)
      Tests  4 failed | 7 passed (11)
```

`bash agentic-plans/mui-upgrade-gates/tsc-contract.sh`: exit0, 5.47s; raw `/tmp/mui-upgrade/s2-bridge-types.log`.

```text

```

## Root follow-up on remaining compatibility

Reviewed all remaining groups rather than treating25spec/4story failures as unrelated bugs. Current stable
textField slot still delegates editing to v7's section editor, which cannot reproduce the legacy mask/payload
contract by merely changing Moment parsing. A dedicated compatibility field is required; original tests stay
frozen. Public slot/layout adapters may also be needed for removed mobile keyboard UI and desktop dialog root.

Root production changes after that checkpoint:
- Added synchronous openRef guard: field wrapper plus picker onOpen previously registered the same slot twice,
  changing1101→1102. Existing mobile stacking test was RED in the checkpoint and now GREEN1/1 with original
  assertions, exit0. Filtered run leaves106unselected tests; it is not a full107test pass.
  Raw `/tmp/mui-upgrade/s2-open-guard-green.log`.
- Set picker yearButton slot role to button, matching the original accessible contract; full year navigation/
  emission validation remains pending. No characterization edits.

Implementation continues on legacy text masking, keyboard view and picker-root/ref/placement compatibility.
No fullstage acceptance gates yet because targeted behavior is still red.

## Custom-field continuation (2026-11-04)

Read the entire preceding handoff including root follow-up, picker source, dates registry, plan and gate/package
READMEs; inspected affected consumer characterizations and public v7 field/layout/popup implementations.
Official v5/v6 migration guides re-read. No commits/pushes/new worktrees/delegation/external messages.

Production remains confined to DatePicker.tsx. Replaced section-editor textField with stable public `field`
slot typed with DatePickerFieldProps<Moment>. It owns legacy text, lower-case placeholders, digit mask/literal
insertion, strict date parsing, per-digit invalid Moment emissions, clear=null at picker boundary (undefined
at Vanguard boundary), range validation and controlled-value synchronization. InputProps.ref is retained on
the input root, restoring the actual Popper anchor and resolved data-popper-placement/geometry. Existing
openRef guard retained. Year button role and immediate year emission passed existing tests unchanged.
Public PickersLayout restores mobile pen/keyboard toggle with Vanguard Input and core-v5 IconButton;
complete dates alone are published by this view. Locale format supplied through stable context. Desktop TEL,
mobile readonly TEXT/accessible name and static mobile z-index behavior preserved.

Only ancillary config change: vitest optimizeDeps.include adds @mui/x-date-pickers/PickersLayout. Its first
browser import caused a Vite dependency reload followed by invalid hook calls. That raw run is retained and
was terminated with SIGTERM after57.79s (exit-15); it is not a passing browser run. Prebundling the new public
entry avoids mid-test reload; no assertions/config thresholds weakened.

Evidence (all controllers under /tmp/mui-upgrade, serial, single worker/no-file-parallelism,1800s process-group
watchdog):
- s2-custom-field1: specs exit1,204/220 passed,16 failed; dominant text failure was readonly because custom
  useMediaQuery lacked picker's defaultMatches:true under jsdom; focus false also needed explicit boolean.
  Browser interrupted as above. Types exit2,TS2314 missing layout generics.
- s2-custom-field2: original220/220 specs exit0 (40.90s);11/11 stories exit0 (20.97s); types exit2.
- s2-final-targeted: original220/220 specs exit0 (39.50s);11/11 stories exit0 (21.71s); types exit2 (12.23s),
  TS2554 layout onChange accepts one argument, not the view renderer's selection-state second argument.
- Added _DatePicker.compatibility.spec.tsx for locale keyboard behavior/toggle back; first attempt failed on
  ambiguous textbox query (retained s2-locale-red); corrected new test query then intended RED in
  s2-locale-red2: expected15.03.2024,received03/15/2024,exit1. Production layout now uses locale format.
- s2-targeted-green:221/221 specs in11files exit0 (42.10s), including unchanged original220;11/11 browser
  stories exit0 (20.10s); source type contracts exit0 (5.82s). Raw logs and exact command/exit JSONs retain
  each prefix above; no original logs overwritten.

Frozen characterization integrity rechecked:462 entries,zero changed/missing, stored at
/tmp/mui-upgrade/s2-characterization-final-integrity.json. New locale regression is additional coverage.
Stage selftests/static/full suite/coverage/normal fresh build+four-consumer pack gates are now in progress;
results will be appended. S2 not accepted; S3 not started. All S0/S1 limitations/history above still apply.

### Stage gate findings (first full run retained RED)

Three infrastructure selftests exit0, logs/process JSONs in out/s2. Initial static exit1: seven new lint errors
in six file/rule pairs (duplicate imports, arrow callback, template string, unused state binding, equality,
new-test import sorting); corrected only picker/new-test code. s2-lint-fixed-targeted:221spec/11stories/types
all exit0. out/s2-final static exit0: app1001/lib4 errors,zero new; contract0; lint1318,zero worse pairs.

Normal full suite out/s2-final: spec96files/1695tests exit0; browser172passed/1failed files,
1288passed/2failed tests exit1. Both failures in unchanged OverlayStacking showcase: Drawer Modal Date Picker
and Fullscreen Modal Fullscreen Modal Date Picker. Exact assertion expected null to be truthy on
`document.querySelector('.MuiCalendarPicker-root')`; v7 renamed that real calendar root. Isolated diagnostic
reproduced2failed/15passed. Whole suite shell exit1 captured after508.38s; four pre-existing browser processes
before/after. This remains a RED full run, not accepted via diagnostic retry. Coverage/package not started.

Production repair uses public dateViewRenderers.renderDateViewCalendar with an additive historical root
class on the actual v7 DateCalendar; no fake modules or test changes. Added this new public entry to browser
prebundling for the same previously demonstrated reload reason. New targeted prefix s2-root-class-green
includes all affected specs plus DatePicker11 and OverlayStacking17 stories and source types before any
broader gate resumes. Next full evidence will use a distinct output label, preserving the first RED.

Calendar-root repair targeted GREEN: s2-root-class-green-spec exit0,221/221 (40.38s); combined DatePicker/
OverlayStacking browser exit0,28/28 (53.76s); source type contracts exit0 (5.44s). No hashes altered.
Fresh static out/s2-verified exit0 (29.89s),same1001/4 existing compiler diagnostics,contract0,lint1318 with
zero worse baseline pairs. Normal full suite,coverage and package fixture now continue serially under this
new label; /tmp/mui-upgrade/s2-stages-verified.py stops immediately on any failed gate. Stable source/config
input manifest: /tmp/mui-upgrade/s2-verified-input-hashes.json (5124files). This does not replace the frozen
462-file test/story manifest.

### First complete normal/coverage GREEN, then additional controlled-dialog regression

out/s2-verified normal suite shell exit0 (474.44s):96spec files/1695tests and173browser files/1290tests,
all2985PASS. No isolated rerun needed. Four browser processes before/after. Combined mapped coverage shell
exit0 (400.44s),all2985testsPASS;35/35 mapped wrappers meet95%lines/85%branches. DatePicker100%lines,
96.59%branches. Exact report/mapped-coverage-audit.json retained under that label. These results apply to the
pre-sync implementation, not automatically to the following change.

Final source inspection identified a new-layout state gap: switching to keyboard after selecting another
day could show the dialog's initial date. Added a second test in the new compatibility spec (no frozen test
changed). s2-dialog-sync-red demonstrated expected03/20/2024,received03/15/2024 without parent update;
s2-dialog-sync-controlled-red confirmed the same intended failure with a parent feeding value back,
exit1,1failed/1passed (7.28s). Production layout now synchronizes its text when formatted value changes;
partial keyboard text persists when value is unchanged, and no effect emits callbacks.

The normal package runner had just started and was explicitly stopped with SIGTERM before any passing
package claim (out/s2-verified/package-interruption.json). Its raw output remains. This is not a valid final
package result. New targeted prefix s2-dialog-sync-green precedes new serial static/fullnormal/coverage/
freshbuild+normal4consumer fixture under s2-final-sync. No assertion,threshold,baseline,skip or waiver changed.

Final sync targeted GREEN: s2-dialog-sync-green spec222/222 exit0 (44.13s), including original220 and two
added regression tests; combined DatePicker11 + OverlayStacking17 browser28/28 exit0 (55.46s); source
contracts exit0 (6.76s). Final-sync static exit0 (32.12s),same1001/4 existing compiler errors,contract0,
lint1318/zero worse baseline pairs. Final source/config manifest captured before full checks at
/tmp/mui-upgrade/s2-final-sync-input-hashes.json (5124files). Final fullnormal,coverage and normal fresh
package results pending under out/s2-final-sync; these alone will establish final implementation validation.

### Final-sync normal run timeout — remains RED

Final-sync full spec raw exit1:1failed/1695passed (96files),355.54s reported project duration. Failure is
ToggleButton non-native Enter keyboard test: `Test timed out in5000ms`, with no assertion mismatch reported.
Its unchanged isolated diagnostic passes18/18. This component/source/test is unchanged and two preceding
normal full specs passed; machine load increased to19.45 (setup194.12s vs earlier runs). No unrelated production
fix,timeout increase,test rewrite or baseline waiver is justified by this evidence. Current browser phase is
allowed to finish; whole normal run remains RED regardless of diagnostic/browser result. Final source types,
static and targeted222+28 are GREEN. A distinct fresh normal suite will be required, with all raw RED evidence
preserved, before coverage/package continue. New controller /tmp/mui-upgrade/s2-stages-complete.py starts only
after the existing gate stops; it does not rerun static because production/config remain unchanged.

### Final-source normal suite GREEN

The preceding final-sync browser phase completed1290/1290,exit0, but the whole shell remains exit1
(1641.58s) because of the spec timeout; no waiver. Host load reached51.86 on10cores and browser project
wall duration1271.50s. No user apps/pre-existing browser processes were killed or settings changed.

Fresh normal command `bash agentic-plans/mui-upgrade-gates/suite.sh s2-complete 1`: shell exit0,501.91s.
All96spec files/1696tests and173browser files/1290tests pass:269files/2986tests total. No diagnostic retry
within this successful raw suite. Tests/timeouts/thresholds remain unchanged. Browser processes4 before/4
after. Exact logs and resource/load summaries in out/s2-complete. The ToggleButton timeout is retained as
an earlier failed run, not absorbed into the baseline; fresh run passes its original assertions and timeout.
Final-source combined mapped coverage and normal fresh package fixture now follow serially under this label.

### Compact mobile toolbar geometry (final production adjustment)

Pre-toolbar final-sync normal suite completedGREEN under out/s2-complete (269files/2986tests,exit0,
501.91s), and its combined mapped coverage also exit0 (413.13s),all2986testsPASS,DatePicker100%lines/
96.59%branches. The normal fresh package build completed both bundles, but its fixture was stopped during
pack/lifecycle work to verify an actual UI geometry issue; no consumer/package pass claimed for that label.
Interruption PID58953/SIGTERM retained in out/s2-complete/package-interruption.json, with raw build/pack logs
at /tmp/mui-upgrade/s2-complete-package. No build log or prior RED has been overwritten.

New browser geometry characterization initially named _DatePickerKeyboardLayout.stories.tsx demonstrated
an unintended full-width320px pen button (expected compact width<64),s2-toolbar-red,exit1,16.43s. This exposed
an extra content row rather than the legacy toolbar control. Production now places the pen in a stable
public `toolbar` slot wrapping real DatePickerToolbar, absolutely positioned inside its existing grid cell;
layout context owns the toggle. Calendar content no longer gets an extra button row, while the real toolbar,
calendar,actions,centering and static mobile z-index remain handled by MUI. No core TextField slotProps.

s2-toolbar-green:222/222 affected specs exit0 (42.45s); originalDatePicker11 + OverlayStacking17 + newgeometry1
browser29/29 exit0 (54.45s); source types exit0 (5.94s). New story was then renamed to
_DatePickerKeyboardLayoutMuiContract.stories.tsx so the unchanged source contract compiler glob includes it:
s2-toolbar-typed-green browser1/1 exit0 (10.94s),source types exit0 (5.33s). Assertions unchanged by rename.
Existing462 frozen specs/stories remain untouched; additions are two focused specs in one new file and this
one browser story. ESLint's existing story ignore remains unchanged; new story is compiler/browser checked.

Final controller /tmp/mui-upgrade/s2-stages-final-toolbar.py runs static,normalfull,coverage,normalfreshbuild+
all4strict consumers serially under out/s2-final-toolbar. Every command gets its own1800s process-group
watchdog. Final source/test/config/dependency input manifest5125files:
/tmp/mui-upgrade/s2-final-toolbar-input-hashes.json. These final gates are pending; earlier successful normal/
coverage runs are historical evidence and do not by themselves accept the toolbar adjustment. S2 remains
unaccepted pending these final results and fresh root review/overseer; S3 is not started.

## Final implementation validation — ready for fresh root review (not stage acceptance)

Final production is confined to DatePicker.tsx: adapter-native Moment boundary, stable legacy custom field,
real v7 calendar via public renderer with historical calendar-root hook, preserved anchor ref/placement,
openRef stacking guard, year button accessibility, and compact mobile toolbar/keyboard compatibility.
Public Vanguard props, value/min-max units, controlled/calendar/keyboard payloads, locale fallback behavior,
QA/form wiring, styles, and characterized bugs remain frozen. Ancillary vitest prebundling additions prevent
new public picker entries from causing a browser dependency reload. No fake MUI modules. No source changes
outside picker compatibility. Additions: two focused spec cases and one browser geometry contract.

### Final gates on the exact final source

- Three infrastructure selftests: all exit0, retained under out/s2 (selftest, suite-selftest, coverage-selftest).
  Gate scripts/probes/thresholds remained unchanged throughout subsequent production work.
- `bash agentic-plans/mui-upgrade-gates/gates.sh s2-final-toolbar`: exit0,30.35s. App1001/lib4 existing
  diagnostics,zero new; source contract compiler0 errors; lint1318,zero worse baseline file/rule pairs.
- Targeted final production: original220 + two new specs222/222,exit0; original DatePicker11 + existing
  OverlayStacking17 + new geometry1 browser29/29,exit0. New geometry story after compiler-glob rename also
  passes1/1 and contract compiler exit0. Exact earlier prefix commands/results above retain all TDD REDs.
- `bash agentic-plans/mui-upgrade-gates/suite.sh s2-final-toolbar 1`: actual shell exit0,479.17s;
  spec96files/1696tests + browser174files/1291tests =270files/2987tests PASS. No isolated retry in this
  successful raw run. Runner records8 processes before/8 after. Earlier failed runs stay RED in their labels.
- `bash agentic-plans/mui-upgrade-gates/coverage.sh s2-final-toolbar`: actual exit0,all2987tests PASS.
  All35/35 mapped files meet95%lines/85%branches; DatePicker100%lines/96.73%branches. Detailed V8 reports,
  summary and mapped-coverage-audit.json are retained in out/s2-final-toolbar. No new coverage exception;
  the exact three previously accepted unreachable PopoverModal declarations remain the sole S0 exception.
- `PACKAGE_FIXTURE_OUT=/tmp/mui-upgrade/s2-final-toolbar-package bash agentic-plans/mui-upgrade-gates/package-fixture/run.sh`:
  actual exit0,460.12s. Both bundles built freshly, genuine tarball packed (including existing npm10 prepare
  rebuild behavior),all4 isolated strict-peer installs succeed. Default/WP declared-only and MUI-present
  consumers each pass gated types and4/4 installed runtime checks (16/16 total). Additional default-MUI
  healthy public-type/any-negative-probe gate has0 diagnostics. Normal mode,NO --baseline-v5,force or legacy
  peer flags; no known-peer-conflict bypass files. Consumer graphs retain React19.2.0,EmotionReact11.14.0/
  Styled11.14.1; MUI-present consumers install Material5.16.14. package-audit.json records exact versions.

Final package: /tmp/mui-upgrade/s2-final-toolbar-package/pack/rankingcoach-vanguard-2.8.0.tgz
SHA256 f76ae63a55c09427cf78883050d1bb2e26dc5f5907c24b4d6cf4293d23608e44.
Raw build/pack/install/lifecycle/type/runtime and broader declaration-measurement logs remain in that fixture
output directory. A passing configured type gate is not a clean full declaration claim: all S0/S1 missing
undeclared type dependencies, WordPress declaration incompleteness, public runtime subpath limitations and
root legacy development-peer limitations remain recorded. Nothing expands or waives those baselines.

### Interruption and exact coverage exit recovery

A deliberate turn interruption ended the Python controller after it had captured static/full-suite exits;
coverage PID78841 continued as an orphan. It was NOT duplicated. Recovery controller
/tmp/mui-upgrade/s2-resume-final-toolbar.py registered Darwin kqueue NOTE_EXIT|NOTE_EXITSTATUS for that owned
process and restored a conservative1500-second remaining process-group watchdog about142seconds after the
original start (total bound below1800seconds). Actual raw wait status0/exit0 was captured, not inferred from
PASS text: coverage-process-recovered.json. Two controls prove exit7 capture: direct child and owned non-child
(the latter matches the orphan case); JSON results exit-capture-control.json and exit-capture-nonchild-control.json.
SDK sys/event.h documents NOTE_EXITSTATUS as valid for children or processes one may signal. Recovery elapsed
284.42s; original total outer elapsed is not invented. Package then ran as a fresh child with its own1800-second
watchdog and reaped exit0. No timeout occurred. All commands were serial, source tests one worker/no file
parallelism; fixture runtime has one test file per consumer and consumers run serially.

### Final integrity and handoff

Final post-build/package audit: all462 provided frozen src spec/story SHA256s match,zero changed/missing.
All5125 source/test/script/config/dependency input hashes captured before final gates also match,zero changed/
missing. See out/s2-final-toolbar/final-input-integrity.json and
/tmp/mui-upgrade/s2-final-toolbar-input-hashes.json. This proves final gates/build did not mutate their inputs.
No characterization rewrite,skip,threshold change,probe weakening,contract waiver,unrelated bug fix,commit,
push,new worktree,sub-agent or external message. Work remains on release/mui-upgrade in the existing worktree.

Implementation and required gates are complete. Fresh root review/overseer remain required before S2 acceptance;
S3 has NOT started. All historical REDs/interrupted package attempts remain visible above and in distinct raw
outputs. The local plan has no ticket/PR URL, so no review message has been sent or invented; root can populate
the mandated unsent CR template once actual URLs exist.

## Root review: controlled field transitions — final candidate updated

Root found two additional public controlled-state regressions in the new custom field, despite prior green
characterization: lastEmitted persisted indefinitely. After typing20March, an external22March→20March restore
left22March visible; changing locale after typing kept US formatting. Added two focused tests in the NEW
compatibility spec (not among the frozen462). Intended RED:2failed/2passed, expected03/20 received03/22 and
expected20.03 received03/20, `/tmp/mui-upgrade/s2-controlled-transitions-red.log`. Initial test setup used
userEvent.type, which clicked/opened the calendar and failed before those assertions; corrected to explicit
focus+keyboard, matching the frozen desktop-edit tests, before claiming the intended RED.

Production fix consumes the last-emitted marker after the immediate controlled echo effect. It no longer
suppresses future external restores/locale reformatting; partial invalid text remains protected during the echo.
Targeted source GREEN:131/131 across DatePicker contracts,DateTimePicker contracts and the new compatibility
cases, exit0, `/tmp/mui-upgrade/s2-controlled-transitions-green.log`. Original462 hashes remain unchanged.

The new compatibility spec was renamed `_DatePickerCompatibility.mui.spec.tsx` so the existing source contract
compiler glob includes it (the earlier `.compatibility.spec.tsx` name was outside that compiler glob). No frozen
file was renamed. Explicit contract compiler exit0 and targeted ESLint0errors after rename; gitdiffcheckPASS.

Strengthened default installed-package smoke with the same controlled restore+locale transition. WordPress
has no DatePicker export by existing contract, so its existing4checks remain; default consumers now require5,
18runtime checks total across4consumers. This new probe fails against the previous final-toolbar S2 tarball:
4old checksPASS/newDatePickercheckRED expected03/20 received03/22,exit1. Raw
`/tmp/mui-upgrade/s2-packed-controlled-red.log`. Old consumer test source was backed up as
`smoke/bundle.test.s0-backup` before adding the probe in that temporary consumer. Its prior16checks pass remains
historical, not final proof for the updated runtime/probe. Fixture source now carries the new mandatory check.

New final source/test/probe candidate requires fresh bounded serial static/fullnormal/mappedcoverage and
fresh build/pack/normal strict4consumer18runtime GREEN before fresh reviewer/overseer. Prior final-toolbar green
results apply to the earlier source only and are retained. No thresholds/exclusions/bug-lock assertions changed.

## Controlled-field candidate final validation — supersedes earlier candidate GREEN

Test-only validation completed 2026-11-04 on `release/mui-upgrade` in the existing
`/Users/a.kott/WebstormProjects/rc-webapp-vanguard-git/.claude/worktrees/mui-upgrade` worktree.
These fresh results apply to the marker-consumption fix, renamed compiler-covered compatibility spec,
and strengthened installed-package probe described in the root append above. Earlier final-toolbar GREEN
applies only to its earlier source/probe and is superseded as final-candidate evidence; all history remains.
Root's intended two-case RED, targeted131/131 GREEN and old-packed-runtime probe RED remain recorded above.

Executed serially, without a full-suite retry or diagnostic rerun:

- `bash agentic-plans/mui-upgrade-gates/selftest.sh`: actual exit0,1.30s.
- `bash agentic-plans/mui-upgrade-gates/suite-selftest.sh`: actual exit0,0.48s.
- `bash agentic-plans/mui-upgrade-gates/coverage-selftest.sh`: actual exit0,0.31s.
- `bash agentic-plans/mui-upgrade-gates/gates.sh s2-controlled-final`: actual exit0,40.84s.
  App1001/lib4 existing diagnostics,zero new; source contracts0; lint1318,zero worse file/rule pairs.
- `bash agentic-plans/mui-upgrade-gates/suite.sh s2-controlled-final 1`: actual shell exit0,466.21s.
  Spec96files/1698tests and browser174files/1291tests:270files/2989tests PASS. Both project exits0.
  Runner recorded8 pre-existing Vitest/headless processes and4 after. No assertions failed or were retried.
- `bash agentic-plans/mui-upgrade-gates/coverage.sh s2-controlled-final`: actual exit0,384.46s,
  all270files/2989tests PASS.35/35 mapped files meet95%lines/85%branches. DatePicker100%lines/96.73%branches;
  aggregate99.36%lines/96.64%branches. Detailed V8 reports and `mapped-coverage-audit.json` retained.
  Only the existing three approved unreachable PopoverModal declarations remain excluded.
- `PACKAGE_FIXTURE_OUT=/tmp/mui-upgrade/s2-controlled-final-package bash agentic-plans/mui-upgrade-gates/package-fixture/run.sh`:
  actual exit0,343.60s. Normal mode, fresh build of both bundles, fresh pack including npm prepare rebuild;
  no previous TGZ,skip-build,baseline-v5,force,legacy-peer or known-conflict bypass. All4 strict npm11.6.2
  consumer installs and gated declaration checks PASS. Additional default-MUI public-type/any-negative gate
  has0 diagnostics. Default consumers5/5 each,WordPress4/4 each:18/18 installed-runtime checks PASS,
  including controlled restore and locale changes from the packed DatePicker. WP retains no DatePicker export.

All raw logs and durable process results are under `agentic-plans/mui-upgrade-gates/out/s2-controlled-final/`:
`*-run.log`, `*-process.json`, project logs, static diagnostics and coverage reports. The controller
`/tmp/mui-upgrade/s2-controlled-final-controller.py` ran independently of the tool session, reaped every child
using wait(), and atomically persisted actual return codes; no exit was inferred from PASS text. Each command
started in its own session/process group with an1800-second watchdog; no timeout or watchdog signal occurred.
Source/coverage runners enforce one worker and no file parallelism; isolated consumers run serially with one
runtime file each. Resource snapshots before/after and39 periodic samples include PID/PPID/PGID,CPU,RSS and
load; peak sampled1m load13.62 on10cores (`resource-summary.json`). No unrelated process was killed.

Fresh tarball:
`/tmp/mui-upgrade/s2-controlled-final-package/pack/rankingcoach-vanguard-2.8.0.tgz`
SHA256 `2b07b2c5c124125cc00fbff23f56f2f93374b79e246c7fd82cb57ac678578323`.
`package-audit.json` in that fixture directory verifies source-installed Material/System5.16.14,
pickers7.29.4,EmotionReact11.14.0/Styled11.14.1,React/DOM19.2.0 and exact packed MUI development pins.
MUI remains bundled (absent from build externals); declared-only consumers have no Material installed yet
pass the real packed runtime. Both MUI-present consumers install Material5.16.14; all4 retain the exact
Emotion and React pins. Tarball bytes match fresh outputs:5688 default files and346 WordPress files;
all4 lifecycle-selected installed bundle byte comparisons also have zero mismatches. Consumer-local configs
contain no source alias,workspace link,paths,or inherited repository Vitest config; no consumer .npmrc exists.
All4 type-gated logs and the required default-MUI type-gated log are empty. Broader measured declaration
failures remain separate: this is not a clean full declaration or whole-root peer-graph claim.

Before/after manifests: `out/s2-controlled-final/input-hashes-before.json` and `input-hashes-after.json`,
5196files each. `input-integrity.json` records exactly two changes: generated root
`dynamic-import-analysis.json` and `dynamic-import-analysis-simple.json`, regenerated by the normal build.
All other5194 hashes match, including source,tests,stories,probes,runner/configuration,package and lock inputs;
no added/missing files. The report itself and gate output directory are excluded from these manifests.
Original frozen462-file snapshot: `/tmp/mui-upgrade/s2-characterization-before.json`.
`frozen-before.json` and `frozen-after.json` both confirm462/462 unchanged,zero missing. `git diff --check` exit0.
No source/test/probe/dependency edits,commits,pushes,subagents,external messages,baseline expansion,skip,
threshold changes or probe weakening were performed. Prior interrupted package and RED runs remain intact.

All broader S0/S1 root-peer,undeclared-type,WordPress declaration and runtime-subpath limitations remain.
This is validation evidence for fresh read-only root review and overseer, NOT S2 acceptance. S3 has not started.
No ticket/PR URLs are available locally; no CR message was sent or URLs invented. Root retains the unsent CR
handoff requirement after its review/overseer work.

## Fresh reviewer MAJOR: separator deletion and caret — root remediation

`review-s2.md` rejected the controlled-final candidate: the raw-shorter deletion shortcut bypassed masking,
so Backspace after a slash retained0315/2024 and emittedNaN. No waiver or frozen-test change was granted.

Root reproduced exact v5 behavior using the retained S1 packed runtime in its isolated declared consumer.
Temporary probe `smoke/mask-probe.test.tsx` (no repo aliases) records
`/tmp/mui-upgrade/s2-v5-mask-baseline.json`: Backspace at3 preserves03/15/2024,caret2,no callback;
Delete at2 preserves the date,caret3,no callback; subsequent digit2 produces03/21/5202,caret4 and the
legacy shifted-date payload. Initial console-only capture did not expose values; the second probe persisted
explicit JSON and passed. This is preserved baseline behavior, not a new promised digit-shifting API.

Added four cases in the new compiler-covered compatibility spec: Backspace/Delete date/payload/caret plus
subsequent digit insertion. Intended RED4failed/4passed `/tmp/mui-upgrade/s2-separator-red.log`: malformed date
for separator deletion and caret10instead of4 for subsequent insertion.

Production now formats every edit, including deletion; the raw-shorter bypass is removed. It maps the raw
accepted-digit prefix to the formatted caret, advances over the separator for a no-op forward Delete, and
applies pending selection after rendering. No-op separator edits restore native text/caret without emitting
a value callback. Final-digit deletion and clear/payload behavior retain their frozen assertions.

Targeted source GREEN135/135 across DatePicker contracts,DateTimePicker contracts and8compatibility cases,
exit0: `/tmp/mui-upgrade/s2-separator-green.log`. Browser story added to the new (non-frozen) keyboard-layout
file verifies Backspace/Delete/subsequent typing and actual caret; both stories PASS2/2,exit0:
`/tmp/mui-upgrade/s2-separator-browser-green.log`. Targeted ESLint0errors,gitdiffcheckPASS.

Extended the existing default installed DatePicker smoke with separator edits/caret before its restore/locale
checks (runtime count remains18across4consumers). New probe RED against prior controlled-final tarball:
old4checksPASS,newDatePickercheckFAIL expected03/15/2024 received0315/2024,exit1,
`/tmp/mui-upgrade/s2-packed-separator-red.log`. Temporary consumer source backed up before updating probe.
No old package GREEN is reused as final proof after this production/probe change.

New final-candidate full static/normal/mapped coverage and fresh normal build/pack/strict18runtime checks
remain required before reporting the review finding closed to the overseer. Existing462 frozen files remain
untouched. No source-wide exclusion,threshold/timeout change,probe weakening or bug-lock rewrite occurred.


## Mask/caret candidate fresh validation — 2026-11-04, mixed result

Validated only the existing release/mui-upgrade worktree after the root MAJOR remediation above.
Prior controlled-final GREEN applies to OLD source/probe and is not reused. All historical RED and
interrupted evidence remains intact. No S2 acceptance or S3 work is claimed.

Fresh commands ran SERIAL, with actual controller-reaped wait statuses:

- Three selftests: selftest.sh exit0 (1.33s), suite-selftest.sh exit0 (0.47s),
  coverage-selftest.sh exit0 (0.29s).
- gates.sh s2-mask-final: exit0 (30.89s). App1001/lib4 diagnostics, zero new;
  contracts0; lint1318, zero worse baseline file/rule pairs.
- suite.sh s2-mask-final 1: **exit1 RED** (462.41s). Source96files/1702tests PASS,
  project exit0. Browser148/174files,1245passing tests, project exit1 and one unhandled error:
  while starting src/core/Alert/_Alert.stories.tsx, “Browser connection was closed while running tests.
  Was the page closed unexpectedly?” with nested birpc “rpc is closed, cannot call createTesters”.
  No assertion failure was reported; 26 browser files did not finish. This is NOT a complete green run.
  Runner reported4 pre-existing processes and9 at its immediate end snapshot. No full retry or targeted
  rerun was performed; raw error inspection was sufficient to identify the recorded failure mode.
  Its cause is not established; do not infer an implementation defect or dismiss the gate failure.
- coverage.sh s2-mask-final: exit0 (391.47s). All270files/2994tests PASS.
  All35 mapped files meet95%lines/85%branches; DatePicker100%lines/96.15%branches;
  aggregate99.37%lines/96.6%branches. Only the existing three approved unreachable PopoverModal
  handler declarations remain excluded. This separate required run does not erase the normal-suite RED.
- PACKAGE_FIXTURE_OUT=/tmp/mui-upgrade/s2-mask-final-package bash
  agentic-plans/mui-upgrade-gates/package-fixture/run.sh: exit0 (385.68s). Normal fresh build of both
  bundles and fresh pack, including npm prepare rebuild. No supplied old TGZ, skip-build, baseline-v5,
  force or legacy peer flags. All4 strict npm11.6.2 installs PASS; all4 configured gated types and
  default-MUI public-type/any-negative gate PASS with zero log bytes. Default5/5 each, WP4/4 each:
  18/18 installed runtime checks PASS, including the extended separator/caret and restore/locale probe.

Raw evidence: agentic-plans/mui-upgrade-gates/out/s2-mask-final/ contains three selftest logs/process JSONs,
static-run.log/static-process.json, suite-run.log/suite-process.json, both project logs, summary.txt,
static diagnostics, coverage reports and mapped-coverage-audit.json. The initial controller correctly stopped
on suite exit1. A separate serial continuation ran only the remaining required coverage/package commands:
its coverage-run.log, package-run.log, corresponding *-process.json, manifests and resource records are in
out/s2-mask-final-remaining/. Both directories contain complete.json. Controllers are retained as
/tmp/mui-upgrade/s2-mask-final-controller.py and s2-mask-final-remaining-controller.py, with separate logs.
They ran detached from the tool session, each command in its own process group with1800-second watchdog,
reaped children via wait(), and atomically saved actual exits. No inferred exit, timeout, duplicate runner,
unrelated kill or full-suite retry. Both controllers and their runner commands have finished. Source/browser
and coverage used one worker/no file parallelism; package consumers ran serially with one runtime file each.
Resource snapshots and41 periodic samples retain PID/PPID/PGID,CPU,RSS and load; peak sampled1m load28.30
on10cores (out/s2-mask-final/resource-summary.json). No causal claim is made from load alone.

Fresh tarball: /tmp/mui-upgrade/s2-mask-final-package/pack/rankingcoach-vanguard-2.8.0.tgz
SHA256: 501136c9c7b99900409cd623aa73ac14d2cc9a18dcd22cf10a7621c58f90c659.
package-audit.json in that fixture directory verifies source-installed Material/System5.16.14,
pickers7.29.4,EmotionReact11.14.0/Styled11.14.1,React/DOM19.2.0 and exact packed MUI development pins.
All5688 default and346 WordPress packed files match fresh build bytes, zero mismatches. All4 lifecycle-selected
installed bundles match the corresponding packed bytes. Consumers reference this exact fresh tarball;
MUI-present consumers install Material5.16.14, declared-only consumers have no Material installed. All4 retain
exact React/Emotion pins. No consumer .npmrc or known-conflict bypass artifact exists. Raw build, pack,
install, lifecycle, type, runtime and broader measured-declaration logs remain under that fixture output.
This is NOT a whole development graph audit or clean full-declaration claim. Retained root-peer,
undeclared-type, incomplete WordPress declaration and runtime-subpath limitations remain unchanged.

Final integrity: out/s2-mask-final/final-integrity.json compares5197 initial/final input hashes: only
known build-generated dynamic-import-analysis.json and dynamic-import-analysis-simple.json changed;
all other5195 unchanged, no added/missing files. All462 frozen hashes match the original snapshot
/tmp/mui-upgrade/s2-characterization-before.json before/after. git diff --check exit0.
No source/test/probe/dependency edits, assertion/baseline weakening, threshold/exception change, commit,
push, subagent or external message was performed. Only this permitted verification append was written.

TDD closure candidate: root-recorded4-case intended RED, targeted135PASS, real-browser2PASS and old-packed
separator probe RED remain above; fresh mapped coverage and fresh18-runtime package checks support the mask/
caret remediation. Required normal-suite GREEN is still missing due to the recorded browser connection error.
Root should review the raw failure and determine the next validation step before presenting closure to overseer.
No S2 acceptance, S3 start or review post is authorized by this report. No ticket/PR URL was invented.

## Root classification of the latest normal-browser interruption

Reviewed the entire normal-browser error context. It reports a closed browser connection/birpc channel while
creating Alert testers, with no assertion mismatch and no late-optimization/reload warning. Cause remains
unestablished; it is not classified as a proven flake or ignored implementation failure.

Unchanged Alert diagnostic: `pnpm vitest run --project storybook src/core/Alert/_Alert.stories.tsx
--maxWorkers=1 --no-file-parallelism`, exit0,4/4tests, raw `/tmp/mui-upgrade/s2-alert-diagnostic.log`.
This does not turn the failed normal gate green. Root authorized one fresh browser-only full174file validation,
retaining the incomplete RED. No source/config/probe/dependency change occurred: source1702tests exit0,
full mapped2994tests exit0 and fresh strict4consumer18runtime exit0 remain valid evidence for those checks.
No repeat source/coverage/build/package run is requested solely for the browser-transport interruption.


## Authorized fresh normal browser full validation — 2026-11-04

Validation only, existing `release/mui-upgrade` worktree. Executed ONCE:
`pnpm vitest run --project storybook --maxWorkers=1 --no-file-parallelism`.
Actual controller-reaped process exit **0**, elapsed 283.55s;
raw Vitest result: **174 passed files (174), 1292 passed tests (1292)**,
reported duration279.31s (setup24.44s, import29.04s, tests217.39s).
Raw output, including asset-path warnings, is retained without filtering in
`out/s2-mask-browser-final/browser-run.log`; actual wait status is in `browser-process.json`.
No assertion failure or browser transport error was reported by this fresh run.

Controller `/tmp/mui-upgrade/s2-mask-browser-final-controller.py` launched the exact argv in
its own process group PID/PGID80829 with an1800s watchdog (TERM scheduled at1795s,
KILL after at most5s). No watchdog signal or timeout occurred, and no unrelated process was killed.
Before/after resource snapshots and 9 periodic samples retain PID/PPID/PGID, CPU,
RSS, child resource usage and load. Peak sampled1m load 12.28 on
10 logical CPUs; see `resource-summary.json`. Load does not establish causality.
An initial detached launcher exited before starting the controller or Vitest (no output directory
or test process existed); the managed controller then performed the sole browser execution.

Integrity:5197 before/after input hashes match exactly, zero changed/added/missing files.
This includes source, tests, stories, configuration, runner/probe fixtures, package and lock inputs.
Both frozen checks confirm462/462 original hashes unchanged. Historical candidate comparison
confirms all5102 source files match `out/s2-mask-final/input-hashes-before.json`; only the two
previously documented build-generated analysis JSONs differ across those historical manifests.
Detailed manifests and `historical-candidate-integrity.json` are retained in this output directory;
`evidence-sha256.json` hashes the raw result, process/resource records and integrity artifacts.
`git diff --check` exit0 before this append. No implementation/test/probe/config/dependency changes,
commits, pushes, subagents, external messages, reporter/assertion changes or extra gate runs.
Only this verification append and validation evidence were written.

Final per-project evidence is historical SAME-CANDIDATE source96files/1702tests exit0 plus
fresh browser174files/1292tests exit0, totaling270files/2994tests across those project executions.
This does NOT invent an exit0 for the original suite wrapper: its exit1/incomplete browser RED
remains intact. The original closed connection while creating Alert testers still has an
UNESTABLISHED cause; no assertion mismatch or reoptimization warning was recorded there.
The isolated unchanged Alert4/4PASS exit0 is diagnosis only. Prior intended TDD and old-packed
probe REDs remain RED. Existing static/selftest, mapped270files/2994tests35thresholds exit0 and
fresh strict4consumer18runtime/type/byte/pin PASS evidence remains historical same-candidate
proof; none was rerun for this browser-only authorization.

Remaining limitations: broader S0/S1 root-peer, undeclared-type, incomplete WordPress declarations
and runtime-subpath issues remain unchanged; no whole development graph/full declaration claim.
Root must review the mask/caret TDD and gates, then obtain overseer review before acceptance.
No S2 acceptance, MAJOR closure, S3 start, review posting or additional reviewer is claimed here.

## Root final disposition and S2 handoff

Root reviewed current mask/caret code and all final evidence. Fresh review's single MAJOR is addressed by
exact v5 runtime reproduction, four intended RED→GREEN source cases, actual browser caret coverage, previous
packed-runtime RED and new packed-runtime GREEN. Original fresh review remains preserved; its report now
includes an explicitly root-authored disposition, not an invented reviewer endorsement.

No known actionable S2 finding remains under root review. Final project evidence is270files/2994tests across
source and fresh normal-browser executions; independent full mapped2994PASS35/35thresholds, static/selftests
PASS and fresh4strictconsumer18runtime/type/bytes PASS. All462frozenfiles remain unchanged. The original
normal wrapper exit1 and unestablished browser transport cause remain visible; whole-wrapper exit0 is not
claimed. Only two expected generated analysis JSONs changed during build. gitdiffcheckPASS.

Overseer verdict requested before S3; no acceptance, commit, push or release is claimed here. Public Vanguard
APIs and all S0/S1 baseline limitations remain visible. No ticket/PR placeholder or sent CR request exists.
