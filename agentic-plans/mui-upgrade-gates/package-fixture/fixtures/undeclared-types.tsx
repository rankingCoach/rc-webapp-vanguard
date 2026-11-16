/**
 * MEASURED (not gated) consumer fixture: public props typed by NON-MUI packages that are bundled (devDependencies)
 * but neither dependencies nor peers: moment, react-date-range, libphonenumber-js. Same reading as mui-typed.tsx:
 * an "unused" `@ts-expect-error` (TS2578) = the prop degrades to `any` for a consumer without that package.
 * These are not installed in either scenario, so A and B should agree here.
 */
import { DateRangeInput, DateRangePicker, DateTimePicker, PhoneNumber } from '@rankingcoach/vanguard';

export const UndeclaredTypeProbes = () => (
  <>
    {/* @ts-expect-error [PhoneNumber.countryCode(libphonenumber-js)] not a CountryCode */}
    <PhoneNumber countryCode="XX" />
    {/* @ts-expect-error [DateTimePicker.onChange.dateTime(moment)] third arg is Moment | null | undefined */}
    <DateTimePicker locale="en_US" onChange={(_d?: number, _t?: string, _m?: string) => undefined} />
    {/* @ts-expect-error [DateRangeInput.datePicker(react-date-range)] months must be a number */}
    <DateRangeInput datePicker={{ months: 'two' }} />
    {/* @ts-expect-error [DateRangePicker.ranges(react-date-range)] StaticRange needs range + isSelected */}
    <DateRangePicker ranges={[{ id: 1 }]} />
  </>
);
