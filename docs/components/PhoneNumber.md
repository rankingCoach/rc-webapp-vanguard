# PhoneNumber

Phone number display and input helper that formats and validates international numbers.

- Kind: component
- Import: `import { PhoneNumber } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/PhoneNumber/PhoneNumber.tsx`

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `countryCode` | `CountryCode` | no |  |
| `formConfig` | `FormConfigElement` | no |  |
| `id` | `string` | no |  |
| `phoneNumberBase` | `string` | no |  |
| `phoneNumberBaseInputEvents` | `InputEventsProps` | no |  |
| `phoneNumberDisabled` | `boolean` | no |  |
| `phoneNumberPlaceholder` | `string` | no |  |
| `phoneNumberPrefixInputEvents` | `InputEventsProps` | no |  |
| `prefixNumberDisabled` | `boolean` | no |  |

## Examples

From `src/core/PhoneNumber/stories/Default.story.tsx`:

```tsx
import React from "react";
import { PhoneNumber } from "../PhoneNumber";
import { Story, testPhoneNumbers, testCountryCodes } from "./_PhoneNumber.default";
import { within, expect } from "storybook/test";

export const Default: Story = {
  render: () => (
    <PhoneNumber
      phoneNumberBase={testPhoneNumbers.romanian}
      countryCode={testCountryCodes.RO}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const phoneNumberComponent = canvas.getByTestId("phoneNumberComponent");

    await expect(phoneNumberComponent).toBeInTheDocument();
  },
};
```

From `src/core/PhoneNumber/stories/WithDisabled.story.tsx`:

```tsx
import React from "react";
import { PhoneNumber } from "../PhoneNumber";
import { Story, testPhoneNumbers, testCountryCodes } from "./_PhoneNumber.default";
import { within, expect } from "storybook/test";

export const WithDisabled: Story = {
  render: () => (
    <PhoneNumber
      phoneNumberBase={testPhoneNumbers.american}
      countryCode={testCountryCodes.US}
      phoneNumberDisabled={true}
      prefixNumberDisabled={true}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const phoneNumberComponent = canvas.getByTestId("phoneNumberComponent");

    await expect(phoneNumberComponent).toBeInTheDocument();
  },
};
```
