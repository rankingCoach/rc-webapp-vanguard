# Icon

SVG icon component supporting named icons and adjustable sizes for UI use.

- Kind: component
- Import: `import { Icon } from '@rankingcoach/vanguard';`
- WordPress bundle: yes
- Source: `src/core/Icon/Icon.tsx`
- Keywords: icon, svg, symbol, size, ui, graphic

## DOM contract

Slots: `[data-slot="icon"]`

State / variant attributes: `data-icon`, `data-size`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `children` | `IconNames` | yes |  |
| `circleSize` | `number` | no |  |
| `className` | `string` | no |  |
| `color` | `string` | no |  |
| `fillColor` | `string` | no |  |
| `fillOpacity` | `number` | no |  |
| `forceSize` | `string \| number` | no |  |
| `hasCircle` | `boolean` | no |  |
| `hoverColor` | `string` | no |  |
| `icnRef` | `React.MutableRefObject<HTMLDivElement>` | no |  |
| `onClick` | `(e?: any) => void` | no |  |
| `onMouseEnter` | `() => void` | no |  |
| `onMouseLeave` | `() => void` | no |  |
| `role` | `"button"` | no |  |
| `spin` | `boolean` | no |  |
| `style` | `React.CSSProperties` | no |  |
| `svgClassName` | `string` | no |  |
| `testId` | `string` | no |  |
| `type` | `IconSize` | no |  |

## Examples

From `src/core/Icon/stories/Default.story.tsx`:

```tsx
import React from "react";
import { within, expect, waitFor } from "storybook/test";
import { Story, testIcon } from "./_Icon.default";

export const Default: Story = {
  args: {
    children: testIcon,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      const icon = canvas.getByRole("figure");
      expect(icon).toBeInTheDocument();
    });
  },
};
```

From `src/core/Icon/stories/FileManagerIcons.story.tsx`:

```tsx
import React from "react";
import { within, expect, waitFor } from "storybook/test";
import { Story } from "./_Icon.default";
import { Icon, IconSize } from "../Icon";
import { IconNames } from "../IconNames";

const FILE_MANAGER_ICONS = [IconNames.bookmark, IconNames.bookmarkActive, IconNames.folder];

// The File vault's icons: the favourite bookmark (outline, and filled once on) and the folder, at 16px and 24px
export const FileManagerIcons: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      {FILE_MANAGER_ICONS.map((name) => (
        <React.Fragment key={name}>
          <Icon testId={`${name}-small`} color={"var(--fn-fg)"}>
            {name}
          </Icon>
          <Icon testId={`${name}-large`} type={IconSize.large} color={"var(--fn-fg)"}>
            {name}
          </Icon>
        </React.Fragment>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const name of FILE_MANAGER_ICONS) {
      await waitFor(() => {
        expect(canvas.getByTestId(`${name}-small-svg`), `${name} 16px`).toHaveAttribute("width", "16");
        expect(canvas.getByTestId(`${name}-large-svg`), `${name} 24px`).toHaveAttribute("width", "24");
      });
    }
  },
};
```
