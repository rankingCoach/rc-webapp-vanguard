# AvatarCheckbox

Checkbox variant rendered as an avatar allowing selection of users or visual items.

- Kind: component
- Import: `import { AvatarCheckbox } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/AvatarCheckbox/AvatarCheckbox.tsx`
- Keywords: avatar, checkbox, select, user, avatar-checkbox

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `checkboxFormConfig` | `any` | no | Form config of checkbox element formConfig.${stateName} |
| `checked` | `boolean` | no |  |
| `disabled` | `boolean` | no |  |
| `formConfig` | `any` | no | Form config of the parent form obtained by {formConfig} = useFormConfig |
| `icon` | `string` | no |  |
| `image` | `string` | no |  |
| `onChange` | `(e: boolean) => void` | no |  |
| `popoverMessage` | `string` | no |  |
| `replacements` | `TextReplacements` | no |  |

## Examples

From `src/core/AvatarCheckbox/stories/Default.story.tsx`:

```tsx
import React from "react";
import { AvatarCheckbox } from "../AvatarCheckbox";
import { within, expect } from "storybook/test";
import { Story, testIcons } from "./_AvatarCheckbox.default";

export const Default: Story = {
  args: {
    icon: testIcons.facebook,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
  },
};
```

From `src/core/AvatarCheckbox/stories/Disabled.story.tsx`:

```tsx
import React from "react";
import { AvatarCheckbox } from "../AvatarCheckbox";
import { within, userEvent, expect } from "storybook/test";
import { Story, testIcons, createMockOnChange, selectors } from "./_AvatarCheckbox.default";

export const Disabled: Story = {
  args: {
    disabled: true,
    popoverMessage: "This is a disabled input and here is why",
    icon: testIcons.facebook,
    onChange: createMockOnChange(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const avatar = await canvas.findByTestId(selectors.avatarCheckboxTestId);
    const checkbox = await canvas.findByTestId(selectors.vanguardCheckboxContainer);
    await user.click(avatar);
    await user.click(document.body);
    await expect(checkbox).not.toHaveClass("vanguard-checkbox-checked");
    await expect(args.onChange).not.toBeCalled();
  },
};
```
