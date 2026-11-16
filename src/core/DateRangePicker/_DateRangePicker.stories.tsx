import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { DateRangePicker } from "./DateRangePicker";
import { Story } from "./stories/_DateRangePicker.default";
import { Default as _Default } from "./stories/Default.story";
import { WithOnDateRangeSelect as _WithOnDateRangeSelect } from "./stories/WithOnDateRangeSelect.story";
import { WithInteraction as _WithInteraction } from "./stories/WithInteraction.story";
import { WithMinMaxDate as _WithMinMaxDate } from "./stories/WithMinMaxDate.story";
import { WithCustomRanges as _WithCustomRanges } from "./stories/WithCustomRanges.story";
import { WithCallback as _WithCallback } from "./stories/WithCallback.story";
import { Disabled as _Disabled } from "./stories/Disabled.story";
import { RangeSelectorTest as _RangeSelectorTest } from "./stories/RangeSelectorTest.story";
import { PopoverCloseTest as _PopoverCloseTest } from "./stories/PopoverCloseTest.story";
import { InvalidInterval as _InvalidInterval } from "./stories/InvalidInterval.story";
import { RightEdgeTest as _RightEdgeTest } from "./stories/RightEdgeTest.story";

export const Default: Story = { ..._Default };
export const WithOnDateRangeSelect: Story = { ..._WithOnDateRangeSelect };
export const WithInteraction: Story = { ..._WithInteraction };
export const WithMinMaxDate: Story = { ..._WithMinMaxDate };
export const WithCustomRanges: Story = { ..._WithCustomRanges };
export const WithCallback: Story = { ..._WithCallback };
export const Disabled: Story = { ..._Disabled };
export const RangeSelectorTest: Story = { ..._RangeSelectorTest };
export const PopoverCloseTest: Story = { ..._PopoverCloseTest };
export const InvalidInterval: Story = { ..._InvalidInterval };
export const RightEdgeTest: Story = { ..._RightEdgeTest };

export default {
  ...SbDecorator({
    title: "Vanguard/DateRangePicker",
    component: DateRangePicker,
    extra: {
      argTypes: {
        onChange: { table: { disable: true } },
        ranges: { table: { disable: true } },
      },
    },
    opts: {
      withRedux: true,
    },
  }),
};
