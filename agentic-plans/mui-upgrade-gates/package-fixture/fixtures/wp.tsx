/**
 * GATED consumer fixture for the WordPress bundle.
 *
 * How WP is consumed: the consumer puts `.vanguardrc` = {"mode":"wordpress"} in its root; the package `postinstall`
 * (scripts/clean-assets-based-on-vanguardrc.js) then replaces node_modules/@rankingcoach/vanguard/dist with
 * dist-wordpress. The consumer still imports from `@rankingcoach/vanguard` (same exports map, now pointing at the
 * WP files). This file therefore imports from the package root, in a consumer installed with that .vanguardrc.
 *
 * Only valid usage is gated here (plus one check that the WP declaration entry is the one in effect). The typed-
 * ness expectations live in wp-measured.tsx, because the WP declarations are incomplete today.
 */
import { Accordion, Autocomplete, Button, ButtonSizes, ButtonTypes, Input, Popover, Select, Textarea } from '@rankingcoach/vanguard';
import type { SelectOptionProp } from '@rankingcoach/vanguard';
// @ts-expect-error [wp-entry] DatePicker is not exported by src/index-wordpress.ts: proves the WP .d.ts is in effect
import { DatePicker } from '@rankingcoach/vanguard';

import { use } from './_helpers';
import type { ChangeEvent } from 'react';

const options: SelectOptionProp[] = [{ key: 0, value: 'apple', title: 'Apple' }];

export const WpConsumerPage = () => (
  <div>
    <Button type={ButtonTypes.primary} size={ButtonSizes.medium} onClick={() => undefined}>
      Save
    </Button>
    <Input
      label="Email"
      onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => use(e.target.value)}
      textFieldProps={{ InputProps: { endAdornment: <span>@</span> }, inputProps: { maxLength: 10 } }}
    />
    <Textarea label="Bio" rows={3} />
    <Select label="Fruit" options={options} onChange={(_e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, selected?: SelectOptionProp) => use(selected?.value)} />
    <Autocomplete label="City" options={['Berlin']} hideCaret />
    <Popover message="tip">
      <span>hover</span>
    </Popover>
    <Accordion accordionId="a" summaryChildren="Q" detailsChildren={<p>A</p>} />
  </div>
);

use(DatePicker);
