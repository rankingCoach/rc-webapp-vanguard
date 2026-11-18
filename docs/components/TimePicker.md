# TimePicker

UI control to select a time of day with optional formats and validation.

- Kind: component
- Import: `import { TimePicker } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/TimePicker/TimePicker.tsx`
- Keywords: time, picker, timepicker, input, schedule, format

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `containerClassName` | `string` | no |  |
| `field` | `string` | no | F3: bind to the nearest <Form config>'s field of this name (no `formconfig` prop needed). |
| `formconfig` | `FormConfigElement` | no |  |
| `freeSolo` | `boolean` | no |  |
| `hourListType` | `HourType` | yes |  |
| `id` | `string` | no |  |
| `index` | `number` | no | F3: element index for array fields bound with `field`. |
| `label` | `string` | yes |  |
| `max` | `string` | no |  |
| `min` | `string` | no |  |
| `onChange` | `SelectOnChange` | no |  |
| `showAmPm` | `boolean` | no |  |
| `testId` | `string` | no |  |
| `value` | `string` | no |  |

## Examples

From `src/core/TimePicker/stories/DefaultSelected.story.tsx`:

```tsx
import { Story, testDefaultValue } from "./_TimePicker.default";

export const DefaultSelected: Story = {
  args: {
    hourListType: "quarter",
    value: "03:00",
  },
  play: async ({ canvasElement, args }) => {
    await testDefaultValue(canvasElement, args, true);
  },
};
```

From `src/core/TimePicker/stories/DefaultSelectedFreeSolo.story.tsx`:

```tsx
import { Story, testDefaultValue } from "./_TimePicker.default";

export const DefaultSelectedFreeSolo: Story = {
  args: {
    hourListType: "quarter",
    value: "03:01",
    freeSolo: true,
  },
  play: async ({ canvasElement, args }) => {
    await testDefaultValue(canvasElement, args, true);
  },
};
```
