import { SbDecorator } from '@test-utils/get-storybook-decorator';

import { AnimatedNumber } from './AnimatedNumber';
import { Story } from './stories/_AnimatedNumber.default';
import { Default as _Default } from './stories/Default.story';
import { Decimals as _Decimals } from './stories/Decimals.story';
import { WithFormatter as _WithFormatter } from './stories/WithFormatter.story';

export const Default: Story = { ..._Default };
export const Decimals: Story = { ..._Decimals };
export const WithFormatter: Story = { ..._WithFormatter };

export default {
  ...SbDecorator({
    title: 'vanguard/AnimatedNumber',
    component: AnimatedNumber,
  }),
};
