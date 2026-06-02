import { SbDecorator } from '@test-utils/get-storybook-decorator';

import { BenchmarkGauge } from '../BenchmarkGauge';
import { Story } from './_BenchmarkGauge.default';
import { FullTrackNoProgress } from './FullTrackNoProgress.story';
import { ProgressAtMax } from './ProgressAtMax.story';
import { ProgressAtMin } from './ProgressAtMin.story';
import { ProgressHorizontal } from './ProgressHorizontal.story';
import { ProgressInvalidId } from './ProgressInvalidId.story';
import { ProgressVertical } from './ProgressVertical.story';
import { ProgressVerticalAtMin } from './ProgressVerticalAtMin.story';
import { ProgressWideTextPin } from './ProgressWideTextPin.story';
import { ProgressWideTextPinVertical } from './ProgressWideTextPinVertical.story';

export const ProgressH: Story = { ...ProgressHorizontal };
export const ProgressV: Story = { ...ProgressVertical };
export const ProgressMin: Story = { ...ProgressAtMin };
export const ProgressMax: Story = { ...ProgressAtMax };
export const ProgressWideTextPinH: Story = { ...ProgressWideTextPin };
export const ProgressWideTextPinV: Story = { ...ProgressWideTextPinVertical };
export const ProgressFallback: Story = { ...ProgressInvalidId };
export const FullTrack: Story = { ...FullTrackNoProgress };
export const ProgressVMin: Story = { ...ProgressVerticalAtMin };

export default {
  ...SbDecorator({
    title: 'vanguard/BenchmarkGauge/Progress',
    component: BenchmarkGauge,
  }),
};