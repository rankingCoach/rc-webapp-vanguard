import { SbDecorator } from "@test-utils/get-storybook-decorator";
import type { StoryObj } from "@storybook/react-vite";

import { RcTransparentAllComponentsGrid } from "../RcTransparentAllComponentsGrid";
import { RcTransparentShowcase } from "../RcTransparentShowcase";

export default {
  ...SbDecorator({
    title: "Vanguard/_showcase/RcTransparentShowcase",
    component: RcTransparentShowcase,
    opts: { withRedux: true, fullScreen: true, hideAllControls: true },
  }),
};

export const ConvertedComponents: StoryObj<typeof RcTransparentShowcase> = {};

export const AllComponentsGrid: StoryObj<typeof RcTransparentAllComponentsGrid> = {
  render: () => <RcTransparentAllComponentsGrid />,
};
