import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { SearchableSelect } from "./SearchableSelect";
import { Story } from "./stories/_SearchableSelect.default";
import { Default as _Default } from "./stories/Default.story";
import { WithDescriptions as _WithDescriptions } from "./stories/WithDescriptions.story";
import { WithStartAdornment as _WithStartAdornment } from "./stories/WithStartAdornment.story";
import { WithElementName as _WithElementName } from "./stories/WithElementName.story";
import { WithUndefinedOptions as _WithUndefinedOptions } from "./stories/WithUndefinedOptions.story";
import { FuzzySearch as _FuzzySearch } from "./stories/FuzzySearch.story";
import { WithHtmlEncodedTitle as _WithHtmlEncodedTitle } from "./stories/WithHtmlEncodedTitle.story";

export const Default: Story = { ..._Default };
export const WithDescriptions: Story = { ..._WithDescriptions };
export const WithStartAdornment: Story = { ..._WithStartAdornment };
export const WithElementName: Story = { ..._WithElementName };
export const WithUndefinedOptions: Story = { ..._WithUndefinedOptions };
export const FuzzySearch: Story = { ..._FuzzySearch };
export const WithHtmlEncodedTitle: Story = { ..._WithHtmlEncodedTitle };

export default {
  ...SbDecorator({
    title: "Vanguard/SearchableSelect",
    component: SearchableSelect,
    opts: {
      withRedux: true,
    },
  }),
};
