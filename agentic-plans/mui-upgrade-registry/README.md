# MUI upgrade: test registry

One file per component group. Each has:

1. **A. Expected reds**: tests predicted to fail at a bump stage (S2 pickers 7.29, S3 core 6.5, S4 core 7.3 +
   pickers 8.29, S5 core 9.5 + pickers 9.17), with the Vanguard production dependency (file:line), the observable
   contract, and the planned PRODUCTION fix that returns the test to green.
2. **B. Baseline characterization**: tests titled `[bug-lock]` (behaviour we believe is a Vanguard bug) or
   `[v5-quirk]` (odd or MUI-v5-default behaviour Vanguard did not choose). Each such test carries the comment
   `// Baseline characterization: not a promised contract.`

| group | file |
|---|---|
| InputBase, Input, FormControl, FlagAdornment, Select, Textarea, PhoneNumber, VerificationPinInput, TimePicker | [inputs.md](inputs.md) |
| Autocomplete, AutocompleteWithAnchor, SearchableSelect | [autocomplete.md](autocomplete.md) |
| Popover, PopoverPopper, PopoverModal, Menu, MenuItem, DropdownMenu, Drawer | [overlays.md](overlays.md) |
| DatePicker, DateRangeInput, DateRangePicker, DateRangePickerBaseInputAdornment, DateTimePicker | [dates.md](dates.md) |
| AIAssistantPanel, Accordion, AppBar, Toolbar, Collapse, ListShowMore, DocumentDisplay, DocumentUpload | [layout.md](layout.md) |
| Button, ToggleButton, ToggleButtonGroup, Slider, ProgressBar, Snackbar, SnackbarRoot, hex-to-rgba | [controls.md](controls.md) |

## Rules

1. An expected red is a diagnostic prediction. It is NOT permission to skip, `xfail`, delete or edit the test
   after the bump. Return it to green by fixing production code, or record an explicitly approved contract change
   under "Intentional incompatibilities" in `../mui-upgrade-plan.md` before touching the test.
2. An UNEXPECTED red (not in table A) in an untagged test is a regression until proven otherwise.
3. A red in a `[bug-lock]` / `[v5-quirk]` test means behaviour changed. These tests describe the baseline, not a
   promise. Decide per case: keep the old behaviour (production fix), or approve the new behaviour (contract
   change, listed in the plan, then update the test in the same change). Fixing the underlying Vanguard bug is out of
   scope for the upgrade. Do not turn accidental behaviour into new public API.
4. Tests assert MUI classes or DOM only where Vanguard production SCSS, runtime selectors, QA ids or public
   contract depend on them. The grep hit is recorded next to the assertion or in the group file. MUI internals
   without such a dependency were removed in S0 and replaced by observable outcomes (geometry, computed style,
   role/aria).
