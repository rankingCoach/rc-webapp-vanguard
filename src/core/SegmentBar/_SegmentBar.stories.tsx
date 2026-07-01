import { SbDecorator } from '@test-utils/get-storybook-decorator';

import { SegmentBar } from './SegmentBar';
import { Story } from './stories/_SegmentBar.default';
import { Default as _Default } from './stories/Default.story';
import { Loading as _Loading } from './stories/Loading.story';

export const Default: Story = { ..._Default };
export const Loading: Story = { ..._Loading };

export default {
  ...SbDecorator({
    title: 'vanguard/SegmentBar',
    component: SegmentBar,
  }),
};
