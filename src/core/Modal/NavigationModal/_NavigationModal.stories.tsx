import { SbDecorator } from '@test-utils/get-storybook-decorator';

import { NavigationModal } from './NavigationModal';
import description from './NavigationModal.description.md?raw';
import { Story } from './stories/_NavigationModal.default';
import { Default as _Default } from './stories/Default.story';
import { Looping as _Looping } from './stories/Looping.story';
import { SingleItem as _SingleItem } from './stories/SingleItem.story';
import { WithSlideCarousel as _WithSlideCarousel } from './stories/WithSlideCarousel.story';

export const Default: Story = { ..._Default };
export const Looping: Story = { ..._Looping };
export const SingleItem: Story = { ..._SingleItem };
export const WithSlideCarousel: Story = { ..._WithSlideCarousel };

export default {
  ...SbDecorator({
    title: 'vanguard/NavigationModal',
    component: NavigationModal,
    opts: {
      description,
    },
  }),
};
