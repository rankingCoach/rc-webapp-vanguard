import { SbDecorator } from '@test-utils/get-storybook-decorator';

import { BenchmarkGauge } from '../BenchmarkGauge';
import { Story } from './_BenchmarkGauge.default';
import { LegendHorizontal } from './LegendHorizontal.story';
import { LegendNone } from './LegendNone.story';
import { LegendPartial } from './LegendPartial.story';
import { LegendVertical } from './LegendVertical.story';
import { LegendWithCoreGrowEffect } from './LegendWithCoreGrowEffect.story';
import { LegendWithHighlightedIcons } from './LegendWithHighlightedIcons.story';
import { LegendWithWrapperExtras } from './LegendWithWrapperExtras.story';

export const LegendH: Story = { ...LegendHorizontal };
export const LegendV: Story = { ...LegendVertical };
export const LegendP: Story = { ...LegendPartial };
export const LegendOff: Story = { ...LegendNone };
export const LegendWithWrapperExtra: Story = { ...LegendWithWrapperExtras };
export const LegendWithGrowEffect: Story = { ...LegendWithCoreGrowEffect };
export const LegendHighlightedIcons: Story = { ...LegendWithHighlightedIcons };

export default {
  ...SbDecorator({
    title: 'vanguard/BenchmarkGauge/Legend',
    component: BenchmarkGauge,
  }),
};