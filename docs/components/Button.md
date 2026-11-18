# Button

Clickable button supporting sizes, variants and accessible labels.

- Kind: component
- Import: `import { Button } from '@rankingcoach/vanguard';`
- WordPress bundle: yes
- Source: `src/core/Button/Button.tsx`
- Keywords: button, click, cta, action, size, variant, accessible

> Internals pending rebuild: this component still renders MUI internally. Its DOM contract (data-slot parts) is not final yet; style it through the props and classes it documents.

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

## Related

- `component:button-group`: Use ButtonGroup to group multiple buttons together for better layout and accessibility.
- `component:icon-button`: Use IconButton for buttons that only contain an icon, providing a more compact and visually distinct option.
- `component:link`: Use Link for navigation purposes instead of Button, which is meant for actions.
- Primary buttons are best for important actions, while secondary buttons are suitable for less critical actions. There should typically be only one primary button per screen/section to avoid confusion.
- Use disabled state to indicate that a button is not currently actionable.

## Examples

From `src/core/Button/stories/ButtonDeprecatedProps.story.tsx`:

```tsx
import React from "react";
import { Button, ButtonTypes } from "../Button";
import { userEvent, within, expect, fn } from "storybook/test";
import { ButtonStory } from "./_Button.default";

// Tests for the Button Deprecated Props Story
export const ButtonDeprecatedProps: ButtonStory = {
  args: {
    type: ButtonTypes.primary,
    children: "Deprecated Button",
    color: "#ff0000",
    hoverColor: "#00ff00",
    testId: "button-deprecated",
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Verify the button is rendered
    const button = canvas.getByRole("button", { name: "Deprecated Button" });
    await expect(button).toBeInTheDocument();

    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    // Verify the button is not disabled
    await expect(button).not.toBeDisabled();
  },
};
```

From `src/core/Button/stories/ButtonDisabled.story.tsx`:

```tsx
import React from "react";
import { Button, ButtonTypes } from "../Button";
import { userEvent, within, expect, fn } from "storybook/test";
import { ButtonStory } from "./_Button.default";

// Tests for the Disabled Button
export const ButtonDisabled: ButtonStory = {
  args: {
    type: ButtonTypes.primary,
    children: "Disabled",
    disabled: true,
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Verify the button is rendered
    const button = canvas.getByRole("button", { name: "Disabled" });
    await expect(button).toBeInTheDocument();

    // Verify the button is disabled
    await expect(button).toHaveAttribute("disabled");
    await userEvent.click(button); // Clicking should not trigger any action
    await expect(button).toBeDisabled();
    await expect(args.onClick).toHaveBeenCalledTimes(0);
  },
};
```
