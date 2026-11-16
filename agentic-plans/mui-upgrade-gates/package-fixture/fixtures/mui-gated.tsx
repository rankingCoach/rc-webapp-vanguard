/** Healthy MUI-dependent declarations: gated only in the default consumer with MUI installed. */
import { Input } from '@rankingcoach/vanguard';
import type { InputProps, AutocompleteProps, AccordionProps, MenuProps } from '@rankingcoach/vanguard';
import type { Expect, NotAny } from './_helpers';

export type MuiTypeHealth = [
  Expect<NotAny<NonNullable<InputProps['textFieldProps']>>>,
  Expect<NotAny<AutocompleteProps['options']>>,
  Expect<NotAny<AutocompleteProps['onChange']>>,
  Expect<NotAny<AccordionProps['accordionId']>>,
  Expect<NotAny<MenuProps['open']>>,
];

export const validLegacyInput = <Input textFieldProps={{ variant: 'outlined', InputProps: { readOnly: true }, inputProps: { maxLength: 12 }, InputLabelProps: { shrink: true }, SelectProps: { native: false } }} />;
// @ts-expect-error unknown TextField variant must stay rejected
export const badVariant = <Input textFieldProps={{ variant: 'invalid-fixture-variant' }} />;
// @ts-expect-error Input readOnly must stay boolean
export const badReadOnly = <Input textFieldProps={{ InputProps: { readOnly: 'yes' } }} />;
// @ts-expect-error InputLabel shrink must stay boolean
export const badShrink = <Input textFieldProps={{ InputLabelProps: { shrink: 'yes' } }} />;
