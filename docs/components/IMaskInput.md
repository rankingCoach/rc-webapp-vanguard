# IMaskInput

Masked input supporting formatted entries (dates, credit cards, phone numbers).

- Kind: component
- Import: `import { IMaskInput } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/IMaskInput/IMaskInput.tsx`
- Keywords: mask, input, format, imask, credit-card, date, phone, form

## DOM contract

No slots yet.

## Props

No own props.

Also accepts: 16 other, 381 React DOM attributes (not listed).

## Examples

From `src/core/IMaskInput/stories/Default.story.tsx`:

```tsx
import React from "react";
import { Story } from "./_IMaskInput.default";

export const Default: Story = {
  args: {
    mask: "00/00/0000",
    placeholder: "MM/DD/YYYY",
  },
};
```
