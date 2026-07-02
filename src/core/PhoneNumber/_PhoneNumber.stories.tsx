import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { PhoneNumber } from "./PhoneNumber";
import { Story } from "./stories/_PhoneNumber.default";
import { Default as _Default } from "./stories/Default.story";
import { WithDisabled as _WithDisabled } from "./stories/WithDisabled.story";
import { WithIndianNumber as _WithIndianNumber } from "./stories/WithIndianNumber.story";
import { WithIsraeliNumber as _WithIsraeliNumber } from "./stories/WithIsraeliNumber.story";
import { WithJapaneseNumber as _WithJapaneseNumber } from "./stories/WithJapaneseNumber.story";
import { WithNigerianNumber as _WithNigerianNumber } from "./stories/WithNigerianNumber.story";

export const Default: Story = { ..._Default };
export const WithDisabled: Story = { ..._WithDisabled };
export const WithIndianNumber: Story = { ..._WithIndianNumber };
export const WithNigerianNumber: Story = { ..._WithNigerianNumber };
export const WithJapaneseNumber: Story = { ..._WithJapaneseNumber };
export const WithIsraeliNumber: Story = { ..._WithIsraeliNumber };

export default {
  ...SbDecorator({
    title: "Vanguard/PhoneNumber",
    component: PhoneNumber,
    opts: {
      withRedux: true,
    },
  }),
};