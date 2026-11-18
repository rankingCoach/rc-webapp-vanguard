# ToggleButton

Button-like toggle for switching between states; supports accessibility and keyboard use.

- Kind: component
- Import: `import { ToggleButton } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/ToggleButton/ToggleButton.tsx`
- Keywords: toggle, button, switch, state, toggle-button

## DOM contract

Slots: `[data-slot="toggle-button"]`

State / variant attributes: `data-disabled`, `data-pressed`, `data-value`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `action` | `React.Ref<ButtonBaseActions>` | no |  |
| `centerRipple` | `boolean` | no |  |
| `classes` | `Partial<Record<"disabled" \| "root" \| …` | no | MUI `classes` keys (toggleButtonClasses), plus the extra palette colours. |
| `color` | `ToggleButtonColor` | no |  |
| `component` | `React.ElementType<any, keyof React.JSX.IntrinsicElements>` | no |  |
| `disabled` | `boolean` | no |  |
| `disableFocusRipple` | `boolean` | no |  |
| `disableRipple` | `boolean` | no |  |
| `disableTouchRipple` | `boolean` | no |  |
| `focusRipple` | `boolean` | no |  |
| `focusVisibleClassName` | `string` | no |  |
| `fullWidth` | `boolean` | no |  |
| `href` | `string` | no |  |
| `LinkComponent` | `React.ElementType<any, keyof React.JSX.IntrinsicElements>` | no |  |
| `nativeButton` | `boolean` | no |  |
| `onChange` | `(event: React.MouseEvent<HTMLElement, MouseEvent>, value: any) => void` | no |  |
| `onClick` | `(event: React.MouseEvent<HTMLElement, MouseEvent>, value: any) => void` | no |  |
| `onFocusVisible` | `React.FocusEventHandler<Element>` | no |  |
| `ref` | `React.Ref<HTMLElement>` | no |  |
| `selected` | `boolean` | no |  |
| `size` | `"small" \| "medium" \| "large"` | no |  |
| `sx` | `SxCompat` | no | Accepts every MUI SxProps shape; only flat CSS objects apply (see sx-compat). |
| `testId` | `string` | no |  |
| `TouchRippleProps` | `Partial<TouchRippleProps>` | no |  |
| `touchRippleRef` | `React.Ref<TouchRippleActions>` | no |  |
| `type` | `string` | no |  |
| `value` | `any` | yes |  |

Also accepts: 275 React DOM attributes (not listed).
