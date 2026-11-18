# CardMotion

- Kind: component
- Import: `import { CardMotion } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/CardMotion/CardMotion.tsx`

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `children` | `React.ReactNode` | yes |  |
| `className` | `string` | no |  |
| `delay` | `number` | yes |  |
| `entryAnimation` | `false \| Partial<MotionPhase & { skewX: number; skewY: number; brightness: number; glowAlph \| …` | no |  |
| `entryPreset` | `CardMotionEntryPreset` | no |  |
| `glowIn` | `boolean` | no |  |
| `hoverable` | `boolean` | no |  |
| `hoverAnimation` | `false \| CardMotionHoverAnimation` | no |  |
| `index` | `number` | no |  |
| `isVisible` | `boolean` | no |  |
| `leaveAnimation` | `false \| Partial<MotionPhase & { skewX: number; skewY: number; brightness: number; glowAlph \| …` | no |  |
| `style` | `React.CSSProperties` | no |  |

## Examples

From `src/core/CardMotion/stories/CustomMotion.story.tsx`:

```tsx
import React from 'react';

import styles from './CardMotionStories.module.scss';
import { Story } from './_CardMotion.default';

export const CustomMotion: Story = {
  args: {
    delay: 0,
    hoverAnimation: {
      y: -10,
      scale: 1.03,
    },
    entryAnimation: {
      y: 20,
      blur: 3,
      scale: 0.98,
      duration: 0.28,
    },
    leaveAnimation: {
      y: 14,
      opacity: 0,
      blur: 2,
      duration: 0.18,
    },
    children: <div className={`${styles.cardSurface} ${styles.surfaceInfo}`}>Custom entry, leave, and hover motion</div>,
  },
};
```

From `src/core/CardMotion/stories/Default.story.tsx`:

```tsx
import React from 'react';

import styles from './CardMotionStories.module.scss';
import { Story } from './_CardMotion.default';

export const Default: Story = {
  args: {
    delay: 0,
    entryPreset: 'fade-up',
    entryAnimation: {
      y: 16,
      duration: 0.24,
    },
    children: (
      <div className={`${styles.cardSurface} ${styles.surfaceNeutral}`}>Default card content</div>
    ),
  },
};
```
