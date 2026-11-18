# CtaWithIcon

Call-to-action component combining an icon with text, for inline or block actions.

- Kind: component
- Import: `import { CtaWithIcon } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Table/common/CtaWithIcon/CtaWithIcon.tsx`
- Keywords: cta, button, icon, call-to-action, action

## DOM contract

Slots: `[data-slot="cta-with-icon"]`

State / variant attributes: `data-disabled`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `children` | `string \| React.ReactElement<unknown, string \| React.JSXElementConstructor<any>>` | no |  |
| `className` | `string` | no |  |
| `disabled` | `boolean` | no |  |
| `icon` | `string \| number \| bigint \| boolean \| React.ReactElement<unknown, string \| …` | no |  |
| `iconColor` | `string` | no |  |
| `onClick` | `(arg: React.SyntheticEvent<Element, Event>) => void` | no |  |
| `position` | `"left" \| "right"` | no |  |
| `rotateIcon` | `boolean` | no |  |
