import { SbDecorator } from '@test-utils/get-storybook-decorator';

import {
  ClassNameOnBarRoot as _ClassNameOnBarRoot,
  ClassNameOnFloatingBar as _ClassNameOnFloatingBar,
} from './stories/ClassNameOnBarRoot.story';
import { ConfigFloating as _ConfigFloating } from './stories/ConfigFloating.story';
import { ConfigGrowCenteredIcons as _ConfigGrowCenteredIcons } from './stories/ConfigGrowCenteredIcons.story';
import {
  ConfigDefaultIsHighlight as _ConfigDefaultIsHighlight,
  ConfigHighlightSmall as _ConfigHighlightSmall,
} from './stories/ConfigHighlightSmall.story';
import { ConfigNoGrowCentered as _ConfigNoGrowCentered } from './stories/ConfigNoGrowCentered.story';
import {
  ConfigUnderline as _ConfigUnderline,
  ConfigUnderlineSmall as _ConfigUnderlineSmall,
} from './stories/ConfigUnderline.story';
import { ConfigUnderlineCompact as _ConfigUnderlineCompact } from './stories/ConfigUnderlineCompact.story';
import { ConfigUnderlineIcons as _ConfigUnderlineIcons } from './stories/ConfigUnderlineIcons.story';
import { IconsWithStringValues as _IconsWithStringValues } from './stories/IconsWithStringValues.story';
import { FlatConfigProps as _FlatConfigProps } from './stories/FlatConfigProps.story';
import {
  NoScrollFightOnOtherTabResize as _NoScrollFightOnOtherTabResize,
  OverflowAfterTabSwap as _OverflowAfterTabSwap,
  SelectedVisibleAfterReorder as _SelectedVisibleAfterReorder,
} from './stories/TabsIdentityChange.story';
import {
  ErrorHighlight as _ErrorHighlight,
  ErrorUnderline as _ErrorUnderline,
  ReactNodeLabel as _ReactNodeLabel,
} from './stories/LabelAndErrorStyling.story';
import {
  OverflowAfterLabelChange as _OverflowAfterLabelChange,
  SelectedScrolledIntoViewExternally as _SelectedScrolledIntoViewExternally,
  SelectedVisibleAfterResize as _SelectedVisibleAfterResize,
} from './stories/OverflowDynamic.story';
import { NoOverflowWide as _NoOverflowWide, OverflowScroll as _OverflowScroll } from './stories/OverflowScroll.story';
import {
  SelectedLabelHighlight as _SelectedLabelHighlight,
  SelectedLabelUnderline as _SelectedLabelUnderline,
} from './stories/SelectedLabelStyling.story';
import { Story } from './stories/_TabsVisual.default';
import { Tabs } from './Tabs';

export default {
  ...SbDecorator({
    title: 'Vanguard/Tabs/Visual Parity',
    component: Tabs,
  }),
};

export const ClassNameOnBarRoot: Story = { ..._ClassNameOnBarRoot };
export const IconsWithStringValues: Story = { ..._IconsWithStringValues };
export const ConfigUnderlineCompact: Story = { ..._ConfigUnderlineCompact };
export const ConfigUnderline: Story = { ..._ConfigUnderline };
export const ConfigUnderlineSmall: Story = { ..._ConfigUnderlineSmall };
export const ConfigUnderlineIcons: Story = { ..._ConfigUnderlineIcons };
export const ConfigHighlightSmall: Story = { ..._ConfigHighlightSmall };
export const ConfigDefaultIsHighlight: Story = { ..._ConfigDefaultIsHighlight };
export const ConfigFloating: Story = { ..._ConfigFloating };
export const ConfigGrowCenteredIcons: Story = { ..._ConfigGrowCenteredIcons };
export const ConfigNoGrowCentered: Story = { ..._ConfigNoGrowCentered };
export const OverflowScroll: Story = { ..._OverflowScroll };
export const NoOverflowWide: Story = { ..._NoOverflowWide };
export const SelectedLabelHighlight: Story = { ..._SelectedLabelHighlight };
export const SelectedLabelUnderline: Story = { ..._SelectedLabelUnderline };
export const SelectedScrolledIntoViewExternally: Story = { ..._SelectedScrolledIntoViewExternally };
export const OverflowAfterLabelChange: Story = { ..._OverflowAfterLabelChange };
export const SelectedVisibleAfterResize: Story = { ..._SelectedVisibleAfterResize };
export const ReactNodeLabel: Story = { ..._ReactNodeLabel };
export const ErrorUnderline: Story = { ..._ErrorUnderline };
export const ErrorHighlight: Story = { ..._ErrorHighlight };
export const FlatConfigProps: Story = { ..._FlatConfigProps };
export const SelectedVisibleAfterReorder: Story = { ..._SelectedVisibleAfterReorder };
export const OverflowAfterTabSwap: Story = { ..._OverflowAfterTabSwap };
export const NoScrollFightOnOtherTabResize: Story = { ..._NoScrollFightOnOtherTabResize };
export const ClassNameOnFloatingBar: Story = { ..._ClassNameOnFloatingBar };
