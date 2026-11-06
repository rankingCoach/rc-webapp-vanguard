# S5a picker slot and compatibility audit

Candidate: picker9.17.0, Material/System7.3.11. No MUI private imports added.

| Path | Installed v9 source | Candidate decision |
|---|---|---|
| Picker field | `internals/hooks/useMobilePicker/useMobilePicker.js:56,85–88` selects the field slot; `DateField/DateField.js:30–53` owns field hooks/UI | The former custom raw Input field is replaced by a wrapper around genuine DateField. This is the authorized field DOM migration, not a styled-default replacement shortcut. |
| Text field | `internals/components/PickerFieldUI.js:113` defaults to styled PickersTextField | No `slots.textField` replacement. Public textField/input/htmlInput slot props carry cursor, autocomplete, validation and mobile accessible name. PickersTextField and PickersSectionList keep MUI styling. |
| Popper | `PickerPopper/PickerPopper.js` retains styled popper/paper defaults | No popper component replacement. Props-only class alias `MuiPickersPopper-root` remains beside v9's real class; placement/zIndex remain props. Alias is a temporary compatibility shim, not a new public promise. |
| Layout | `internals/hooks/useMobilePicker/useMobilePicker.js:67` defaults to PickersLayout | Existing mobile keyboard layout explicitly renders PickersLayout, preserving its styled root; swaps only calendar/editor content. Desktop returns PickersLayout unchanged. |
| Toolbar | `PickersLayout/usePickerLayout.js:78–86` invokes toolbar slot | Existing toolbar explicitly renders genuine DatePickerToolbar; compact keyboard toggle sits beside it. |
| Transitions/day/month/year | DatePicker calendar renderers / default transition slots | No S5a transition replacement. Compatibility calendar renderer keeps real renderDateViewCalendar and existing class alias. |
| DateRangeInput/DateRangePicker/TimePicker | Independent native Input/react-date-range/Select implementations | No picker9 field slot here; their DOM/QA/disabled behavior is unchanged and targeted source/browser tests remain mandatory. DateTimePicker embeds Vanguard DatePicker and inherits its new sections. |

Removed: `enableAccessibleFieldDOMStructure={false}`, raw-mask/caret editor and obsolete legacy raw
input event shim. Kept: small props-only calendar/popper class aliases, mobile keyboard toggle,
controlled numeric value boundary, incomplete-edit NaN compatibility and overlay stacking.

Capture Enter handler deliberately does not preventDefault/stopPropagation. Mobile opening checks
picker disabled/readOnly; openRef deduplicates requests. Consumer DateField onKeyDown remains on
MUI's sections event chain. Vanguard has no public onKeyDown/slotProps prop. Six new keyboard tests
and four controlled synchronization tests pass sleep-valid; the reviewer must independently verify
all these statements, pending-state lifetime and classification/AST proof accuracy.

Release limitations remain: root peer baseline, undeclared types, WordPress declarations, runtime
subpaths, browser support policy, and the explicitly pending installed styled-components/react-is
resolution discrepancy documented in verification-s5a.md. No blanket final release waiver.
