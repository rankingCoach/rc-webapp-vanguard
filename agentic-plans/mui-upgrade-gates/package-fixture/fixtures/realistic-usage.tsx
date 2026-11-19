/**
 * MEASURED (not gated) consumer fixture: minimal, realistic usage that is EXPECTED to compile for any consumer,
 * but does not compile today in at least one scenario. Every error here is a consumer-facing compile error and is
 * listed in the summary under the nearest preceding `[tag]` comment.
 *
 * Why these fail without MUI: vanguard's public types use `Pick<MuiProps, 'a' | 'b'>`. When MUI is not installed,
 * `MuiProps` is `any`, and `Pick<any, K>` = `{ [P in K]: any }` with every key REQUIRED (no optional modifiers to
 * copy). So all picked keys become mandatory props.
 *
 * Move a block to components.tsx (gated) once it compiles in both scenarios.
 */
import { Autocomplete, Drawer, DrawerService, Select } from '@rankingcoach/vanguard';
import type { SelectOptionProp } from '@rankingcoach/vanguard';
import { AutocompleteWithAnchor } from '@rankingcoach/vanguard/core/AutocompleteWithAnchor/AutocompleteWithAnchor';

import { use } from './_helpers';

const options: SelectOptionProp[] = [{ key: 0, value: 'apple', title: 'Apple' }];

export const RealisticUsage = () => (
  <>
    {/* [Autocomplete:minimal-props] Pick<MUI AutocompleteProps, 13 keys> */}
    <Autocomplete label="City" options={['Berlin', 'Paris']} onChange={(_e, value) => use(value)} />

    {/* [AutocompleteWithAnchor:minimal-props] autocompleteProps is AutocompleteProps */}
    <AutocompleteWithAnchor autocompleteProps={{ label: 'Search', options: [] }}>
      <button type="button">anchor</button>
    </AutocompleteWithAnchor>

    {/* [Drawer:minimal-props] Pick<MUI DrawerProps, 'hideBackdrop' | 'variant' | 'anchor'> */}
    <Drawer open title="Details" onClose={() => undefined}>
      <p>body</p>
    </Drawer>

    {/* [Select.onChange:two-arg-callback] InputEventsProps.onChange & SelectOnChange: 2nd arg must be declared optional (not MUI related) */}
    <Select label="Fruit" options={options} onChange={(e, selected) => use(e.target.value, selected?.value)} />
  </>
);

// [DrawerService.open:options] options are DrawerProps (same Pick as Drawer)
DrawerService.open(<div />, { title: 'Details', anchor: 'right' });
