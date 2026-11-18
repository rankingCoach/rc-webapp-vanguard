# Tag

Compact label/pill representing a category, status or attribute with optional close behavior. `variant="chip-filled"` is the small filled chip: 24px, muted fill, 12px medium text, not uppercase.

- Kind: component
- Import: `import { Tag } from '@rankingcoach/vanguard';`
- WordPress bundle: yes
- Source: `src/core/TagList/Tag/Tag.tsx`
- Keywords: tag, pill, label, chip, category, status, chip-filled, filled, small

## DOM contract

Slots: `[data-slot="tag"]`, `[data-slot="tag-container"]`, `[data-slot="tag-content"]`, `[data-slot="tag-delete"]`

State / variant attributes: `data-type`, `data-variant`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `active` | `boolean` | no |  |
| `deleteBtnCallback` | `(id?: string \| number) => void` | no |  |
| `hasDeleteBtn` | `boolean` | no |  |
| `hasInnerElement` | `boolean` | no |  |
| `hidden` | `boolean` | no |  |
| `id` | `string \| number` | no |  |
| `innerElement` | `React.ReactNode` | no |  |
| `popoverMessage` | `string` | no |  |
| `text` | `string` | no |  |
| `textColor` | `string` | no |  |
| `type` | `TagType` | no |  |
| `variant` | `TagVariant` | no | `chip-filled`: the small filled chip (24px, muted fill, 12px medium text, not uppercase). |
