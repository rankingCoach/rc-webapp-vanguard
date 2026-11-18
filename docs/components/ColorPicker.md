# ColorPicker

Color selection control offering swatches, hex input and preview for UI theming.

- Kind: component
- Import: `import { ColorPicker } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/ColorPicker/ColorPicker.tsx`
- Keywords: color, picker, swatch, hex, palette, theme

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `color` | `string` | no | The current color value. This prop reacts to external changes and updates the component accordingly. |
| `field` | `string` | no | F3: bind to the nearest <Form config>'s field of this name (no `formconfig` prop needed). |
| `formconfig` | `FormConfigElement` | no |  |
| `index` | `number` | no | F3: element index for array fields bound with `field`. |
| `initialColor` | `string` | no |  |
| `label` | `string` | yes |  |
| `maxWidth` | `string` | no | Controls max-width of the ColorPicker container. Accepts CSS length or percentage, e.g. "300px" or "50%". |
| `onColorChange` | `(color: string) => void` | no |  |
| `replacements` | `TextReplacements` | no |  |
| `testId` | `string` | no | Test ID for testing purposes. |

## Examples

From `src/core/ColorPicker/stories/Default.story.tsx`:

```tsx
import React from "react";
import { ColorPicker } from "../ColorPicker";
import { within, expect } from "storybook/test";
import { Story, testColors } from "./_ColorPicker.default";

export const Default: Story = {
  args: {
    label: "Choose Color",
    color: testColors.darkBlue,
    testId: "color-picker",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText("Choose Color");
    await expect(label).toBeInTheDocument();

    const colorInput = canvas.getByTestId("color-picker-color");
    await expect(colorInput).toBeInTheDocument();
    await expect(colorInput).toHaveValue(testColors.darkBlue);
  },
};
```

From `src/core/ColorPicker/stories/InteractiveDemo.story.tsx`:

```tsx
import React from "react";
import { ColorPicker } from "../ColorPicker";
import { within, expect } from "storybook/test";
import { Story } from "./_ColorPicker.default";

export const InteractiveDemo: Story = {
  render: () => {
    const [selectedColor, setSelectedColor] = React.useState("#4caf50");

    return (
      <div style={{ padding: "20px" }}>
        <ColorPicker label="Choose Theme Color" color={selectedColor} onColorChange={setSelectedColor} />
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            backgroundColor: selectedColor,
            color: "white",
            borderRadius: "4px",
          }}
        >
          Preview: This box uses the selected color ({selectedColor})
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const preview = canvas.getByText(/Preview: This box uses the selected color/);
    await expect(preview).toBeInTheDocument();
  },
};
```
