import { AriaWiring as _AriaWiring, DomHygiene as _DomHygiene } from './stories/DomHygiene.story';
import { SelectionFollowsFocus as _SelectionFollowsFocus } from './stories/SelectionFollowsFocus.story';
import { SbDecorator } from '@test-utils/get-storybook-decorator';

import { Tabs } from './Tabs';
import { Story } from './stories/_Tabs.default';
import { BarOnly as _BarOnly } from './stories/BarOnly.story';
import { ComponentNull as _ComponentNull } from './stories/ComponentNull.story';
import { DisabledHidden as _DisabledHidden } from './stories/DisabledHidden.story';
import { IndexFallback as _IndexFallback } from './stories/IndexFallback.story';
import { KeepInactiveTabsInDom as _KeepInactiveTabsInDom } from './stories/KeepInactiveTabsInDom.story';
import { KeyboardNavigation as _KeyboardNavigation } from './stories/KeyboardNavigation.story';
import { EmptyChildren as _EmptyChildren } from './stories/EmptyChildren.story';
import { OnChangeOnReclick as _OnChangeOnReclick } from './stories/OnChangeOnReclick.story';
import { StringValuesControlled as _StringValuesControlled } from './stories/StringValuesControlled.story';
import { TestIdFormat as _TestIdFormat } from './stories/TestIdFormat.story';
import { UncontrolledAndEmpty as _UncontrolledAndEmpty } from './stories/UncontrolledAndEmpty.story';

export const OnChangeOnReclick: Story = { ..._OnChangeOnReclick };
export const StringValuesControlled: Story = { ..._StringValuesControlled };
export const IndexFallback: Story = { ..._IndexFallback };
export const UncontrolledAndEmpty: Story = { ..._UncontrolledAndEmpty };
export const DisabledHidden: Story = { ..._DisabledHidden };
export const BarOnly: Story = { ..._BarOnly };
export const ComponentNull: Story = { ..._ComponentNull };
export const KeepInactiveTabsInDom: Story = { ..._KeepInactiveTabsInDom };
export const TestIdFormat: Story = { ..._TestIdFormat };
export const EmptyChildren: Story = { ..._EmptyChildren };
export const KeyboardNavigation: Story = { ..._KeyboardNavigation };
export const SelectionFollowsFocus: Story = { ..._SelectionFollowsFocus };
export const DomHygiene: Story = { ..._DomHygiene };
export const AriaWiring: Story = { ..._AriaWiring };

export default {
  ...SbDecorator({
    title: 'Vanguard/Tabs/Behaviour',
    component: Tabs,
  }),
};
