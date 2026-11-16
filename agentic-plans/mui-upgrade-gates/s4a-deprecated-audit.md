# S4a deprecated API disposition

Executable production/config and SCSS audit, excluding tests and stories: exact line-level hits and scanner are retained in `out/s4a-final-implementation-audit/hits.json` and `s4a-exhaustive-audit.py`. The scanner includes the plan's prop/component aliases, deprecated composed classes, old import names and all MUI imports. Generic `components`, prop type names, comments and supported APIs are included for explicit disposition rather than counted as deprecated forwarding.

| Area | Disposition |
|---|---|
| Accordion | Fixed supported heading slot; no spread of consumer transition aliases into MUI. Existing public props remain typed; previously ignored props remain ignored. |
| Drawer | Paper uses slotProps.paper; Modal backdrop uses slotProps.backdrop. ModalProps is supported in installed7.3.11, not a deprecated alias requiring suppression. No arbitrary public passthrough. |
| Popover / PopoverPopper / PopoverModal | Tooltip slots and slotProps; supported PopperProps type and Popper render APIs. No old component alias forwarded. Noninteractive pointer events remain explicit. |
| InputBase / MuiTextField | Public legacy TextField aliases resolve through MuiTextField after theme defaults. Nested Select MenuProps maps legacy list/paper/transition/backdrop and transition component aliases. Select.inputProps and MenuProps themselves remain supported7.3.11 APIs. |
| Input / PhoneNumber / VerificationPinInput / DateRangeInput | textFieldProps are public compatibility inputs consumed by the same mapper. Own InputLabelProps/InputSelectProps names are unrelated to deprecated forwarding. |
| DatePicker | Picker7 field InputProps.ref remains required. Public Input textFieldProps maps through MuiTextField. No picker pin, field DOM, or accessible-field behavior change. Frozen DatePicker invariants covered by preceding504-spec run. |
| DateRangePicker / DropdownMenu | TransitionProps destructured from Popper render callback and spread onto Fade is a render-prop variable. Text field customization flows through public Input. |
| Menu / SearchableSelect | Menu aliases resolved after theme defaults. SearchableSelect uses slotProps.list/root; supported Select.inputProps retained. |
| Autocomplete | Legacy public aliases map to slots/slotProps; renderInput input props are retained picker/core7 API. renderValue uses getItemProps and retains both data-item-index and data-tag-index. SCSS has no index-attribute dependency. |
| Snackbar / SnackbarRoot | Public aliases map through Snackbar compatibility helper. Stable module-level transition slot reads effective legacy component from React context, retaining nested component identity and refs without forwarding TransitionComponent to MUI. Root's public TransitionComponent uses this mapper. |
| Imports/config | One-level public imports; new guard checks static/export/dynamic/require and config alias literals. Frozen original guard unchanged. No runtime package-subpath release claim. |
| SCSS | Only listed deprecated composed-class hit is the empty `.MuiInputBase-inputMultiline {}` rule (no declarations). Other plan-listed old classes have no hits. |

Two deliberate deprecated values remain on underlying MUI calls:

- Snackbar `TransitionProps={{}}`: after resolving outer theme defaults and composing callbacks, blocks inner default resolution from resurrecting legacy enter/exited callbacks. Removing it reproduces the themed callback assertion failure; restoring it passes. This is default suppression, not an event source.
- Autocomplete `renderTags={null!}`: blocks the inner theme's legacy callback from superseding renderValue; preceding real-MUI tests prove that callback stays ignored. No legacy renderTags renderer is invoked.

No zero-alias-count claim. No broader peer or type waiver: root peer baseline, undeclared types, WordPress declarations, public runtime subpaths and consumer browser policy remain explicit root release limitations. This audit does not accept S4a or authorize S4b.

Popover correction supersedes the earlier custom-popper disposition: keep default styled TooltipPopper, add Vanguard/dark class via slotProps.popper.className, retain SCSS direct import and sizing/zIndex/placement, remove custom replacement slot and inline pointer-events. See s4a-styled-slot-audit.md for all related migration boundary comparisons. Frozen geometry10-story suite now passes unchanged.
