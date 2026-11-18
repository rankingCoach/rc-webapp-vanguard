# DropdownMenu

Accessible dropdown menu component for actions and navigation with keyboard support.

- Kind: component
- Import: `import { DropdownMenu } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/DropdownMenu/DropdownMenu.tsx`
- Keywords: dropdown, menu, actions, navigation, keyboard, accessibility

> Internals pending rebuild: this component still renders MUI internally. Its DOM contract (data-slot parts) is not final yet; style it through the props and classes it documents.

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `anchorEl` | `React.RefObject<any>` | no |  |
| `hideOnItemClick` | `boolean` | no |  |
| `isOpen` | `boolean` | yes |  |
| `items` | `DropdownMenuItemProps[]` | yes |  |
| `placement` | `"left" \| "right" \| "bottom" \| "top" \| "auto" \| "auto-end" \| "auto-start" \| "bottom-end" \| …` | no |  |
| `toggleIsOpen` | `() => void` | yes |  |

## Examples

From `src/core/DropdownMenu/stories/WithHideOnItemClickFalse.story.tsx`:

```tsx
import React, { useRef } from "react";
import { DropdownMenu } from "../DropdownMenu";
import { Button, ButtonSizes, ButtonTypes } from "@vanguard/Button/Button";
import { IconNames } from "@vanguard/Icon/IconNames";
import { useToggle } from "../../../custom-hooks/useToggle";
import { within, expect } from "storybook/test";
import { Story, defaultItems } from "./_DropdownMenu.default";

export const WithHideOnItemClickFalse: Story = {
  render: () => {
    const [menuIsOpen, toggleMenuIsOpen] = useToggle(false);
    const menuAnchorEl = useRef(null);

    return (
      <div>
        <Button
          targetRef={menuAnchorEl}
          type={ButtonTypes.default}
          iconLeft={IconNames.edit}
          size={ButtonSizes.small}
          onClick={toggleMenuIsOpen}
        >
          Menu No Hide
        </Button>
        <DropdownMenu
          anchorEl={menuAnchorEl}
          isOpen={menuIsOpen}
          toggleIsOpen={toggleMenuIsOpen}
          items={defaultItems}
          hideOnItemClick={false}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");
    await expect(button).toBeInTheDocument();
  },
};
```

From `src/core/DropdownMenu/stories/WithIcons.story.tsx`:

```tsx
import React, { useRef } from "react";
import { DropdownMenu } from "../DropdownMenu";
import { Button, ButtonSizes, ButtonTypes } from "@vanguard/Button/Button";
import { IconNames } from "@vanguard/Icon/IconNames";
import { useToggle } from "../../../custom-hooks/useToggle";
import { within, expect, userEvent } from "storybook/test";
import { Story, itemsWithIcons } from "./_DropdownMenu.default";

export const WithIcons: Story = {
  render: () => {
    const [menuIsOpen, toggleMenuIsOpen] = useToggle(false);
    const menuAnchorEl = useRef(null);

    return (
      <div>
        <Button
          targetRef={menuAnchorEl}
          type={ButtonTypes.default}
          iconLeft={IconNames.edit}
          size={ButtonSizes.small}
          onClick={toggleMenuIsOpen}
        >
          Menu with Icons
        </Button>
        <DropdownMenu
          anchorEl={menuAnchorEl}
          isOpen={menuIsOpen}
          toggleIsOpen={toggleMenuIsOpen}
          items={itemsWithIcons}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");
    await expect(button).toBeInTheDocument();
  },
};
```
