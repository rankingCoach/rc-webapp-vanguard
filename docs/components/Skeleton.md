# Skeleton

Visual skeleton placeholders used while content is loading; supports multiple types and sizes.

- Kind: component
- Import: `import { Skeleton } from '@rankingcoach/vanguard';`
- WordPress bundle: yes
- Source: `src/core/Skeleton/Skeleton.tsx`
- Keywords: skeleton, loading, placeholder, shimmer, ui, placeholder

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `borderRadius` | `string \| number` | no |  |
| `children` | `React.ReactNode` | no |  |
| `className` | `string` | no |  |
| `color` | `"dark" \| "light"` | no |  |
| `height` | `string \| number` | no |  |
| `noAnimation` | `boolean` | no |  |
| `style` | `React.CSSProperties` | no |  |
| `testId` | `string` | no |  |
| `type` | `SkeletonTypes` | no |  |
| `width` | `string \| number` | no |  |

## Examples

From `src/core/Skeleton/stories/CardPlaceholder.story.tsx`:

```tsx
import React from 'react';

import { Skeleton, SkeletonTypes } from '../Skeleton';
import { Story } from './_Skeleton.default';

export const CardPlaceholder: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', width: 280 }}>
      <Skeleton type={SkeletonTypes.circle} width={48} height={48} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <Skeleton width="70%" height={16} />
        <Skeleton width="40%" height={12} />
      </div>
    </div>
  ),
};
```

From `src/core/Skeleton/stories/Circle.story.tsx`:

```tsx
import { SkeletonTypes } from '../Skeleton';
import { Story, testSizes } from './_Skeleton.default';

export const Circle: Story = {
  args: {
    type: SkeletonTypes.circle,
    ...testSizes.avatar,
  },
};
```
