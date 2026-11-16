# Registry: inputs group (S0)

Files: src/core/_internal/InputBase/_InputBase.mui.spec.tsx, _InputBaseMuiContract.stories.tsx; src/core/Input/_Input.mui.spec.tsx;
src/core/FormControl/_FormControl.mui.spec.tsx; src/core/FlagAdornment/_FlagAdornment.mui.spec.tsx; src/core/Select/_Select.mui.spec.tsx,
_SelectMuiContract.stories.tsx; src/core/Textarea/_Textarea.mui.spec.tsx, _TextareaMuiContract.stories.tsx;
src/core/PhoneNumber/PhoneNumberBase/_PhoneNumberBase.mui.spec.tsx; src/core/PhoneNumber/PhoneNumberPrefix/_PhoneNumberPrefix.mui.spec.tsx;
src/common/VerificationPinInput/_VerificationPinInput.mui.spec.tsx; src/core/TimePicker/_TimePicker.mui.spec.tsx, _TimePickerMuiContract.stories.tsx.

S2 (pickers7), S3 (core6), S4 (core7+pickers8): no reds predicted for this group. The legacy TextField props are only deprecated
until v9, and nothing here uses pickers. UNVERIFIED for v6/v7 internals (e.g. the SelectInput imperative handle).

## A. Expected reds

Abbreviations: IB = src/core/_internal/InputBase/InputBase.tsx. "Fix A" = InputBase translates its own props AND consumer
`textFieldProps` legacy keys (`InputProps`, `inputProps`, `InputLabelProps`, `SelectProps`, `FormHelperTextProps`) into
`slotProps.input / htmlInput / inputLabel / select / formHelperText`, keeping today's precedence (vanguard adornments over
consumer adornments; consumer top-level keys over InputBase's; InputBase onScroll merged into htmlInput).

| file | test title | expected red at | production dependency (file:line) | observable contract | planned production fix to return it to green |
|---|---|---|---|---|---|
| _InputBase.mui.spec.tsx | InputProps.startAdornment / endAdornment / readOnly | S5 core9 | IB:1021 `{...textFieldProps}` | consumer InputProps adornments/readOnly render | Fix A |
| _InputBase.mui.spec.tsx | InputProps.inputComponent replaces the native input and receives inputProps | S5 core9 | IB:1021-1027 | custom input component + its props | Fix A |
| _InputBase.mui.spec.tsx | inputProps maxLength / inputMode / data-* / aria-* land on the input | S5 core9 | IB:1022-1027 | native attrs from consumer | Fix A (htmlInput) |
| _InputBase.mui.spec.tsx | InputLabelProps.shrink forces the floating label to shrink | S5 core9 | IB:1021 | label shrink from consumer | Fix A (inputLabel) |
| _InputBase.mui.spec.tsx | FormHelperTextProps reaches the helper <p> | S5 core9 | IB:1021 | helper attrs from consumer | Fix A (formHelperText) |
| _InputBase.mui.spec.tsx | SelectProps.native renders a native <select> with the given options | S5 core9 | IB:1021 | native select + onChange | Fix A (select) |
| _InputBase.mui.spec.tsx | [bug-lock] SelectProps.MenuProps reaches the menu, but replaces InputBase SelectProps entirely | S5 core9 | IB:755-777, 1021 | consumer MenuProps reach the paper | Fix A; separately decide merge (bug) |
| _InputBase.mui.spec.tsx | [bug-lock] InputLabelProps from textFieldProps replaces InputBase label props (...) | S5 core9 | IB:1001, 1021 | consumer label attrs | Fix A |
| _InputBase.mui.spec.tsx | labelType=%s keeps the label permanently shrunk (static, outer) | S5 core9 | IB:453-459, 1001 `InputLabelProps={getLabelProps()}` | label data-shrink + labelStyle | Fix A (own label props -> slotProps.inputLabel) |
| _InputBase.mui.spec.tsx | adornment becomes MUI startAdornment before the input / endAdornment becomes MUI endAdornment after the input | S5 core9 | IB:532-544 (writes textFieldProps.InputProps) | adornment DOM order | Fix A (slotProps.input) |
| _InputBase.mui.spec.tsx | roundedNumericCTAType on InputNumber renders step buttons that call back | S5 core9 | IB:546-551 | step buttons + callbacks | Fix A |
| _InputBase.mui.spec.tsx | textFieldProps precedence: all tests in describe "adornments", "inputProps", "refs", "label and select" (incl. [bug-lock] ones) | S5 core9 | IB:532-551, 1001, 1012, 1020-1027 | which source wins / which ref gets the node / which handler runs | Fix A, preserving each locked precedence |
| _InputBase.mui.spec.tsx | scrolling the input moves the highlight backdrop by the input scroll offset; pasting resyncs ...; [bug-lock] inputProps.onScroll from the consumer is replaced by InputBase | S5 core9 | IB:1022-1027 (`inputProps.onScroll`) | backdrop follows textarea scroll | Fix A (onScroll in slotProps.htmlInput) |
| _InputBase.mui.spec.tsx | opening the menu registers a popover slot and applies its z-index; closing releases it / unmounting with the menu open releases the stacking slot | S5 core9 | IB:307-318, 760-769 (`SelectProps.onOpen/onClose`, `MenuProps.sx`) | menu z-index from OverlayStackingService | Fix A (slotProps.select) |
| _InputBase.mui.spec.tsx | menu paper caps its height ... / default menu paper height cap is 36 * 7 = 252px | S5 core9 | IB:770-774 (`MenuProps.PaperProps`) | paper max-height | `MenuProps.slotProps.paper` |
| _InputBase.mui.spec.tsx | selectRenderValue renders the selected value; keyboard: ArrowDown opens ... | S5 core9 | IB:761 (`SelectProps.renderValue`) | displayed value | Fix A |
| _InputBase.mui.spec.tsx | renders a combobox labelled by the <label> and the display node | S5 core9 | none (TextField select label element) | label is a <label> | contract decision: pass `slotProps.inputLabel.component='label'` or approve change |
| _InputBase.mui.spec.tsx | while the menu is open the page content is hidden from assistive tech | S5 core9 (UNVERIFIED) | none | aria-hidden on page while menu open | verify v9 Modal; if removed, decide a11y contract |
| _InputBase.mui.spec.tsx | Select dispatches the chosen value and syncs the hidden native input eagerly | S5 core9 (UNVERIFIED) | IB:906-907 (writes `.value` on the SelectInput handle) | formconfig ref value after select | adapt IB:906-907 to the v9 handle |
| _Input.mui.spec.tsx | textFieldProps.InputProps.readOnly and inputProps reach the DOM | S5 core9 | IB:1021-1027 | readOnly/maxLength/inputMode/data-qa/shrink | Fix A |
| _Input.mui.spec.tsx | adornment and endAdornment render on both sides of the input | S5 core9 | IB:532-544 | adornment order | Fix A |
| _Select.mui.spec.tsx | renders a collapsed combobox named by its <label> | S5 core9 | none | label element | as InputBase label row |
| _Select.mui.spec.tsx | shows the selected option title ...; value not in options ...; translateOptions=false ...; clicking an option ...; keyboard ...; customInputRenderer ...; valueAsDefaultValue=false ...; [v5-quirk] default ... uncontrolled; [bug-lock] formconfig.stateValue echoes ... | S5 core9 | src/core/Select/Select.tsx:126 `selectRenderValue` -> IB:761 | displayed value | Fix A |
| _Select.mui.spec.tsx | registers an OverlayStackingService popover slot while open; menu paper is capped to 7 rows ... | S5 core9 | IB:760-774 | z-index, max-height | Fix A + slotProps.paper |
| _Select.mui.spec.tsx | [bug-lock] a synthetic click on a disabled option still selects it | S5 core9 | none (MUI ButtonBase) | disabled option selectable by synthetic click | none: v9 fixes the bug; approve contract change |
| _Select.mui.spec.tsx | [bug-lock] adornment[i] is shown in option i, and adornment[selected.key] as start adornment | S5 core9 | Select.tsx:122 -> IB:532-537 | start adornment | Fix A |
| _TimePicker.mui.spec.tsx | showAmPm ...; value shows ...; falls back to formconfig.getValue(); freeSolo ...; the open menu holds an OverlayStackingService slot | S5 core9 | TimePicker -> Select.tsx:126 -> IB:761, 760-769 | displayed time, z-index | Fix A |
| _Textarea.mui.spec.tsx | defaults: static (shrunk) label and a visible counter; adornment is rendered as MUI startAdornment | S5 core9 | IB:1001, 532-537 | label shrink, adornment order | Fix A |
| _PhoneNumberPrefix.mui.spec.tsx | shows the dial code as value and the flag as MUI start adornment | S5 core9 | PhoneNumberPrefix.tsx:52 `adornment` -> IB:532-537 | flag before input | Fix A |
| _PhoneNumberBase.mui.spec.tsx | renders the IMask input inside the MUI input root ...; [v5-quirk] inputProps.phoneMask reaches the inputComponent ...; typing digits is masked ...; inputRef receives the IMask native input ...; formConfig maps to InputBase formconfig | S5 core9 | src/core/PhoneNumber/PhoneNumberBase/PhoneNumberBase.tsx:56-63 (`textFieldProps.InputProps.inputComponent`, `inputProps.phoneMask`) | mask, placeholder, ref | PhoneNumberBase -> `slotProps.input.inputComponent` + `slotProps.htmlInput.phoneMask` (or Fix A) |
| _VerificationPinInput.mui.spec.tsx | renders one IMask input ...; [v5-quirk] inputProps.pinMask reaches the inputComponent ...; typing fills the mask ...; formConfig ref receives the IMask native input | S5 core9 | src/common/VerificationPinInput/VerificationPinInput.tsx:39-46 | mask, onChange shape, ref | same as PhoneNumberBase |
| _InputBaseMuiContract.stories.tsx | Label Floating And Shrink (static label part); Adornment Margins; Select Display And Menu | S5 core9 | IB:1001, 532-544, 760-774 | SCSS on shrunk label, adornment margins, menu z-index/max-height | Fix A |
| _SelectMuiContract.stories.tsx | Menu Portal Stacking And Geometry; Selected Option Styling; Keyboard Selection | S5 core9 | IB:760-774; Select.tsx:126 | z-index 1101, max/min-width, selected styling | Fix A |
| _TimePickerMuiContract.stories.tsx | Menu Opens And Selects (252px cap) | S5 core9 | IB:770-774 | paper max-height | slotProps.paper |

## B. Baseline characterization

| file | test title | tag | what it locks | why it is suspect |
|---|---|---|---|---|
| _InputBase.mui.spec.tsx | [bug-lock] puts role="textbox" and data-testid on the MUI FormControl wrapper, not on the input | bug-lock | wrapper div has role=textbox (2 textboxes) | duplicate a11y role |
| _InputBase.mui.spec.tsx | [v5-quirk] passes the type prop verbatim; default type is the capitalised string "Text" | v5-quirk | default `type="Text"` | invalid-cased type value |
| _InputBase.mui.spec.tsx | [v5-quirk] counter shows 0 for a numeric controlled value | v5-quirk | numeric value counts 0 | counter wrong for numbers |
| _InputBase.mui.spec.tsx | [bug-lock] inputProps.onScroll from the consumer is replaced by InputBase | bug-lock | consumer onScroll dropped | silent override |
| _InputBase.mui.spec.tsx | [bug-lock] InputLabelProps from textFieldProps replaces InputBase label props (labelStyle and static shrink are lost) | bug-lock | consumer InputLabelProps wipes labelStyle/shrink | no merge |
| _InputBase.mui.spec.tsx | [bug-lock] adornment props are merged into the caller-owned textFieldProps.InputProps object | bug-lock | caller object mutated | prop mutation |
| _InputBase.mui.spec.tsx | [bug-lock] SelectProps.MenuProps reaches the menu, but replaces InputBase SelectProps entirely | bug-lock | renderValue/onOpen/height cap/stacking lost, z-index 1300 | no merge; menu behind modals |
| _InputBase.mui.spec.tsx | [v5-quirk] the vanguard maxLength prop feeds only the counter; only inputProps.maxLength limits the input | v5-quirk | maxLength not enforced in DOM | surprising API |
| _InputBase.mui.spec.tsx | [bug-lock] textFieldProps.InputProps.inputProps replaces textFieldProps.inputProps and InputBase onScroll | bug-lock | nested inputProps wins wholesale | keys + scroll sync lost |
| _InputBase.mui.spec.tsx | [bug-lock] textFieldProps.onChange replaces InputBase onChange: vanguard onChange, counter and formconfig dispatch are lost | bug-lock | consumer onChange replaces InputBase's | form state silently broken |
| _InputBase.mui.spec.tsx | [bug-lock] textFieldProps.InputProps.onChange replaces both the TextField and the vanguard onChange | bug-lock | InputProps.onChange wins | same |
| _InputBase.mui.spec.tsx | [bug-lock] textFieldProps.onFocus / onBlur replace the vanguard onFocus / onBlur | bug-lock | consumer focus handlers win | vanguard handlers dropped |
| _InputBase.mui.spec.tsx | [bug-lock] textFieldProps.onKeyDown replaces InputBase keydown: Enter and "e" are no longer blocked | bug-lock | key guards lost | number/Enter guards bypassed |
| _InputBase.mui.spec.tsx | [bug-lock] textFieldProps.inputRef takes the DOM node; inputRef prop and formconfig._inputRef stay empty | bug-lock | consumer ref wins | form ref empty -> getValue breaks |
| _InputBase.mui.spec.tsx | [bug-lock] textFieldProps.InputProps.inputRef also takes the DOM node from the vanguard inputRef | bug-lock | same via InputProps | same |
| _InputBase.mui.spec.tsx | [bug-lock] textFieldProps.InputLabelProps.shrink=false un-shrinks a labelType=static label | bug-lock | consumer shrink beats labelType | static label overlaps value |
| _InputBase.mui.spec.tsx | [bug-lock] selectDisplayEmpty is accepted but not forwarded: an empty value skips selectRenderValue | bug-lock | prop ignored | dead public prop |
| _Input.mui.spec.tsx | [v5-quirk] size prop is accepted but not forwarded to MUI: small renders exactly like medium | v5-quirk | size ignored | dead public prop (@todo) |
| _Select.mui.spec.tsx | [bug-lock] className goes on the container; testId is duplicated on container AND MUI root | bug-lock | two elements with same data-testid | QA id ambiguity |
| _Select.mui.spec.tsx | [bug-lock] a synthetic click on a disabled option still selects it | bug-lock | disabled option selectable programmatically | MUI v5 ButtonBase |
| _Select.mui.spec.tsx | [bug-lock] adornment[i] is shown in option i, and adornment[selected.key] as start adornment | bug-lock | key vs index mismatch | wrong adornment |
| _Select.mui.spec.tsx | [v5-quirk] default (valueAsDefaultValue=true) is uncontrolled: later value props do not change the display | v5-quirk | value prop read once | surprising for a `value` prop |
| _Select.mui.spec.tsx | [bug-lock] formconfig.stateValue echoes through onChange with the matching option | bug-lock | echo fires but display resets to empty | effect ordering bug |
| _Textarea.mui.spec.tsx | [v5-quirk] minRows/maxRows drive TextareaAutosize; no rows attribute is rendered | v5-quirk | no rows attr | MUI v5 prop ordering |
| _Textarea.mui.spec.tsx | [v5-quirk] getRowsBasedOnContent is an exported no-op | v5-quirk | exported empty fn | dead export |
| _PhoneNumberBase.mui.spec.tsx | [v5-quirk] inputProps.phoneMask reaches the inputComponent: placeholder is the country mask | v5-quirk | vanguard placeholder dropped | IMask ignores MUI placeholder |
| _VerificationPinInput.mui.spec.tsx | [bug-lock] the IMask input does not get the MUI input class, so InputBase.scss input padding skips it | bug-lock | no `.MuiOutlinedInput-input` on input | SCSS padding not applied |
| _VerificationPinInput.mui.spec.tsx | [v5-quirk] inputProps.pinMask reaches the inputComponent: lazy mask shows N placeholders | v5-quirk | "12345" placeholder dropped | IMask ignores MUI placeholder |
| _TimePicker.mui.spec.tsx | [bug-lock] changing hourListType after mount does not regenerate options | bug-lock | options effect deps miss hourListType | stale options |
