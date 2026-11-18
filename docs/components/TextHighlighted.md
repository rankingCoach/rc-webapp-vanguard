# TextHighlighted

Text component that highlights matched substrings or search terms with configurable styles.

- Kind: component
- Import: `import { TextHighlighted } from '@rankingcoach/vanguard';`
- WordPress bundle: yes
- Source: `src/core/TextHighlighted/TextHighlighted.tsx`
- Keywords: highlight, text, search, match, emphasis, highlighter

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `balanced` | `boolean` | no |  |
| `capitalize` | `boolean` | no |  |
| `caseInsensitive` | `boolean` | no |  |
| `children` | `React.ReactNode \| string[] \| React.ReactNode[]` | yes |  |
| `className` | `string` | no |  |
| `color` | `string` | no |  |
| `context` | `"other" \| "one"` | no |  |
| `disabled` | `boolean` | no |  |
| `display` | `"inline" \| "block"` | no |  |
| `ellipsis` | `boolean` | no |  |
| `fontSize` | `number` | no |  |
| `fontWeight` | `FontWeights` | no |  |
| `highlightColor` | `string` | no |  |
| `highlightMode` | `"bold" \| "background" \| "text"` | no |  |
| `highlightWords` | `string[]` | no |  |
| `links` | `LinkReplacements` | no |  |
| `maxChar` | `number` | no |  |
| `maxWidth` | `number` | no |  |
| `replacements` | `TextReplacements` | no |  |
| `testId` | `string` | no |  |
| `textAlign` | `"start" \| "end" \| "center" \| "left" \| "right" \| "justify" \| "match-parent"` | no |  |
| `textTight` | `boolean` | no |  |
| `textWrap` | `"wrap" \| "no-wrap" \| "wrap-break-word"` | no |  |
| `translate` | `boolean` | no |  |
| `type` | `TextTypes` | no |  |
| `uppercase` | `boolean` | no |  |

## Examples

From `src/core/TextHighlighted/stories/TextHighlightedWithEmphasisStory.story.tsx`:

```tsx
import { Story, highlightColors } from './_TextHighlighted.default';

export const TextHighlightedWithEmphasisStory: Story = {
  args: {
    highlightWords: ['off', 'e@'],
    translate: false,
    highlightColor: highlightColors.error,
    children: 'office@<em>grenierbrasserie</em>.com',
  },
};
```
