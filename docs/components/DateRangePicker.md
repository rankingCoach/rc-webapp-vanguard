# DateRangePicker

Full-featured date range picker with presets, multiple ranges and comparison helpers.

- Kind: component
- Import: `import { DateRangePicker } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/DateRangePicker/DateRangePicker.tsx`
- Keywords: date, range, picker, calendar, presets, selection

> Internals pending rebuild: this component still renders MUI internally. Its DOM contract (data-slot parts) is not final yet; style it through the props and classes it documents.

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `className` | `string` | no |  |
| `disabled` | `boolean` | no |  |
| `endDate` | `Date` | no |  |
| `maxDate` | `Date` | no | -Will disable dates in calendar view |
| `minDate` | `Date` | no | -Will disable dates in calendar view -Will remove from static selector list dates that whos startDate is after the minDate |
| `onChange` | `(dates: DateRangePickerReturn, source: "MANUAL" \| "AUTOMATIC") => void` | no | Notifier parent component of changes in min/max dates that happen |
| `onDateRangeSelected` | `OnDateRangeSelected` | no | Callback when any date is clicked in the calendar view with type identifier |
| `onStateChange` | `(state: DateRangePickerState) => void` | no | Notifier parent component when the view state changes between calendar and static ranges |
| `ranges` | `any[]` | no |  |
| `startDate` | `Date` | no |  |
| `state` | `DateRangePickerState` | no |  |
| `testId` | `string` | no |  |

## Examples

From `src/core/DateRangePicker/stories/Default.story.tsx`:

```tsx
import { Story } from "./_DateRangePicker.default";

export const Default: Story = {
  name: "Default",
};
```

From `src/core/DateRangePicker/stories/Disabled.story.tsx`:

```tsx
import moment from "moment";
import { Story } from "./_DateRangePicker.default";
import { within, userEvent, expect, screen } from "storybook/test";

export const Disabled: Story = {
  name: "Disabled",
  args: {
    disabled: true,
    startDate: moment().subtract(7, "day").toDate(),
    endDate: moment().toDate(),
    testId: "daterangepicker-disabled-test",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const testId = args.testId;

    // Try to click and verify nothing happens (no tooltip appears)
    const leftOnClick = screen.getByTestId(`${testId}-left-reference-container`);
    await userEvent.click(leftOnClick);

    // Verify the container has the disabled class
    const container = canvasElement.querySelector(".date-range-picker-disabled");
    await expect(container).toBeTruthy();

    // Verify no tooltip appears
    const tooltips = canvasElement.querySelectorAll("[role='tooltip']");
    await expect(tooltips.length).toBe(0);
  },
};
```
