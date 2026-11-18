# SlideCarousel

- Kind: component
- Import: `import { SlideCarousel } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/SlideCarousel/SlideCarousel.tsx`

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `activeIndex` | `number` | no |  |
| `ArrowComponent` | `ArrowComponentType` | no |  |
| `arrowPlacement` | `SlideCarouselArrowPlacement` | no |  |
| `arrowStyle` | `ArrowStyle` | no |  |
| `auto` | `number` | no |  |
| `BulletComponent` | `BulletComponentType` | no |  |
| `bulletPlacement` | `SlideCarouselBulletPlacement` | no |  |
| `BulletsComponent` | `BulletsComponentType` | no |  |
| `bulletStyle` | `BulletStyle` | no |  |
| `children` | `React.ReactNode[]` | no |  |
| `className` | `string` | no | Merged onto outer container; consumer-owned sizing escape hatch. |
| `hasArrows` | `boolean` | no |  |
| `hasBullets` | `boolean` | no |  |
| `initialIndex` | `number` | no |  |
| `onSlideChange` | `(slide: number) => void` | no |  |
| `setSlideCustom` | `(slide: number) => number` | no |  |
| `slidesAtOnce` | `number` | no |  |
| `slidesToSlide` | `number` | no |  |

## Examples

From `src/core/SlideCarousel/stories/SlideCarouselAutoPlay.story.tsx`:

```tsx
import React from 'react';
import { expect, waitFor } from 'storybook/test';

import { SlideCarousel } from '../SlideCarousel';
import { CarouselWrapper, SLIDES, SlideCarouselStory } from './_SlideCarousel.default';

export const SlideCarouselAutoPlay: SlideCarouselStory = {
  args: {
    hasBullets: true,
    auto: 1000,
  },
  render: (args) => (
    <CarouselWrapper>
      <SlideCarousel {...args}>{SLIDES}</SlideCarousel>
    </CarouselWrapper>
  ),
  play: async ({ canvasElement }) => {
    const bullets = canvasElement.querySelectorAll('li');

    expect((bullets[0] as HTMLElement).style.opacity).toBe('1');

    // Wait for auto-play to advance to the next slide
    await waitFor(
      () => {
        expect((bullets[1] as HTMLElement).style.opacity).toBe('1');
      },
      { timeout: 2000 },
    );

    expect((bullets[0] as HTMLElement).style.opacity).toBe('0.5');
  },
};
```

From `src/core/SlideCarousel/stories/SlideCarouselBasic.story.tsx`:

```tsx
import React from 'react';
import { expect, within } from 'storybook/test';

import { SlideCarousel } from '../SlideCarousel';
import { CarouselWrapper, SLIDES, SlideCarouselStory } from './_SlideCarousel.default';

export const SlideCarouselBasic: SlideCarouselStory = {
  render: () => (
    <CarouselWrapper>
      <SlideCarousel>{SLIDES}</SlideCarousel>
    </CarouselWrapper>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByTestId('slide-1')).toBeInTheDocument();
    await expect(await canvas.findByTestId('slide-2')).toBeInTheDocument();
    await expect(await canvas.findByTestId('slide-3')).toBeInTheDocument();
    await expect(canvasElement.querySelectorAll('a').length).toBe(0);
    await expect(canvasElement.querySelectorAll('li').length).toBe(0);
  },
};
```
