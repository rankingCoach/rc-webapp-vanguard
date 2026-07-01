import { SbDecorator } from "@test-utils/get-storybook-decorator";
import type { StoryObj } from "@storybook/react-vite";

import { CssUpdatesShowcase } from "../CssUpdatesShowcase";

export default {
  ...SbDecorator({
    title: "Vanguard/_showcase/CssUpdatesShowcase",
    component: CssUpdatesShowcase,
    opts: { withRedux: true, fullScreen: true, hideAllControls: true },
  }),
};

export const ModifiedComponents: StoryObj<typeof CssUpdatesShowcase> = {};
