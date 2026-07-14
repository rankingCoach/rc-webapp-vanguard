import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { Autocomplete } from "./Autocomplete";
import { Story } from "./stories/_Autocomplete.default";
import { Default as _Default } from "./stories/Default.story";
import { WithLabel as _WithLabel } from "./stories/WithLabel.story";
import { WithMultiple as _WithMultiple } from "./stories/WithMultiple.story";
import { WithAdornment as _WithAdornment } from "./stories/WithAdornment.story";
import { Disabled as _Disabled } from "./stories/Disabled.story";
import { WithHighlightOptions as _WithHighlightOptions } from "./stories/WithHighlightOptions.story";
import { WithRestrictToOptions as _WithRestrictToOptions } from "./stories/WithRestrictToOptions.story";
import { WithLoading as _WithLoading } from "./stories/WithLoading.story";
import { WithInfoText as _WithInfoText } from "./stories/WithInfoText.story";
import { WithNoOptionsText as _WithNoOptionsText } from "./stories/WithNoOptionsText.story";

export const Default: Story = { ..._Default };
export const WithLabel: Story = { ..._WithLabel };
export const WithMultiple: Story = { ..._WithMultiple };
export const WithAdornment: Story = { ..._WithAdornment };
export const Disabled: Story = { ..._Disabled };
export const WithHighlightOptions: Story = { ..._WithHighlightOptions };
export const WithRestrictToOptions: Story = { ..._WithRestrictToOptions };
export const WithLoading: Story = { ..._WithLoading };
export const WithInfoText: Story = { ..._WithInfoText };
export const WithNoOptionsText: Story = { ..._WithNoOptionsText };

export default {
  ...SbDecorator({
    title: "vanguard/Autocomplete",
    component: Autocomplete,
    opts: {
      withRedux: true,
    },
  }),
};