import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { preloadMuiFallbacks } from "../_internal/lazy-fallback";
import { AppBar } from "./AppBar";
import { Story } from "./stories/_AppBar.default";
import { Default as _Default } from "./stories/Default.story";
import { WithTitle as _WithTitle } from "./stories/WithTitle.story";
import { Secondary as _Secondary } from "./stories/Secondary.story";
import { WithFixedPosition as _WithFixedPosition } from "./stories/WithFixedPosition.story";
import { WithAbsolutePosition as _WithAbsolutePosition } from "./stories/WithAbsolutePosition.story";
import { WithStickyPosition as _WithStickyPosition } from "./stories/WithStickyPosition.story";
import { WithRelativePosition as _WithRelativePosition } from "./stories/WithRelativePosition.story";
import { WithDefaultColor as _WithDefaultColor } from "./stories/WithDefaultColor.story";
import { WithInheritColor as _WithInheritColor } from "./stories/WithInheritColor.story";
import { WithTransparentColor as _WithTransparentColor } from "./stories/WithTransparentColor.story";
import { WithElevation as _WithElevation } from "./stories/WithElevation.story";

export default {
  ...SbDecorator({
    title: "Vanguard/AppBar",
    component: AppBar,
    extra: {
      args: {
        position: "static",
      },
    },
  }),
  beforeEach: async () => {
    await preloadMuiFallbacks();
  },
};

export const Default: Story = { ..._Default };
export const WithTitle: Story = { ..._WithTitle };
export const Secondary: Story = { ..._Secondary };
export const WithFixedPosition: Story = { ..._WithFixedPosition };
export const WithAbsolutePosition: Story = { ..._WithAbsolutePosition };
export const WithStickyPosition: Story = { ..._WithStickyPosition };
export const WithRelativePosition: Story = { ..._WithRelativePosition };
export const WithDefaultColor: Story = { ..._WithDefaultColor };
export const WithInheritColor: Story = { ..._WithInheritColor };
export const WithTransparentColor: Story = { ..._WithTransparentColor };
export const WithElevation: Story = { ..._WithElevation };
