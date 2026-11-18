# FormControl

Form control wrapper that provides consistent layout and label handling for inputs.

- Kind: component
- Import: `import { FormControl } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/FormControl/FormControl.tsx`
- Keywords: form, control, label, input, layout, validation

> Internals pending rebuild: this component still renders MUI internally. Its DOM contract (data-slot parts) is not final yet; style it through the props and classes it documents.

## DOM contract

No slots yet.

## Props

No own props.

Also accepts: 16 MUI props, 276 React DOM attributes (not listed).

## Examples

From `src/core/FormControl/stories/Default.story.tsx`:

```tsx
import React from "react";
import { TextField } from "@mui/material";
import { within, expect } from "storybook/test";
import { Story } from "./_FormControl.default";
import { FormControl } from "../FormControl";

export const Default: Story = {
  render: () => (
    <FormControl>
      <TextField label="Default Form Control" variant="outlined" />
    </FormControl>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textField = canvas.getByLabelText("Default Form Control");
    await expect(textField).toBeInTheDocument();
  },
};
```

From `src/core/FormControl/stories/Disabled.story.tsx`:

```tsx
import React from "react";
import { InputLabel, TextField, FormHelperText } from "@mui/material";
import { within, expect } from "storybook/test";
import { Story } from "./_FormControl.default";
import { FormControl } from "../FormControl";

export const Disabled: Story = {
  render: () => (
    <FormControl disabled>
      <InputLabel htmlFor="disabled-input">Disabled Field</InputLabel>
      <TextField id="disabled-input" disabled />
      <FormHelperText>This field is disabled</FormHelperText>
    </FormControl>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const disabledField = canvas.getByLabelText("Disabled Field");
    await expect(disabledField).toBeInTheDocument();
  },
};
```
