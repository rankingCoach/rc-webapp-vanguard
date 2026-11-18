# EditableCard

Card component with inline editable fields and optional AI-assisted title editing.

- Kind: component
- Import: `import { EditableCard } from '@rankingcoach/vanguard';`
- WordPress bundle: yes
- Source: `src/common/EditableCard/EditableCard.tsx`
- Keywords: card, editable, inline-edit, ai, title, component

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `actionBtns` | `React.ReactNode` | no |  |
| `children` | `React.ReactNode` | yes |  |
| `className` | `string` | no |  |
| `editButtonFloatRight` | `boolean` | no |  |
| `editCallback` | `() => void` | yes |  |
| `hideEditButton` | `boolean` | no |  |
| `hoverable` | `boolean` | no |  |
| `padding` | `boolean` | no |  |
| `popoverMessage` | `string` | no |  |
| `shouldHaveOnClickEventOnContainer` | `boolean` | no |  |
| `testId` | `string` | no |  |
| `title` | `string` | yes |  |
| `titleAiInfo` | `EditableCardTitleAIType` | no |  |
| `titleWeight` | `FontWeights` | no |  |
| `translate` | `boolean` | no |  |
