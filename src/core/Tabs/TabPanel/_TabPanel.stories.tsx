import { SbDecorator } from "@test-utils/get-storybook-decorator";
import React from "react";
import { TabPanel } from "./TabPanel";
import { Story } from "./stories/_TabPanel.default";
import { Default as _Default } from "./stories/Default.story";
import { ActivePanel as _ActivePanel } from "./stories/ActivePanel.story";
import { InactivePanel as _InactivePanel } from "./stories/InactivePanel.story";
import { WithA11yIds as _WithA11yIds } from "./stories/WithA11yIds.story";

export const Default: Story = { ..._Default };
export const ActivePanel: Story = { ..._ActivePanel };
export const InactivePanel: Story = { ..._InactivePanel };
export const WithA11yIds: Story = { ..._WithA11yIds };

export default {
  ...SbDecorator({
    title: "Vanguard/Tabs/TabPanel",
    component: TabPanel,
    extra: {
      args: {
        currentTab: 0,
        value: 0,
        children: <div>Tab panel content</div>,
      },
    },
  }),
};
