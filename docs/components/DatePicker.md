# DatePicker

Date picker input component with calendar UI, selection modes and validation support.

- Kind: component
- Import: `import { DatePicker } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/DatePicker/DatePicker.tsx`
- Keywords: date, picker, calendar, input, select, datepicker

> Internals pending rebuild: this component still renders MUI internally. Its DOM contract (data-slot parts) is not final yet; style it through the props and classes it documents.

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `closeOnCLickAway` | `boolean` | no |  |
| `disablePast` | `boolean` | no |  |
| `field` | `string` | no | F3: bind to the nearest <Form config>'s field of this name (no `formconfig` prop needed). |
| `formconfig` | `FormConfigElement` | no |  |
| `index` | `number` | no | F3: element index for array fields bound with `field`. |
| `label` | `string` | no |  |
| `locale` | `string` | yes |  |
| `maxDate` | `number` | no |  |
| `minDate` | `number` | no |  |
| `onChange` | `(value: number) => void` | no |  |
| `required` | `boolean` | no |  |
| `value` | `number` | no |  |

## Examples

From `src/core/DatePicker/stories/CloseOnClickAway.story.tsx`:

```tsx
import React from "react";
import { DatePicker } from "../DatePicker";
import { Story, testLocales } from "./_DatePicker.default";

export const CloseOnClickAway: Story = {
  args: {
    locale: testLocales.en,
    closeOnCLickAway: true,
    label: "Click Away to Close",
  },
  render: (args) => (
    <div style={{ width: "256px", height: "356px" }}>
      <DatePicker {...args} />
    </div>
  ),
};
```

From `src/core/DatePicker/stories/Default.story.tsx`:

```tsx
import React from "react";
import { DatePicker } from "../DatePicker";
import { Story, testLocales } from "./_DatePicker.default";

export const Default: Story = {
  args: {
    locale: testLocales.en,
  },
  render: (args) => (
    <div style={{ width: "256px", height: "356px" }}>
      <DatePicker {...args} />
    </div>
  ),
};
```
