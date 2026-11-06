/**
 * MEASURED (not gated) consumer fixture: expectations on public props whose types come from `@mui/*`.
 *
 * MUI is bundled into dist and is neither a dependency nor a peer, so the emitted `dist/types` import types from a
 * package the consumer may not have. Without MUI (scenario A) those imports resolve to `any` under
 * `skipLibCheck: true`, and each `@ts-expect-error` below that becomes "unused" (TS2578) marks a public prop that
 * DEGRADES TO `any`. With the consumer's own MUI (scenario B) they resolve against THAT version.
 *
 * Rules: one probe per line, the tag in [brackets] is what run.sh reports. A probe that holds = the prop is typed.
 * Errors other than TS2578 in this file are reported as "unexpected" (valid usage that stopped compiling).
 */
import { Accordion, AppBar, Autocomplete, DateRangeInput, Drawer, FormControl, Input, Menu, MenuItem, Popover, Snackbar, ToggleButton, ToggleButtonGroup, Toolbar } from '@rankingcoach/vanguard';
import type { AccordionProps, AutocompleteProps, InputProps, MenuProps } from '@rankingcoach/vanguard';

import type { IsAny } from './_helpers';

/**
 * Direct `any` probes on the exported prop types: `true` only type-checks when the prop IS `any`, so the
 * directive is "unused" exactly when the prop degraded (same reading as the JSX probes below).
 */
// @ts-expect-error [isAny:InputProps.textFieldProps]
export const any1: IsAny<NonNullable<InputProps['textFieldProps']>> = true;
// @ts-expect-error [isAny:AutocompleteProps.options]
export const any2: IsAny<AutocompleteProps['options']> = true;
// @ts-expect-error [isAny:AutocompleteProps.onChange]
export const any3: IsAny<AutocompleteProps['onChange']> = true;
// @ts-expect-error [isAny:AccordionProps.accordionId]
export const any4: IsAny<AccordionProps['accordionId']> = true;
// @ts-expect-error [isAny:MenuProps.testId]
export const any5: IsAny<MenuProps['testId']> = true;
// @ts-expect-error [isAny:MenuProps.open]
export const any6: IsAny<MenuProps['open']> = true;

export const MuiTypedProbes = () => (
  <>
    {/* Input / DateRangeInput: textFieldProps is MUI TextFieldProps */}
    {/* @ts-expect-error [Input.textFieldProps.variant] unknown TextField variant */}
    <Input textFieldProps={{ variant: 'nope' }} />
    {/* @ts-expect-error [Input.textFieldProps.InputProps] readOnly must be boolean */}
    <Input textFieldProps={{ InputProps: { readOnly: 'yes' } }} />
    {/* @ts-expect-error [Input.textFieldProps.inputProps] must be an object */}
    <Input textFieldProps={{ inputProps: 42 }} />
    {/* @ts-expect-error [Input.textFieldProps.InputLabelProps] shrink must be boolean */}
    <Input textFieldProps={{ InputLabelProps: { shrink: 'yes' } }} />
    {/* @ts-expect-error [Input.textFieldProps.SelectProps] native must be boolean */}
    <Input textFieldProps={{ SelectProps: { native: 'no' } }} />
    {/* @ts-expect-error [DateRangeInput.textFieldProps] unknown TextField variant */}
    <DateRangeInput textFieldProps={{ variant: 'nope' }} />

    {/* Autocomplete: Pick<MUI AutocompleteProps, 'options' | 'onChange' | ...> */}
    {/* @ts-expect-error [Autocomplete.options] must be an array */}
    <Autocomplete options={42} />
    {/* @ts-expect-error [Autocomplete.onChange] must be a function */}
    <Autocomplete options={[]} onChange={42} />
    {/* @ts-expect-error [Autocomplete.filterOptions] must be a function */}
    <Autocomplete options={[]} filterOptions="x" />

    {/* Accordion: own props & Omit<MUI AccordionProps, 'children'> */}
    {/* @ts-expect-error [Accordion.accordionId] own prop, must be a string */}
    <Accordion accordionId={42} detailsChildren="d" />
    {/* @ts-expect-error [Accordion.unknownProp] excess prop */}
    <Accordion accordionId="a" detailsChildren="d" notAProp={1} />
    {/* @ts-expect-error [Accordion.TransitionProps] must be an object */}
    <Accordion accordionId="a" detailsChildren="d" TransitionProps={42} />
    {/* @ts-expect-error [Accordion.detailsChildren:required] own prop, required */}
    <Accordion accordionId="a" />

    {/* AppBar / Toolbar / FormControl / Snackbar / ToggleButton(Group): {} & MUI props */}
    {/* @ts-expect-error [AppBar.position] unknown position */}
    <AppBar position="sideways" />
    {/* @ts-expect-error [AppBar.unknownProp] excess prop */}
    <AppBar notAProp={1} />
    {/* @ts-expect-error [Toolbar.variant] unknown variant */}
    <Toolbar variant="huge" />
    {/* @ts-expect-error [FormControl.margin] unknown margin */}
    <FormControl margin="huge" />
    {/* @ts-expect-error [Snackbar.anchorOrigin] unknown vertical */}
    <Snackbar anchorOrigin={{ vertical: 'middle', horizontal: 'left' }} />
    {/* @ts-expect-error [Snackbar.unknownProp] excess prop */}
    <Snackbar notAProp={1} />
    {/* @ts-expect-error [ToggleButton.value:required] MUI value is required */}
    <ToggleButton>A</ToggleButton>
    {/* @ts-expect-error [ToggleButton.testId] own prop, must be a string */}
    <ToggleButton value="a" testId={1} />
    {/* @ts-expect-error [ToggleButtonGroup.orientation] unknown orientation */}
    <ToggleButtonGroup orientation="diagonal" />

    {/* Drawer: Pick<MUI DrawerProps, 'hideBackdrop' | 'variant' | 'anchor'> */}
    {/* @ts-expect-error [Drawer.anchor] unknown anchor */}
    <Drawer anchor="center" />
    {/* @ts-expect-error [Drawer.variant] unknown variant */}
    <Drawer variant="floating" />
    {/* @ts-expect-error [Drawer.hideBackdrop] must be boolean */}
    <Drawer hideBackdrop="yes" />

    {/* Menu / MenuItem: own props & Omit<MUI props, ...> */}
    {/* @ts-expect-error [Menu.open:required] MUI open is required */}
    <Menu items={[]} />
    {/* @ts-expect-error [Menu.testId] own prop, must be a string */}
    <Menu open testId={1} />
    {/* @ts-expect-error [Menu.PaperProps] must be an object */}
    <Menu open PaperProps={42} />
    {/* @ts-expect-error [MenuItem.testId] own prop, must be a string */}
    <MenuItem testId={1} />
    {/* @ts-expect-error [MenuItem.dense] must be boolean */}
    <MenuItem dense="yes" />

    {/* Popover: className is Partial<MUI TooltipClasses> */}
    {/* @ts-expect-error [Popover.className] unknown tooltip class key */}
    <Popover className={{ notAClassKey: 'x' }}><span /></Popover>
  </>
);
