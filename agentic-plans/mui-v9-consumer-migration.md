# Vanguard MUI v9 consumer migration — draft

Release target: **Vanguard 3.0.0**, selected by the user on 2026-11-06. S5a and S5b are accepted. package.json remains 2.9.1; standard-version computes the major release from the breaking conventional commit on master. Nobody hand-edits the version. This consumer note remains a release-note DRAFT.
The legacy false-DOM option and raw-mask editor have been removed. A props-only legacy
`MuiPickersPopper-root` class alias remains temporarily beside the real v9 class; it is a
compatibility shim to remove later, not a new public selector promise.

## Supported browsers

User decision (2026-11-06): adopt MUI core9 upstream minimums.

| Browser | Minimum supported version |
|---|---:|
| Chrome |117|
| Edge |121|
| Firefox |121|
| Safari |17.0|
| iOS Safari |17.0|

Chrome 109–116 and iOS 15.4–16.7 drop out relative to the previous baseline. In rc-webapp's production browserslist, the newly excluded entries represent about 3.05% global usage in the locked data, **not RankingCoach traffic**. See [browser baseline and exact query results](mui-v9-browser-baseline.md); the dataset is stale and no customer-traffic or minimum-browser test-matrix claim is made.

**Consumer ACTION ITEM:** the rc-webapp team should align its own browserslist and support statement with these minimums. We do not edit that repo. Vanguard gains no browserslist field, and no build target/output is changed by this documentation decision.

## Field DOM and test queries

The DatePicker field now uses the genuine MUI DateField/PickersTextField/PickersSectionList.
A labelled group contains month/day/year spinbuttons. A separate aria-hidden input stores the
locale-formatted serialization. The old single editable input, type=tel, selectionStart/End,
setSelectionRange and raw separator-mask mechanics are no longer the editing API.
DateTimePicker contains DatePicker and inherits this field change. DateRangeInput and
DateRangePicker use their independent native Input/react-date-range paths and keep their native
input DOM and QA ids; their tests must keep native-input queries.

Query the group by its label, edit its actual sections, and scope serialization reads to that field:

```tsx
const field = screen.getByRole('group', { name: 'Pick a date' });
const month = within(field).getAllByRole('spinbutton')[0];
fireEvent.focus(month);
fireEvent.paste(month, { clipboardData: { getData: () => '03/21/2024' } });
const serialized = field.parentElement!.querySelector<HTMLInputElement>('input[aria-hidden="true"]')!;
expect(serialized.value).toBe('03/21/2024');
```

Use the locale's actual section order and format. Select-all temporarily makes the sections-list
root editable and removes individual spinbutton roles; re-query after returning to a section.
Do not use hidden-input readOnly as proof of editor read-only behaviour: inspect the genuine
sections and verify that typing does not change the date. The mobile field retains the accessible
name “Choose date, selected date is …”; click/Enter opens its dialog.

## QA hooks

| Hook | Candidate location |
|---|---|
| `vanguard-input-error-text` | Helper/error Text under the field, retained without duplication |
| Label-based DatePicker lookup | Genuine accessible field group, with labelled spinbuttons |
| Serialized value read | The aria-hidden input belonging to that field |
| Mobile keyboard editor lookup | Sections field scoped within the picker dialog |
| DateRangePicker `${testId}-container`, `-references`, `-left-reference-container`, `-right-reference-container` | Existing outer range container/reference divs, unchanged |
| DateRangePicker `${testId}-datepicker-reference-input`, `${testId}-rangeselector-reference-input` | Existing TextField roots, unchanged |
| `datepicker-reference`, `rangeselector-reference-input` | Existing native range reference inputs, unchanged |
| DateRangeInput consumer `testId` | Existing InputBase TextField root, unchanged |

DatePicker's public props do not introduce a testId prop. Generated label ids are implementation
ids; tests should not persist their generated strings. Fresh review checked this inventory against the accepted pre-migration markup; final validation
passed. See review-s5a.md and the final evidence index; S5a and S5b are accepted.

## Editor and onChange payload changes

Out-of-range section digits are rejected while typing: the legacy raw string `13/45/2024`
cannot be entered. Separators move between sections or do nothing; they no longer shift digits.
Use a valid section-wise or formatted full-date operation to exercise a specific intended date.
For validation tests use an accepted invalid date or incomplete date and assert validation itself.

onChange may fire with valid intermediate years while typing the year; validate on blur/accept,
or use onAccept when using MUI pickers directly. Vanguard's current DatePicker wrapper exposes
onChange, not onAccept or onBlur: do not pass unsupported wrapper props. Vanguard consumers should
validate a completed selection or at their form submission boundary.

The public callback remains numeric milliseconds, null or undefined. MUI's internal null clear
currently maps through optional valueOf to public **undefined**, replacing the old NaN result for
the approved complete-date Delete action. Partial invalid edits still publish NaN in the retained
compatibility path; this draft does not claim all partial input emits undefined. During a full year
entry v9 can publish numeric intermediate years0002/0020/0202/2024. See the classification/proofs
in verification-s5a.md for the exact approved sequence and final validation evidence.

Escape may return actual focus to the field and retain its ring. The ring must disappear after
focus leaves the field. This accessible focus return replaces the legacy open-state-only ring.
Controlled invalid echoes must retain typed sections; a genuinely new external value must restore
the editor. These are protected behaviours. Sleep-valid scoped controlled restore/invalid echo checks pass;
full S5a validation is GREEN and accepted.

Public DatePicker/range props, value units, min/max, disabled/read-only semantics, locale formatting,
controlled restore, and non-approved callback behaviour remain protected. Root peer baseline,
undeclared types, WordPress declarations and runtime subpaths remain separate release limitations, not waived by this DOM migration. Browser policy is the adopted minimums above.

## Core v9 compatibility draft (S5b not accepted)

The following upstream changes are verified against the official v9 migration guide and installed
9.5.0 source. Narrow characterization updates and final validation are accepted. Vanguard's
legacy public TextField/Menu/Snackbar prop aliases are retained with deprecated Vanguard-owned
types and mapping to slots; explicit slotProps retain precedence. Do not treat removal from MUI's
own types as permission to remove Vanguard consumer props.

### Keyboard activation events and disabled items

Enter/Space activation of button-like components now produces a MouseEvent and bubbles to ancestor
onClick handlers. Do not depend on the old KeyboardEvent type or key field in onClick. Handle
keyboard-specific logic in onKeyDown/onKeyUp and activation logic in onClick. Review ancestor handlers
so a child activation does not unexpectedly invoke both application actions:

```tsx
<div onClick={(event) => {
  if (event.target === event.currentTarget) openContainer();
}}>
  <ToggleButton value="bold" onClick={() => toggleBold()}>Bold</ToggleButton>
</div>
```

Disabled non-native buttons, menu items and select options no longer invoke activation handlers.
Tests should assert no action, rather than synthesizing a click to bypass disabled state:

```tsx
fireEvent.click(screen.getByRole('menuitem', { name: 'Unavailable' }));
expect(onChoose).not.toHaveBeenCalled();
```

### Slider pointer events

Slider drag callbacks now carry pointer events. Do not branch only on mousedown/mousemove/mouseup:

```tsx
<Slider value={value} min={0} max={100}
  onChange={(event, next) => {
    if (event?.type === 'pointerdown' || event?.type === 'pointermove') trackDrag(next);
    setValue(next);
  }} />
```

To prevent a drag when using MUI Slider directly, move a preventDefault handler from onMouseDown to
onPointerDown. Vanguard's wrapper does not expose those root handlers; do not pass unsupported props.

### Menu navigation, Backdrop and Autocomplete

Menu/MenuList now move tabindex=0 with focus (roving tabindex); tests should check the newly focused
item after Arrow/Home/End navigation rather than expecting the initial item to keep tabindex=0:

```tsx
await user.keyboard('{ArrowDown}');
expect(screen.getByRole('menuitem', { name: 'Next' })).toHaveAttribute('tabindex', '0');
```

Vanguard's existing ToggleButtonGroup per-button native Tab contract is being preserved explicitly.
Upstream v9's roving ToggleButtonGroup default remains a separate product accessibility decision.

A plain Backdrop no longer supplies aria-hidden=true by default. Modal may explicitly set it; that behavior is unchanged. Query the modal/interactive surface, or a documented
Vanguard QA hook, instead of selecting a backdrop by that attribute:

```tsx
expect(screen.getByRole('dialog')).toBeVisible();
// Avoid: container.querySelector('[aria-hidden="true"].MuiBackdrop-root')
```

Right-click no longer toggles Autocomplete; use ordinary primary-button interaction in tests:

```tsx
await user.click(screen.getByRole('combobox'));
expect(screen.getByRole('listbox')).toBeVisible();
```

Standalone MenuItem is the accepted breaking change documented below: use Vanguard Menu or its menu-building components. Browser support follows the user-adopted minimums above.

Source: https://mui.com/material-ui/migration/upgrade-to-v9/ (Autocomplete, Backdrop, ButtonBase,
Menu/MenuList, Slider). Exact tagged source and identity are retained in
out/s5b-preflight/upgrade-to-v9.md and upstream-intent-proof.json.

## Core v9: MenuItem needs Vanguard's menu context (breaking)

Vanguard MenuItem must be rendered inside Vanguard Menu, or used through the
Vanguard components that build menus internally (DropdownMenu, Select and
SearchableSelect). Standalone rendering throws `MenuListContext is missing`.
Wrapping a Vanguard MenuItem in the consumer's own `@mui/material` Menu/MenuList
is unsupported: Vanguard bundles its MUI copy, so that context is not shared,
even when versions match. Use Vanguard's public Menu; no MenuList export or
fallback was added. A Vanguard MenuList for inline lists is a possible team
follow-up, not part of this upgrade.

Before:

```tsx
<MenuItem onClick={archive}>Archive</MenuItem>
```

After (popup/menu usage):

```tsx
import { Menu, MenuItem } from '@rankingcoach/vanguard';

<button onClick={event => setAnchorEl(event.currentTarget)}>Actions</button>
<Menu open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}>
  <MenuItem onClick={archive}>Archive</MenuItem>
</Menu>
```

The `items` API is also supported:

```tsx
<Menu open={Boolean(anchorEl)} anchorEl={anchorEl}
  onClose={() => setAnchorEl(null)}
  items={[{ children: 'Archive', onClick: archive }]} />
```

Keep `anchorEl` in the component's existing `HTMLElement | null` state. Inline
standalone list usage needs a consumer redesign or the future MenuList follow-up.
Vanguard major version recommended; package version is not bumped here.

Impact, from the overseer's read-only checks relayed with the user's decision:

- Vanguard production has no standalone MenuItem usage, including origin/master
  2.9.1. Menu uses MUI Menu; DropdownMenu uses MenuList; Select/SearchableSelect
  use MUI Select's internal menu. ActionCardHeader goes through DropdownMenu and
  App through Menu. The nine internal examples now provide same-graph MUI MenuList.
- rc-webapp html/react (local feature/agents-marius-FE and origin/master) and the
  website checkout use Vanguard MenuItem only in AccountNavMenu and
  MediaItemActionsMenu, inside Vanguard Menu. AccountNavMenu's conditional Render
  wrappers are covered by the new focus/activation regression. ProjectActionsMenu
  and ItemActionsMenu use Menu items. The webapp's own MUI 5.3.0 usage is separate.
- WordPress exports no Menu, MenuItem or DropdownMenu from index-wordpress.ts.
  Its Select items stay inside the same bundled MUI Select; no WP impact.

Source: installed MUI9.5 MenuItem/MenuItem.mjs:188 and
MenuList/MenuListContext.mjs:16; Vanguard bundle boundary vite.config.lib.ts:141,
public exports src/index.ts. The user selected this break instead of a fallback.
