# TogglerWithText

Toggle control with descriptive text options for boolean or dual-state choices.

- Kind: component
- Import: `import { TogglerWithText } from '@rankingcoach/vanguard';`
- WordPress bundle: yes
- Source: `src/core/TogglerWithText/TogglerWithText.tsx`
- Keywords: toggle, toggler, switch, text, binary, ui

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `activeBgColor` | `string` | no |  |
| `activeTextColor` | `string` | no |  |
| `bgColor` | `string` | no |  |
| `className` | `string` | no |  |
| `left` | `TogglerOption` | yes |  |
| `onChange` | `(selection: string) => void` | no |  |
| `right` | `TogglerOption` | yes |  |
| `setLeftActive` | `React.Dispatch<React.SetStateAction<boolean>>` | no |  |
| `testId` | `string` | no |  |
| `textColor` | `string` | no |  |
| `theme` | `"default" \| "square"` | no |  |
| `togglerState` | `TogglerState` | yes |  |
