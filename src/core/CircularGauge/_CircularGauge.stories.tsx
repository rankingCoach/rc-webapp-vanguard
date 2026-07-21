import { SbDecorator } from '@test-utils/get-storybook-decorator';

import { CircularGauge } from './CircularGauge';
import { Story } from './stories/_CircularGauge.default';
import { Default as _Default } from './stories/Default.story';
import { WithCenterValue as _WithCenterValue } from './stories/WithCenterValue.story';
import { Loading as _Loading } from './stories/Loading.story';

export const Default: Story = { ..._Default };
export const WithCenterValue: Story = { ..._WithCenterValue };
export const Loading: Story = { ..._Loading };

export default {
  ...SbDecorator({
    title: 'vanguard/CircularGauge',
    component: CircularGauge,
  }),
};
