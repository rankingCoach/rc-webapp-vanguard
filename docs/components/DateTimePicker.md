# DateTimePicker

Combined date and time picker supporting timezone-aware values and validation helpers.

- Kind: component
- Import: `import { DateTimePicker } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/DateTimePicker/DateTimePicker.tsx`
- Keywords: date, time, picker, datetime, input, timezone

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `date` | `number` | no |  |
| `disablePast` | `boolean` | no |  |
| `freeSolo` | `boolean` | no |  |
| `labelDate` | `string` | no |  |
| `labelTime` | `string` | no |  |
| `locale` | `string` | yes |  |
| `maxDate` | `number` | no |  |
| `maxTime` | `string` | no |  |
| `minDate` | `number` | no |  |
| `minTime` | `string` | no |  |
| `onChange` | `(date?: number, time?: string, dateTime?: moment.Moment) => void` | no |  |
| `pickerRef` | `React.MutableRefObject<HTMLDivElement>` | no |  |
| `showAmPm` | `boolean` | no |  |
| `time` | `string` | no |  |

## Examples

From `src/core/DateTimePicker/stories/Default.story.tsx`:

```tsx
import { within, expect } from "storybook/test";
import { Story, testLocales } from "./_DateTimePicker.default";

export const Default: Story = {
  args: {
    locale: testLocales.en,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText("Start date");
    await expect(label).toBeInTheDocument();
  },
};
```

From `src/core/DateTimePicker/stories/DisablePast.story.tsx`:

```tsx
import { within, expect } from "storybook/test";
import { Story, testLocales } from "./_DateTimePicker.default";

export const DisablePast: Story = {
  args: {
    locale: testLocales.en,
    disablePast: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText("Start date");
    await expect(label).toBeInTheDocument();
  },
};
```
