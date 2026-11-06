/**
 * MEASURED (not gated) consumer fixture for the WordPress bundle: the same "must stay typed" expectations the
 * default entry gates in components.tsx, for the components src/index-wordpress.ts exports. An "unused"
 * `@ts-expect-error` (TS2578) = that prop is `any` for a WP consumer. Recorded, not gated, because the WP
 * declaration output is known to be incomplete (see README, "WP declarations").
 */
import { Accordion, Autocomplete, Button, ButtonTypes, Input, Popover, Select, Textarea } from '@rankingcoach/vanguard';
import type { ButtonProps, InputProps } from '@rankingcoach/vanguard';

import type { IsAny } from './_helpers';

// @ts-expect-error [WP.isAny:ButtonProps]
export const wpAny1: IsAny<ButtonProps> = true;
// @ts-expect-error [WP.isAny:InputProps]
export const wpAny2: IsAny<InputProps> = true;
// @ts-expect-error [WP.isAny:Button]
export const wpAny3: IsAny<typeof Button> = true;

export const WpProbes = () => (
  <>
    {/* @ts-expect-error [WP.Button.type] unknown variant */}
    <Button type="nope">x</Button>
    {/* @ts-expect-error [WP.Button.blurred] only the muted type accepts blurred */}
    <Button type={ButtonTypes.primary} blurred>x</Button>
    {/* @ts-expect-error [WP.Input.type] not in the union */}
    <Input type="tel" />
    {/* @ts-expect-error [WP.Input.textFieldProps.InputProps] readOnly must be boolean */}
    <Input textFieldProps={{ InputProps: { readOnly: 'yes' } }} />
    {/* @ts-expect-error [WP.Textarea.rows] must be a number */}
    <Textarea rows="3" />
    {/* @ts-expect-error [WP.Select.options] option without key */}
    <Select options={[{ value: 'a', title: 'A' }]} />
    {/* @ts-expect-error [WP.Autocomplete.hideCaret] must be boolean */}
    <Autocomplete hideCaret="yes" />
    {/* @ts-expect-error [WP.Popover.position] not in the union */}
    <Popover position="center"><span /></Popover>
    {/* @ts-expect-error [WP.Accordion.accordionId] must be a string */}
    <Accordion accordionId={42} detailsChildren="d" />
  </>
);
