# Registry: autocomplete group (S0)

Files (worktree `.claude/worktrees/mui-upgrade`):
src/core/Autocomplete/_Autocomplete.mui.spec.tsx, src/core/Autocomplete/_AutocompleteMuiContract.stories.tsx,
src/core/AutocompleteWithAnchor/_AutocompleteWithAnchor.mui.spec.tsx, src/core/AutocompleteWithAnchor/_AutocompleteWithAnchorMuiContract.stories.tsx,
src/core/SearchableSelect/_SearchableSelect.mui.spec.tsx, src/core/SearchableSelect/_SearchableSelectMuiContract.stories.tsx.

S2 (pickers7): no reds predicted (no pickers in this group).

Abbreviations: AC = src/core/Autocomplete/Autocomplete.tsx, SS = src/core/SearchableSelect/SearchableSelect.tsx,
IB = src/core/_internal/InputBase/InputBase.tsx. "IB Fix A" = the InputBase legacy-props -> slotProps translation
from registry-inputs.md (InputProps/inputProps -> slotProps.input/htmlInput, onScroll merged into htmlInput).

## A. Expected reds

| file | test title | expected red at | production dependency (file:line) | observable contract | planned production fix to return it to green |
|---|---|---|---|---|---|
| _Autocomplete.mui.spec.tsx | clicking an option: onChange(value, "selectOption", {option}) and onInputChange reasons input -> reset | S3 core6 | AC:52-67 (public `onInputChange` picked from MUI props), AC:461 (`{...rest}` passes it through unchanged) | onInputChange reason after selecting is `'reset'` | AC wraps `onInputChange` and maps v6 `'selectOption'` / `'removeOption'` / `'blur'` back to `'reset'` (keeps the public reason set; no internal consumers, grep finds none outside AC). Alternative: approved contract change + consumer audit |
| _Autocomplete.mui.spec.tsx | Tab with a highlighted option auto-selects it (autoSelect default) with reason "blur" | S3 core6 | AC:52-67, AC:461 | onInputChange `['apple','reset']` after auto-select on blur | same reason mapping in AC |
| _Autocomplete.mui.spec.tsx | blur with unmatched text clears the input with onInputChange reason "reset" and no onChange | S3 core6 | AC:52-67, AC:461 | clear-on-blur reported as `'reset'` (v6: `'blur'`) | same reason mapping in AC |
| _Autocomplete.mui.spec.tsx | typing then Enter on the highlighted option adds it; onInputChange resets to "" with reason "reset" | S3 core6 | AC:52-67, AC:461 | multiple: input reset after select reported as `'reset'` | same reason mapping in AC |
| all 3 spec files + all 3 `_*MuiContract.stories.tsx` (+ pre-S0 `_Autocomplete.*`, `_AutocompleteWithAnchor.*`) | every test (module fails to load) | S4 core7 | AC:7-11 deep import `@mui/material/Autocomplete/Autocomplete` | component renders at all | import `AutocompleteProps`, `AutocompleteRenderGetTagProps`, `AutocompleteRenderOptionState` from `@mui/material/Autocomplete` (one level) or `@mui/material` |
| _Autocomplete.mui.spec.tsx | selected values render as deletable chips (vanguard renderTags) before the input | S5 core9 | AC:199-213 (`renderTags`), AC:472 | `.vanguard-input-tags` wrapper before the input, `<Text>` label (`.rc-text`), inline `height:100%`, delete "x", `tabindex=-1` | port to `renderValue(value, getItemProps)`: same wrapper/Chip/Text/inline style, `{...getItemProps({ index })}` |
| _Autocomplete.mui.spec.tsx | clicking a chip delete icon removes it with reason "removeOption" | S5 core9 | AC:199-213, AC:472 | delete "x" removes the chip, onChange reason `removeOption` | renderValue port (chips located via `.vanguard-input-tags`, Autocomplete.tsx:202) |
| _Autocomplete.mui.spec.tsx | Backspace in the empty input removes the last chip with reason "removeOption" | S5 core9 | AC:199-213, AC:472 | Backspace removes last chip | renderValue port |
| _Autocomplete.mui.spec.tsx | ArrowLeft from the empty input moves focus to the last chip, then the previous one | S5 core9 | AC:199-213 (`getTagProps` supplies the index attribute MUI uses to focus) | ArrowLeft/ArrowRight move focus chip <-> input | renderValue port using `getItemProps` (v9 locates items via `data-item-index`) |
| _Autocomplete.mui.spec.tsx | chip labels use option[optionKey] for object options | S5 core9 | AC:205 | chip label = `option[optionKey]` | renderValue port keeps the optionKey label |
| _Autocomplete.mui.spec.tsx | Enter splits comma separated free text into tags with reason "selectOption" | S5 core9 | AC:199-213 (chip assertion), AC:259-287 | split text becomes chips | renderValue port |
| _AutocompleteMuiContract.stories.tsx | Chips Style Contract | S5 core9 | AC:199-213; Autocomplete.scss:35 (`.vanguard-input-tags` max-height/overflow) | tags wrapper style + chip inline height | renderValue port |
| _AutocompleteMuiContract.stories.tsx | Chips Interaction Contract | S5 core9 | AC:199-213 | Backspace / ArrowLeft / delete in a real browser | renderValue port |
| _Autocomplete.mui.spec.tsx | input carries the html attributes MUI passes via renderInput params.inputProps | S5 core9 (likely) | AC:499 `textFieldProps={params}`; IB:1021-1027 (`{...textFieldProps}` then `inputProps={{...textFieldProps.inputProps, onScroll}}`) | `role=combobox`, `autocomplete=off`, `aria-autocomplete`, `aria-expanded`, `autocapitalize`, `spellcheck` on the input | IB Fix A: merge `params.slotProps.htmlInput` (+ legacy `inputProps`) into `slotProps.htmlInput`, keep onScroll; AC keeps passing `params` |
| _Autocomplete.mui.spec.tsx | autoComplete=false switches aria-autocomplete to "list"; every open/keyboard/filter/selection test (`clicking the input opens the listbox ...`, `ArrowDown highlights ...`, `typing filters options ...`, `Enter selects ...`) | S5 core9 (likely) | AC:499; IB:1021-1027 | input ref + onChange/onKeyDown/aria wiring from params reach the native input | IB Fix A |
| _Autocomplete.mui.spec.tsx | options render their adornment[option.key]; selecting puts it into the input start adornment; clearing removes the start adornment | S5 core9 (likely) | AC:512 `adornment=`; IB:532-536 (writes `textFieldProps.InputProps.startAdornment`) | selected option's adornment rendered before the input | IB Fix A (slotProps.input) |
| _Autocomplete.mui.spec.tsx | [v5-quirk] a right-button mousedown on the input toggles the listbox | S5 core9 | none (MUI internal; AC:460 just renders MuiAutocomplete) | right-click opens/closes the listbox | no production fix planned: request approval as an intentional incompatibility (v9 behaviour is better). Do not edit the test without that approval |
| _SearchableSelectMuiContract.stories.tsx | Menu Style Contract | S5 core9 | SS:106-110 `MenuProps.MenuListProps.style.width` | menu list width = trigger offsetWidth - 8 | move to `MenuProps.slotProps.list.style.width`, merged with the existing `slotProps.root` (SS:113) |
| _SearchableSelect.mui.spec.tsx | MenuItems are options; the selected one is aria-selected and the only tabbable item | S5 core9 (UNVERIFIED: depends on how v9 roving tabindex treats `autoFocus: false`) | SS:104 `autoFocus: false`, SS:197 MenuItem | selected item is the single `tabindex=0` item | if v9 leaves all items `-1`: set `tabIndex` on the selected MenuItem (SS:197), or approved contract change |
| _SearchableSelect.mui.spec.tsx | Enter on a focused MenuItem selects it | S5 core9 (UNVERIFIED: v9 Enter/Space now bubble as click) | SS:123-126 Select onChange | Enter on an item calls onSelection(value) once | verify no double call; adapt onChange if MUI now reports a MouseEvent |
| _SearchableSelect.mui.spec.tsx | the menu marks the app container aria-hidden while open (Modal behaviour) | S5 core9 (UNVERIFIED: v9 Backdrop/Modal aria-hidden change) | none (MUI Modal) | page content hidden from AT while the menu is open | verify v9 ModalManager; if dropped, decide the a11y contract |

## B. Baseline characterization

| file | test title | tag | what it locks | why it is suspect |
|---|---|---|---|---|
| _Autocomplete.mui.spec.tsx | [bug-lock] without a `value` prop the container gets vanguard-autocomplete-no-caret | bug-lock | `hideCaret \|\| value !== null` hides the caret when `value` is undefined (AC:436) | every uncontrolled Autocomplete loses its popup caret |
| _AutocompleteMuiContract.stories.tsx | [bug-lock] Caret hidden by default | bug-lock | same, as computed `display:none` | same |
| _Autocomplete.mui.spec.tsx | [bug-lock] a provided single `value` is NOT reflected in the input | bug-lock | `useState((value ?? multiple) ? [] : null)` (AC:178), never synced | the `value` prop is effectively ignored |
| _Autocomplete.mui.spec.tsx | [bug-lock] Enter on an empty input re-emits onChange with the unchanged tags | bug-lock | splitOnEnter runs on every Enter (AC:259-287) | spurious onChange; `detectFocusedOption` (AC:289-299) never sets `optionFocused` true |
| _Autocomplete.mui.spec.tsx | [bug-lock] Enter on a highlighted option adds the inline-completed input text via the split path | bug-lock | split path stops propagation, MUI never selects | adds the input string, not the option object/value |
| _Autocomplete.mui.spec.tsx | [bug-lock] numeric options render empty labels and a selected 0 is never marked selected | bug-lock | `Object.keys(number)` is empty -> label '' (AC:367-371); `!value` -> false (AC:393) | numeric options unusable |
| _SearchableSelect.mui.spec.tsx | [bug-lock] the trigger accessible name is "Without label", even with a value selected | bug-lock | hard-coded `inputProps={{'aria-label':'Without label'}}` (SS:122) | screen readers announce "Without label" |
| _SearchableSelect.mui.spec.tsx | [bug-lock] defaultSelected is ignored | bug-lock | prop declared (SS:18), never read | dead public prop |
| _SearchableSelect.mui.spec.tsx | [bug-lock] search bar and footer children are exposed as extra role=option nodes | bug-lock | MUI Select clones every child with role=option (SS:163-215) | AT sees two extra non-selectable options |
| _SearchableSelect.mui.spec.tsx | [bug-lock] ArrowDown / Enter inside the search input stay in the input (propagation stopped) | bug-lock | onKeyDown stops every key but Escape (SS:186-191) | keyboard users cannot move from search to the items |
| _SearchableSelect.mui.spec.tsx | [bug-lock] hidden options re-appear in search results | bug-lock | `hidden` filtered only without search text (SS:88-94) | hidden options become selectable via search |
| _SearchableSelectMuiContract.stories.tsx | [bug-lock] Trigger CSS order conflict with InputBase | bug-lock | trigger padding-left 18px and end adornment margin-right 8px (InputBase.scss:118, :328 win over SearchableSelect.scss:21, :31) | same-specificity rules: result depends on stylesheet order |
| _Autocomplete.mui.spec.tsx | [v5-quirk] a right-button mousedown on the input toggles the listbox | v5-quirk | MUI v5 handleInputMouseDown ignores the button | MUI behaviour Vanguard did not choose; removed in v9 |
| _Autocomplete.mui.spec.tsx | [v5-quirk] ArrowUp from closed only opens; a second ArrowUp highlights the last option | v5-quirk | MUI v5 keyboard detail | MUI behaviour Vanguard did not choose |
| _Autocomplete.mui.spec.tsx | [v5-quirk] a mid-word match is not bolded (autosuggest-highlight matches word starts only) | v5-quirk | `match()` default word-start matching (AC:332) while MUI filters by "contains" | filter and highlight disagree |
| _Autocomplete.mui.spec.tsx | [v5-quirk] no match with default noOptionsText opens an empty popup (no listbox, no text) | v5-quirk | `noOptionsText = null` default (AC:85) still renders MUI's no-options node | an empty popup box is shown |
