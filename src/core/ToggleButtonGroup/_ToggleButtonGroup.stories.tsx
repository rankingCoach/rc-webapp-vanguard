import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { ToggleButtonGroup } from "./ToggleButtonGroup";
import { Story } from "./stories/_ToggleButtonGroup.default";
import { Default as _Default } from "./stories/Default.story";
import { WithIcons as _WithIcons } from "./stories/WithIcons.story";
import { MultipleSelection as _MultipleSelection } from "./stories/MultipleSelection.story";
import { Vertical as _Vertical } from "./stories/Vertical.story";
import { Disabled as _Disabled } from "./stories/Disabled.story";
import { InteractiveExclusive as _InteractiveExclusive } from "./stories/InteractiveExclusive.story";
import { InteractiveMultiple as _InteractiveMultiple } from "./stories/InteractiveMultiple.story";
import { Segmented as _Segmented } from "./stories/Segmented.story";

export default {
  ...SbDecorator({
    title: "Vanguard/ToggleButtonGroup",
    component: ToggleButtonGroup,
    extra: {
      args: {
        value: "left",
        exclusive: true,
      },
    },
  }),
};

export const Default: Story = { ..._Default };
export const WithIcons: Story = { ..._WithIcons };
export const MultipleSelection: Story = { ..._MultipleSelection };
export const Vertical: Story = { ..._Vertical };
export const Disabled: Story = { ..._Disabled };
export const InteractiveExclusive: Story = { ..._InteractiveExclusive };
export const InteractiveMultiple: Story = { ..._InteractiveMultiple };
export const Segmented: Story = { ..._Segmented };
