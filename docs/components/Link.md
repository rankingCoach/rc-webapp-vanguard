# Link

Accessible link component supporting external targets, click handlers and routing needs.

- Kind: component
- Import: `import { Link } from '@rankingcoach/vanguard';`
- WordPress bundle: yes
- Source: `src/core/Link/Link.tsx`
- Keywords: link, anchor, navigation, href, external, target, accessibility

## DOM contract

Slots: `[data-slot="link"]`

State / variant attributes: `data-disabled`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `allowNewLines` | `boolean` | no |  |
| `animateWords` | `FadeUpTextAnimationProps` | no |  |
| `balanced` | `boolean` | no |  |
| `capitalize` | `boolean` | no |  |
| `children` | `React.ReactNode \| string[] \| React.ReactNode[]` | yes |  |
| `className` | `string` | no |  |
| `color` | `string` | no |  |
| `context` | `"other" \| "one"` | no |  |
| `disabled` | `boolean` | no |  |
| `display` | `"inline" \| "block"` | no |  |
| `ellipsis` | `boolean` | no |  |
| `fontSize` | `number` | no |  |
| `fontWeight` | `FontWeights` | no |  |
| `highlightCaseInsensitive` | `boolean` | no |  |
| `highlightColor` | `string` | no |  |
| `highlightMode` | `"bold" \| "background" \| "text"` | no |  |
| `highlightWords` | `string[]` | no |  |
| `href` | `string` | no |  |
| `iconLeft` | `boolean` | no |  |
| `iconName` | `IconNames` | no |  |
| `isBlurred` | `boolean` | no |  |
| `links` | `LinkReplacements` | no |  |
| `maxChar` | `number` | no |  |
| `maxLines` | `number` | no |  |
| `maxWidth` | `number` | no |  |
| `newTabIcon` | `boolean` | no |  |
| `onClick` | `() => void` | no |  |
| `replacements` | `TextReplacements` | no |  |
| `seeMore` | `boolean \| SeeMoreConfig` | no |  |
| `target` | `"_blank" \| "_self"` | no |  |
| `testId` | `string` | no |  |
| `textAlign` | `"start" \| "end" \| "center" \| "left" \| "right" \| "justify" \| "match-parent"` | no |  |
| `textTight` | `boolean` | no |  |
| `textWrap` | `"pre" \| "wrap" \| "no-wrap" \| "wrap-break-word" \| "pre-wrap"` | no |  |
| `translate` | `boolean` | no |  |
| `type` | `TextTypes` | no |  |
| `uppercase` | `boolean` | no |  |
| `wordBreak` | `TextWordBreak` | no |  |

## Examples

From `src/core/Link/stories/Default.story.tsx`:

```tsx
import React from "react";
import { Link } from "../Link";
import { Story, testLinkText, testHref } from "./_Link.default";

export const Default: Story = {
  args: {
    children: testLinkText,
    href: testHref,
    newTabIcon: true,
    target: "_blank",
  },
};
```

From `src/core/Link/stories/Disabled.story.tsx`:

```tsx
import React from "react";
import { Link } from "../Link";
import { Story, testLinkText, testHref } from "./_Link.default";

export const Disabled: Story = {
  args: {
    children: testLinkText,
    href: testHref,
    disabled: true,
  },
};
```
