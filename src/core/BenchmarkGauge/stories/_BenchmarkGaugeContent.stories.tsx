import { SbDecorator } from '@test-utils/get-storybook-decorator';

import { BenchmarkGauge } from '../BenchmarkGauge';
import { Story } from './_BenchmarkGauge.default';
import { WithContentAutoFlip } from './WithContentAutoFlip.story';
import { WithContentEnd } from './WithContentEnd.story';
import { WithContentStart } from './WithContentStart.story';

export const ContentBelow: Story = { ...WithContentEnd };
export const ContentAbove: Story = { ...WithContentStart };
export const ContentAutoFlip: Story = { ...WithContentAutoFlip };

export default {
  ...SbDecorator({
    title: 'vanguard/BenchmarkGauge/Anchored Content',
    component: BenchmarkGauge,
  }),
};