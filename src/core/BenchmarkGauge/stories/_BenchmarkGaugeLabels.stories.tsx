import { SbDecorator } from '@test-utils/get-storybook-decorator';

import { BenchmarkGauge } from '../BenchmarkGauge';
import { Story } from './_BenchmarkGauge.default';
import { InsideEndLabelOnly } from './InsideEndLabelOnly.story';
import { InsideLabels } from './InsideLabels.story';
import { InsideLabelsVertical } from './InsideLabelsVertical.story';
import { InsideLabelsWithOverlap } from './InsideLabelsWithOverlap.story';
import { InsideLabelsWithProgress } from './InsideLabelsWithProgress.story';
import { InsideStartLabelOnly } from './InsideStartLabelOnly.story';

export const LabelsInside: Story = { ...InsideLabels };
export const LabelsInsideOverlap: Story = { ...InsideLabelsWithOverlap };
export const LabelsInsideProgress: Story = { ...InsideLabelsWithProgress };
export const LabelsInsideStartOnly: Story = { ...InsideStartLabelOnly };
export const LabelsInsideEndOnly: Story = { ...InsideEndLabelOnly };
export const LabelsInsideVertical: Story = { ...InsideLabelsVertical };

export default {
  ...SbDecorator({
    title: 'vanguard/BenchmarkGauge/Inside Labels',
    component: BenchmarkGauge,
  }),
};