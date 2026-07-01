import { SbDecorator } from '@test-utils/get-storybook-decorator';

import { Skeleton } from './Skeleton';
import { Story } from './stories/_Skeleton.default';
import { Default as _Default } from './stories/Default.story';
import { Circle as _Circle } from './stories/Circle.story';
import { Fill as _Fill } from './stories/Fill.story';
import { Dark as _Dark } from './stories/Dark.story';
import { NoAnimation as _NoAnimation } from './stories/NoAnimation.story';
import { CardPlaceholder as _CardPlaceholder } from './stories/CardPlaceholder.story';

export const Default: Story = { ..._Default };
export const Circle: Story = { ..._Circle };
export const Fill: Story = { ..._Fill };
export const Dark: Story = { ..._Dark };
export const NoAnimation: Story = { ..._NoAnimation };
export const CardPlaceholder: Story = { ..._CardPlaceholder };

export default {
  ...SbDecorator({
    title: 'vanguard/Skeleton',
    component: Skeleton,
  }),
};
