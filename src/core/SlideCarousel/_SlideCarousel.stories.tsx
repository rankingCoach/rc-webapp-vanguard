import { disableControls, SbDecorator } from '@test-utils/get-storybook-decorator';
import description from './SlideCarousel.description.md?raw';

import { SlideCarousel } from './SlideCarousel';
import { EXCLUDED_CONTROLS, SlideCarouselStory } from './stories/_SlideCarousel.default';
import { SlideCarouselBasic as _SlideCarouselBasic } from './stories/SlideCarouselBasic.story';
import { SlideCarouselWithArrows as _SlideCarouselWithArrows } from './stories/SlideCarouselWithArrows.story';
import { SlideCarouselWithBullets as _SlideCarouselWithBullets } from './stories/SlideCarouselWithBullets.story';
import { SlideCarouselWithArrowsAndBullets as _SlideCarouselWithArrowsAndBullets } from './stories/SlideCarouselWithArrowsAndBullets.story';
import { SlideCarouselCustomArrows as _SlideCarouselCustomArrows } from './stories/SlideCarouselCustomArrows.story';
import { SlideCarouselCustomBullets as _SlideCarouselCustomBullets } from './stories/SlideCarouselCustomBullets.story';
import { SlideCarouselAutoPlay as _SlideCarouselAutoPlay } from './stories/SlideCarouselAutoPlay.story';
import { SlideCarouselMultipleSlidesAtOnce as _SlideCarouselMultipleSlidesAtOnce } from './stories/SlideCarouselMultipleSlidesAtOnce.story';
import { SlideCarouselControlled as _SlideCarouselControlled } from './stories/SlideCarouselControlled.story';
import { SlideCarouselOutsideArrows as _SlideCarouselOutsideArrows } from './stories/SlideCarouselOutsideArrows.story';
import { SlideCarouselBulletsBelow as _SlideCarouselBulletsBelow } from './stories/SlideCarouselBulletsBelow.story';

export const SlideCarouselBasic: SlideCarouselStory = { ..._SlideCarouselBasic };
export const SlideCarouselWithArrows: SlideCarouselStory = { ..._SlideCarouselWithArrows };
export const SlideCarouselWithBullets: SlideCarouselStory = { ..._SlideCarouselWithBullets };
export const SlideCarouselWithArrowsAndBullets: SlideCarouselStory = { ..._SlideCarouselWithArrowsAndBullets };
export const SlideCarouselCustomArrows: SlideCarouselStory = { ..._SlideCarouselCustomArrows };
export const SlideCarouselCustomBullets: SlideCarouselStory = { ..._SlideCarouselCustomBullets };
export const SlideCarouselAutoPlay: SlideCarouselStory = { ..._SlideCarouselAutoPlay };
export const SlideCarouselMultipleSlidesAtOnce: SlideCarouselStory = { ..._SlideCarouselMultipleSlidesAtOnce };
export const SlideCarouselControlled: SlideCarouselStory = { ..._SlideCarouselControlled };
export const SlideCarouselOutsideArrows: SlideCarouselStory = { ..._SlideCarouselOutsideArrows };
export const SlideCarouselBulletsBelow: SlideCarouselStory = { ..._SlideCarouselBulletsBelow };

export default {
  ...SbDecorator({
    title: 'Vanguard/SlideCarousel',
    component: SlideCarousel,
    extra: {
      argTypes: disableControls(EXCLUDED_CONTROLS),
    },
    opts: {
      description: description,
    },
  }),
};
