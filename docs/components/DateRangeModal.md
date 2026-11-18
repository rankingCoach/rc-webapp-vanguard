# DateRangeModal

Modal for selecting date ranges with calendars, presets and validation.

- Kind: component
- Import: `import { DateRangeModal } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/StandardModals/DateRangeModal/DateRangeModal.tsx`
- Keywords: modal, date, range, calendar, picker, selection

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `close` | `ModalResponseHandler<DateRangePickerResp>` | yes |  |
| `compact` | `() => void` | no | Injected only when ModalService.open opts into allowCompact. |
| `ctaNegative` | `ModalFooterAction & SubButtonProps` | no |  |
| `ctaPosition` | `"start" \| "end" \| "between" \| "center"` | no |  |
| `ctaPositive` | `ModalFooterAction & SubButtonProps` | no |  |
| `customNegativeFn` | `(change?: React.Dispatch<React.SetStateAction<number>>) => void` | no |  |
| `endDate` | `Date \| moment.Moment` | no |  |
| `expand` | `() => void` | no | Restore the original presentation without losing component state. |
| `headerType` | `ModalType` | no |  |
| `hideHeaderCloseBtn` | `boolean` | no |  |
| `initialValue` | `DateRangeInitialProps` | no |  |
| `message` | `React.ReactNode` | no |  |
| `navigatorRenderer` | `(currFocusedDate: Date, changeShownDate: (value: string \| number \| Date, mode?: "set" \| …` | no |  |
| `negativeCtaText` | `string` | no |  |
| `onChange` | `(e: DateRangePickerResp) => void` | no |  |
| `positiveCtaText` | `string` | no |  |
| `positiveIconLeft` | `IconNames` | no |  |
| `startDate` | `Date \| moment.Moment` | no |  |
| `title` | `string` | no |  |
| `view` | `DateRangeView` | no |  |
