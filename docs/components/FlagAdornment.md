# FlagAdornment

Adornment component that shows a flag or country indicator beside inputs or avatars.

- Kind: component
- Import: `import { FlagAdornment } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/FlagAdornment/FlagAdornment.tsx`
- Keywords: flag, adornment, country, input, icon, indicator

> Internals pending rebuild: this component still renders MUI internally. Its DOM contract (data-slot parts) is not final yet; style it through the props and classes it documents.

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `countryCode` | `string` | yes |  |

## Examples

From `src/core/FlagAdornment/stories/Default.story.tsx`:

```tsx
import React from "react";
import { FlagAdornment } from "../FlagAdornment";
import { Story, testCountryCodes } from "./_FlagAdornment.default";
import { within, expect } from "storybook/test";

export const Default: Story = {
  args: {
    countryCode: testCountryCodes.germany,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check that the flag image is rendered
    const flagImage = canvas.getByAltText("de flag");
    await expect(flagImage).toBeInTheDocument();

    // Check that the image has the correct dimensions
    await expect(flagImage).toHaveAttribute("width", "32");
    await expect(flagImage).toHaveAttribute("height", "24");
  },
};
```

From `src/core/FlagAdornment/stories/WithDifferentCountry.story.tsx`:

```tsx
import React from "react";
import { FlagAdornment } from "../FlagAdornment";
import { Story, testCountryCodes } from "./_FlagAdornment.default";
import { within, expect } from "storybook/test";

export const WithDifferentCountry: Story = {
  args: {
    countryCode: testCountryCodes.unitedStates,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check that the flag image is rendered for US flag
    const flagImage = canvas.getByAltText("us flag");
    await expect(flagImage).toBeInTheDocument();

    // Check that the image has the correct dimensions
    await expect(flagImage).toHaveAttribute("width", "32");
    await expect(flagImage).toHaveAttribute("height", "24");
  },
};
```
