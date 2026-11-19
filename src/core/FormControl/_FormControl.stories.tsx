import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { preloadMuiFallbacks } from "../_internal/lazy-fallback";
import { FormControl } from "./FormControl";
import { Story } from "./stories/_FormControl.default";
import { Default as _Default } from "./stories/Default.story";
import { WithSelect as _WithSelect } from "./stories/WithSelect.story";
import { WithHelperText as _WithHelperText } from "./stories/WithHelperText.story";
import { ErrorState as _ErrorState } from "./stories/ErrorState.story";
import { Disabled as _Disabled } from "./stories/Disabled.story";
import { FullWidth as _FullWidth } from "./stories/FullWidth.story";
import { WithColor as _WithColor } from "./stories/WithColor.story";
import { HiddenLabel as _HiddenLabel } from "./stories/HiddenLabel.story";
import { Required as _Required } from "./stories/Required.story";
import { WithSize as _WithSize } from "./stories/WithSize.story";
import { WithVariant as _WithVariant } from "./stories/WithVariant.story";
import { WithSx as _WithSx } from "./stories/WithSx.story";
import { WithClassName as _WithClassName } from "./stories/WithClassName.story";

export default {
  ...SbDecorator({
    title: "Vanguard/FormControl",
    component: FormControl,
  }),
  beforeEach: async () => {
    await preloadMuiFallbacks();
  },
};

export const Default: Story = { ..._Default };
export const WithSelect: Story = { ..._WithSelect };
export const WithHelperText: Story = { ..._WithHelperText };
export const ErrorState: Story = { ..._ErrorState };
export const Disabled: Story = { ..._Disabled };
export const FullWidth: Story = { ..._FullWidth };
export const WithColor: Story = { ..._WithColor };
export const HiddenLabel: Story = { ..._HiddenLabel };
export const Required: Story = { ..._Required };
export const WithSize: Story = { ..._WithSize };
export const WithVariant: Story = { ..._WithVariant };
export const WithSx: Story = { ..._WithSx };
export const WithClassName: Story = { ..._WithClassName };
