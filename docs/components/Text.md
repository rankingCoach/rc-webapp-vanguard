# Text

Flexible text renderer supporting translations, formatting, links, truncation and line balancing.

- Kind: component
- Import: `import { Text } from '@rankingcoach/vanguard';`
- WordPress bundle: yes
- Source: `src/core/Text/Text.tsx`
- Keywords: text, typography, translation, truncate, see-more, link-parsing, sanitization

## DOM contract

Slots: `[data-slot="text"]`

State / variant attributes: `data-type`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `allowNewLines` | `boolean` | no |  |
| `animateWords` | `FadeUpTextAnimationProps` | no |  |
| `balanced` | `boolean` | no |  |
| `capitalize` | `boolean` | no |  |
| `children` | `(React.ReactNode \| string[] \| React.ReactNode[]) & React.ReactNode` | yes |  |
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
| `isBlurred` | `boolean` | no |  |
| `links` | `LinkReplacements` | no |  |
| `maxChar` | `number` | no |  |
| `maxLines` | `number` | no |  |
| `maxWidth` | `number` | no |  |
| `replacements` | `TextReplacements` | no |  |
| `seeMore` | `boolean \| SeeMoreConfig` | no |  |
| `testId` | `string` | no |  |
| `textAlign` | `"start" \| "end" \| "center" \| "left" \| "right" \| "justify" \| "match-parent"` | no |  |
| `textTight` | `boolean` | no |  |
| `textWrap` | `"pre" \| "wrap" \| "no-wrap" \| "wrap-break-word" \| "pre-wrap"` | no |  |
| `translate` | `boolean` | no |  |
| `type` | `TextTypes` | no |  |
| `uppercase` | `boolean` | no |  |
| `wordBreak` | `TextWordBreak` | no |  |

Also accepts: 274 React DOM attributes (not listed).
