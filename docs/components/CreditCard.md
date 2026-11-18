# CreditCard

Visual component for displaying credit card details and detecting card types with optional masking.

- Kind: component
- Import: `import { CreditCard } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/CreditCard/CreditCard.tsx`
- Keywords: credit-card, card, payment, mask, type, visual

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `disabled` | `boolean` | yes |  |
| `small` | `boolean` | yes |  |
| `testId` | `string` | no |  |
| `type` | `CreditCardType` | yes |  |

## Examples

From `src/core/CreditCard/stories/AmericanExpress.story.tsx`:

```tsx
import React from "react";
import { within, expect } from "storybook/test";
import { Story, testTypes, testIds } from "./_CreditCard.default";

export const AmericanExpress: Story = {
  args: {
    type: testTypes.americanExpress,
    disabled: false,
    small: false,
    
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId(testIds.creditCard);
    await expect(container).toBeInTheDocument();
  },
};
```

From `src/core/CreditCard/stories/CarteBleue.story.tsx`:

```tsx
import React from "react";
import { within, expect } from "storybook/test";
import { Story, testTypes, testIds } from "./_CreditCard.default";

export const CarteBleue: Story = {
  args: {
    type: testTypes.carteBleue,
    disabled: false,
    small: false,
    
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId(testIds.creditCard);
    await expect(container).toBeInTheDocument();
  },
};
```
