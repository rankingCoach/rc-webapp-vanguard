# Registry: controls/feedback group (Button, ToggleButton, ToggleButtonGroup, Slider, ProgressBar, Snackbar, SnackbarRoot, hex-to-rgba)

Files (all S0):
`src/helpers/_hex-to-rgba.spec.ts`, `src/core/Button/_Button.mui.spec.tsx`, `src/core/ToggleButton/_ToggleButton.mui.spec.tsx`,
`src/core/ToggleButtonGroup/_ToggleButtonGroup.mui.spec.tsx`, `src/core/Slider/_Slider.mui.spec.tsx`,
`src/core/ProgressBar/_ProgressBar.mui.spec.tsx`, `src/core/Snackbar/_Snackbar.mui.spec.tsx`,
`src/core/SnackbarRoot/_SnackbarRoot.mui.spec.tsx`, `src/core/ToggleButtonGroup/_ToggleButtonGroupMuiContract.stories.tsx`,
`src/core/Slider/_SliderMuiContract.stories.tsx`, `src/core/ProgressBar/_ProgressBarMuiContract.stories.tsx`,
`src/core/SnackbarRoot/_SnackbarRootMuiContract.stories.tsx`.
Story test titles are the story `name` (tagged) or the de-camel-cased export name. `it.each` titles are the
template with `%s` placeholders.

## A. Expected reds

An expected red is a diagnostic prediction, NOT permission to skip/xfail/delete/edit the test after the bump.

| file | test title | expected red at | production dependency (file:line) | observable contract | planned production fix to return it to green |
|---|---|---|---|---|---|
| ToggleButton/_ToggleButton.mui.spec.tsx | [v5-quirk] Enter calls onChange with the keydown event and does not dispatch a click to ancestors | S5 core9 | ToggleButton.tsx:17 (spreads `component` to MUI ButtonBase) | non-native toggle: Enter -> onChange(KeyboardEvent), no click bubbles | approved contract change (v9: onChange gets a MouseEvent and the click bubbles, consistent with native buttons) |
| ToggleButton/_ToggleButton.mui.spec.tsx | [v5-quirk] Space calls onChange with the keyup event and does not dispatch a click to ancestors | S5 core9 | ToggleButton.tsx:17 | same for Space | approved contract change (same as above) |
| ToggleButton/_ToggleButton.mui.spec.tsx | [bug-lock] non-native element: a dispatched click and Space still fire onChange, Enter does not | S5 core9 | ToggleButton.tsx:17 | disabled non-native toggle still runs handlers | approved contract change (v9 runs no handlers on disabled non-native elements; fixes the bug) |
| Slider/_Slider.mui.spec.tsx | [v5-quirk] onChange/onChangeCommitted receive MUI v5 mouse events (mousedown, mousemove, mouseup) | S5 core9 | Slider.tsx:111 (`onChange={handleOnChange}` forwards MUI's event) | onChange event type during a drag | approved contract change (v9 passes pointer events; consumers only read value/activeThumb) |
| Slider/_Slider.mui.spec.tsx | [v5-quirk] touchstart/touchmove/touchend change and commit the value | S5 core9 | Slider.tsx:104 (MUI Slider handles input) | touch drag via TouchEvents | approved contract change (v9 handles touch through pointer events; real-browser `Drag In Real Browser` story is the contract) |
| Slider/_Slider.mui.spec.tsx | drag-based tests (`press jumps, move follows, release commits; ...`, `passes a cloned event ...`, `adds MuiSlider-dragging ...`, `rounds to step ...`, `ignores non-left mouse buttons`, `drag also works without ...`, `disables the input and ignores drag`, controlled/uncontrolled + range tests) | POSSIBLE S5 core9 (UNVERIFIED) | Slider.tsx:104 | drag changes value/activeThumb; dragging class (Slider.scss:67) | the jsdom helper already dispatches pointer-typed events before the mouse events, so these should stay green if v9 reads clientX/button from `pointerdown`/`pointermove`. If red: investigate whether v9 needs real PointerEvent fields (jsdom 26 has no PointerEvent) before any production change; never edit the test without approval |
| Snackbar/_Snackbar.mui.spec.tsx | ContentProps reach the SnackbarContent (removed in v9 -> slotProps.content) | S5 core9 | Snackbar.tsx:15 (spreads public `SnackbarProps`) | consumer ContentProps (className, aria) reach the alert | Snackbar.tsx: map `ContentProps` -> `slotProps.content` (compat shim), or approved contract change |
| Snackbar/_Snackbar.mui.spec.tsx | ClickAwayListenerProps.mouseEvent changes the clickaway trigger (removed in v9 -> slotProps.clickAwayListener) | S5 core9 | Snackbar.tsx:15 | consumer can change the clickaway trigger | Snackbar.tsx: map `ClickAwayListenerProps` -> `slotProps.clickAwayListener` |
| Snackbar/_Snackbar.mui.spec.tsx | [v5-quirk] ClickAwayListenerProps.onClickAway replaces the built-in handler, so onClose gets no clickaway | S5 core9 | Snackbar.tsx:15 | override semantics of onClickAway | same shim as above (keep the override order) or approved contract change |
| Snackbar/_Snackbar.mui.spec.tsx | TransitionComponent + TransitionProps drive a custom Slide (removed in v9 -> slots/slotProps.transition) | S5 core9 | Snackbar.tsx:15 | consumer transition + callbacks (onEntered/onExited) | Snackbar.tsx: map `TransitionComponent` -> `slots.transition`, `TransitionProps` -> `slotProps.transition` |
| SnackbarRoot/_SnackbarRoot.mui.spec.tsx | enters with the left Slide: transform none + transform transition while entering | S5 core9 | SnackbarRoot.tsx:45 (`TransitionComponent={SlideTransitionLeft}`) | app toast slides in from the right | SnackbarRoot.tsx:45: `slots={{ transition: SlideTransitionLeft }}` |
| SnackbarRoot/_SnackbarRoot.mui.spec.tsx | closes after autoHideDuration 3000 and calls the caller's onClose once | S5 core9 (exit-transform assertion only) | SnackbarRoot.tsx:45 | toast slides out (translateX) before unmount | same fix as above |
| SnackbarRoot/_SnackbarRootMuiContract.stories.tsx | Slides In From The Right At Top Right | S5 core9 | SnackbarRoot.tsx:45 | real-browser slide-in from the right, top/right 24px | same fix as above |
| SnackbarRoot/_SnackbarRootMuiContract.stories.tsx | Escape Dismisses And Slides Out To The Right | S5 core9 | SnackbarRoot.tsx:45 | real-browser slide-out to the right | same fix as above |
| ToggleButton/_ToggleButton.mui.spec.tsx, ToggleButtonGroup/_ToggleButtonGroupMuiContract.stories.tsx | `reflects selected as aria-pressed=true and the selected fill`, `size, color and fullWidth change the painted button ...`, `Selected And Disabled Paint`; ToggleButtonGroup spec `passes size, color and fullWidth ...` | POSSIBLE S3 core6 / S5 core9 (UNVERIFIED) | ToggleButton.tsx:17, ToggleButtonGroup.tsx:15 (default MUI theme paint, no Vanguard override) | selected fill rgba(0,0,0,0.08), padding 7/11px, primary colour | if MUI's default ToggleButton paint changes: approved contract change, or pin the v5 values in a Vanguard theme/SCSS override |

Expected to stay GREEN at every stage (a red is a regression to fix in production code):
1. All of `Button/_Button.mui.spec.tsx`: Button is a native `<button>` (no ButtonBase/TouchRipple); its only MUI piece
   is `Grow` (Button.tsx:515, :518). Keyboard activation, event propagation, disabled/loading and the Grow icon swap
   must not change.
2. `ToggleButtonGroup/_ToggleButtonGroupMuiContract.stories.tsx` joined-corner geometry (Horizontal Joined Row,
   Vertical Joined Column): v9 removes `groupedHorizontal/Vertical`, the painted result must survive.
3. `Slider/_SliderMuiContract.stories.tsx` Drag In Real Browser / Click Jumps To Position / Keyboard In Real Browser
   (user-event dispatches pointer + mouse events, so the drag contract holds across the pointer-event switch) and the
   Slider.scss computed-style stories (red there = a renamed/re-nested `.MuiSlider-*` class, fix in Slider.scss).
4. ProgressBar spec + stories (`.MuiLinearProgress-bar` survives in v9; only composed bar classes go, not asserted).
5. `hex-to-rgba` table: no change expected (`hexToRgb` change not documented, UNVERIFIED); red = MUI parser changed, fix in
   src/helpers/hex-to-rgba.ts.

## B. Baseline characterization

| file | test title | tag | what it locks | why it is suspect |
|---|---|---|---|---|
| helpers/_hex-to-rgba.spec.ts | [v5-quirk] alpha %s -> %s | v5-quirk | alpha appended verbatim (1.5, -1 not clamped) | out-of-range alpha produces invalid CSS silently |
| helpers/_hex-to-rgba.spec.ts | [bug-lock] %s with alpha %s -> %s (4/8-digit input) | bug-lock | `#ffff`/`#ff000080` -> `rgbaa(..., a,alpha)` | invalid CSS; 'rgb'->'rgba' rewrite assumes MUI never returns rgba |
| helpers/_hex-to-rgba.spec.ts | [bug-lock] %s with alpha %s -> %s (no leading #) | bug-lock | `fff` -> `rgba(255, 255,1)` | MUI's hexToRgb always drops the first char |
| helpers/_hex-to-rgba.spec.ts | [v5-quirk] empty hex %j returns an empty string | v5-quirk | `''`/`'#'` -> `''` | empty string instead of an error |
| helpers/_hex-to-rgba.spec.ts | [bug-lock] %s with alpha %s -> %s (no throw) | bug-lock | `#ggg` -> NaN channels, odd lengths -> extra channels | no validation |
| ProgressBar/_ProgressBar.mui.spec.tsx | [bug-lock] sets no aria-valuenow and no bar transform when progressValue is omitted | bug-lock | determinate without value -> no transform (bar paints full) + MUI dev error | empty progress renders as complete |
| Slider/_Slider.mui.spec.tsx | [bug-lock] forwards targetRef to the MUI root <span> (typed as HTMLInputElement) | bug-lock | targetRef.current is the root span | type says input element |
| Slider/_Slider.mui.spec.tsx | [v5-quirk] no mark label is the first <span> child, so the SCSS :first-of-type / :nth-child(1) rules never match | v5-quirk | Slider.scss:116/:121 first-label rules match nothing | dead CSS (rail is the first span) |
| Slider/_SliderMuiContract.stories.tsx | [v5-quirk] the first mark label is not hidden by span.MuiSlider-markLabel:first-of-type | v5-quirk | every mark label displays (flex) | same dead CSS, real browser |
| Slider/_Slider.mui.spec.tsx | [bug-lock] calls onChange twice on mount with a null event | bug-lock | mount -> onChange(null, undefined, undefined), onChange(null, v, v) | spurious change events; activeThumb receives the value |
| Slider/_Slider.mui.spec.tsx | [bug-lock] calls onChange(null, value, value) when the value prop changes | bug-lock | prop change echoed through onChange | consumer sees its own update as a user change |
| Slider/_Slider.mui.spec.tsx | [v5-quirk] onChange/onChangeCommitted receive MUI v5 mouse events (mousedown, mousemove, mouseup) | v5-quirk | event types during drag | MUI v5 detail, changes to pointer events in v9 |
| Slider/_Slider.mui.spec.tsx | [v5-quirk] touchstart/touchmove/touchend change and commit the value | v5-quirk | touch drag via TouchEvents | MUI v5 detail, pointer events in v9 |
| Slider/_Slider.mui.spec.tsx | [v5-quirk] externalControlled: a move to the already reported position fires onChange again | v5-quirk | duplicate onChange with the same value | MUI compares with its stale controlled value |
| Slider/_Slider.mui.spec.tsx | [bug-lock] leaves formconfig._inputRef unattached when targetRef is omitted | bug-lock | `_inputRef.current` stays null | effect reassigns a local variable only |
| Slider/_Slider.mui.spec.tsx | [bug-lock] on mount the value prop overrides formconfig.stateValue; a later stateValue change is displayed | bug-lock | value prop wins over stateValue at mount | effect order; form state not shown initially |
| ToggleButton/_ToggleButton.mui.spec.tsx | [v5-quirk] Enter calls onChange with the keydown event and does not dispatch a click to ancestors | v5-quirk | Enter on non-native -> keydown event, no bubbling click | MUI v5 ButtonBase detail |
| ToggleButton/_ToggleButton.mui.spec.tsx | [v5-quirk] Space calls onChange with the keyup event and does not dispatch a click to ancestors | v5-quirk | Space on non-native -> keyup event, no bubbling click | MUI v5 ButtonBase detail |
| ToggleButton/_ToggleButton.mui.spec.tsx | [bug-lock] non-native element: a dispatched click and Space still fire onChange, Enter does not | bug-lock | disabled non-native still runs click/Space handlers | disabled control reacts |
| ToggleButtonGroup/_ToggleButtonGroupMuiContract.stories.tsx | [v5-quirk] buttons rendered by one child component are not joined | v5-quirk | all corners rounded when buttons come from one child component | MUI counts direct children only |
| Snackbar/_Snackbar.mui.spec.tsx | [v5-quirk] ClickAwayListenerProps.onClickAway replaces the built-in handler, so onClose gets no clickaway | v5-quirk | consumer onClickAway overrides MUI's | surprising override order |
| SnackbarRoot/_SnackbarRoot.mui.spec.tsx | [bug-lock] a clickaway closes the toast and calls onClose | bug-lock | any page click dismisses + runs onClose | onClose ignores MUI's reason |
| SnackbarRoot/_SnackbarRootMuiContract.stories.tsx | [bug-lock] a click anywhere else dismisses the toast | bug-lock | same, real browser | same |
| SnackbarRoot/_SnackbarRoot.mui.spec.tsx | [bug-lock] a second message replaces the first; only one toast exists; the first onClose is never called | bug-lock | no queue; first onClose dropped | lost messages and callbacks |
| SnackbarRoot/_SnackbarRoot.mui.spec.tsx | [bug-lock] a root mounted after messages were published replays them and shows the last one | bug-lock | ReplaySubject replays old toasts | stale toast on (re)mount |
| SnackbarRoot/_SnackbarRoot.mui.spec.tsx | [bug-lock] unmounting does not remove its pub-sub subscription | bug-lock | subscriptions never unsubscribed | leak; setState on unmounted roots |
| SnackbarRoot/_SnackbarRoot.mui.spec.tsx | [v5-quirk] messages published before any root subscribed are dropped | v5-quirk | `$pub` before the first `$sub` is lost | boot-time toasts silently lost |
