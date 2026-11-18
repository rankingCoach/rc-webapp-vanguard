# ActionButton

Button component optimized for action calls, supports icons and variants.

- Kind: component
- Import: `import { ActionButton } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/ActionButton/ActionButton.tsx`
- Keywords: button, action, cta, icon, click, variant

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `ariaLabel` | `string` | no | Accessible name of the `<button>`; required for icon-only buttons (no `children`). |
| `blurred` | `boolean` | no | Adds a 32px backdrop blur behind the fill (glass look). The blur lives on its own layer, so the fill keeps blending with the page. |
| `children` | `string` | no |  |
| `className` | `string` | no |  |
| `color` | `string` | no |  |
| `debounce` | `number` | no |  |
| `disabled` | `boolean` | no |  |
| `fontWeight` | `FontWeights` | no |  |
| `hoverColor` | `string` | no |  |
| `htmlType` | `"button" \| "submit" \| "reset"` | no | Native `type` attribute of the `<button>` (`type` picks the visual variant). Omitted by default, so the browser default applies: `submit` inside a `<form>`. Pass `'button'` for controls inside a form that must not submit it. |
| `icon` | `IconNames` | no |  |
| `iconColor` | `string` | no |  |
| `iconFillColor` | `string` | no |  |
| `iconHasCircle` | `boolean` | no |  |
| `iconHoverColor` | `string` | no |  |
| `iconLargeOnHover` | `boolean` | no |  |
| `iconLeft` | `IconNames` | no |  |
| `iconPosition` | `"left" \| "right"` | no |  |
| `iconRight` | `IconNames` | no |  |
| `iconSize` | `IconSize` | no |  |
| `inverted` | `boolean` | no | Only for `primary` (the default type) and `shimmer`; ignored on `default` and `secondary`. For dark or coloured surfaces (e.g. the recommended card): a white fill with the text and icon in Ado's base colour (`--ado-base`), tinted 12% toward that colour on hover, and a white focus ring. Shimmer keeps its sweep, as a faint band of the same tint. The colour set for dark surfaces (photos, dark cards, the canvas hero): a white 18% fill (28% on hover) blended with `plus-lighter`, white text, icon and focus ring. Leave it `false` on light surfaces, where the fill is multiplied. |
| `isLoading` | `boolean` | no |  |
| `onClick` | `eventFn \| simpleFn` | no |  |
| `onDark` | `boolean` | no | Glass for busy or dark backdrops (photos, Ado's bubble): swaps the text, icon and focus-ring colours and uses its own `--button-muted[-inverted]-on-dark-*` fills, blended normally. - default + `onDark`: dark glass (black 60%, 70% on hover), white text and ring. - `inverted` + `onDark`: light glass (white 60%, 70% on hover), dark (#263349) text and the blue ring. |
| `onMouseDown` | `eventFn \| simpleFn` | no |  |
| `pressed` | `boolean` | no | Toggle state: renders `aria-pressed` and keeps the hover layer shown while `true`. |
| `replacements` | `TextReplacements` | no |  |
| `rounded` | `boolean` | no |  |
| `shape` | `ButtonShape` | no |  |
| `size` | `ButtonSizes` | no |  |
| `targetRef` | `React.RefObject<HTMLSpanElement>` | no |  |
| `testId` | `string` | no |  |
| `textType` | `TextTypes` | no |  |
| `textWrap` | `"wrap" \| "no-wrap"` | no | Controls how a long label behaves. - `no-wrap` (default): the label stays on a single line. - `wrap`: the label wraps onto multiple lines and the button grows in height.   The button is capped to its parent's width so wrapping kicks in once the label no longer fits.   Words are only broken when a single word is wider than the button; inside a flex row, give the   button's parent `min-width: 0` if it must shrink below its longest word. |
| `translate` | `boolean` | no | Whether the label is translated (default `true`). Set to `false` for labels that must be shown as-is. |
| `type` | `ButtonTypes` | no |  |
| `uppercase` | `boolean` | no |  |
| `visible` | `boolean` | no |  |
| `w100` | `boolean` | no |  |

## Examples

From `src/core/ActionButton/stories/Default.story.tsx`:

```tsx
import React from "react";
import { within, expect } from "storybook/test";
import { Story, selectors } from "./_ActionButton.default";

export const Default: Story = {
  args: {
    testId: "ActionButton",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByTestId(selectors.button);
    await expect(button).toBeInTheDocument();
  },
};
```

From `src/core/ActionButton/stories/Disabled.story.tsx`:

```tsx
import React from "react";
import { within, expect } from "storybook/test";
import { Story, selectors } from "./_ActionButton.default";

export const Disabled: Story = {
  args: {
    testId: "ActionButton",
    disabled: true,
    children: "Disabled Button",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByTestId(selectors.button + "_button");
    await expect(button).toBeInTheDocument();
    await expect(button).toBeDisabled();
  },
};
```
