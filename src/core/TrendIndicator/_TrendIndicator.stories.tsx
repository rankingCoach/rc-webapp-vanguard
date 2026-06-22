import { SbDecorator } from '@test-utils/get-storybook-decorator';

import { TrendIndicator } from './TrendIndicator';
import { Story } from './stories/_TrendIndicator.default';
import { Default as _Default } from './stories/Default.story';
import { InverseMetric as _InverseMetric } from './stories/InverseMetric.story';
import { Delta as _Delta } from './stories/Delta.story';

export const Default: Story = { ..._Default };
export const InverseMetric: Story = { ..._InverseMetric };
export const Delta = { ..._Delta };

export default {
  ...SbDecorator({
    title: 'vanguard/TrendIndicator',
    component: TrendIndicator,
  }),
};
