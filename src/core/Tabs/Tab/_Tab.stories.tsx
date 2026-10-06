import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { Tab } from "./Tab";
import { Story } from "./stories/_Tab.default";
import { BasicTabs as _BasicTabs } from "./stories/BasicTabs.story";
import { TabsWithIcons as _TabsWithIcons } from "./stories/TabsWithIcons.story";
import { TabsWithMultipleIcons as _TabsWithMultipleIcons } from "./stories/TabsWithMultipleIcons.story";
import { TabsWithErrors as _TabsWithErrors } from "./stories/TabsWithErrors.story";
import { UnderlineTheme as _UnderlineTheme } from "./stories/UnderlineTheme.story";
import { FloatingTheme as _FloatingTheme } from "./stories/FloatingTheme.story";
import { SmallTabs as _SmallTabs } from "./stories/SmallTabs.story";
import { TextTransform as _TextTransform } from "./stories/TextTransform.story";

export const BasicTabs: Story = { ..._BasicTabs };
export const TabsWithIcons: Story = { ..._TabsWithIcons };
export const TabsWithMultipleIcons: Story = { ..._TabsWithMultipleIcons };
export const TabsWithErrors: Story = { ..._TabsWithErrors };
export const UnderlineTheme: Story = { ..._UnderlineTheme };
export const FloatingTheme: Story = { ..._FloatingTheme };
export const SmallTabs: Story = { ..._SmallTabs };
export const TextTransform: Story = { ..._TextTransform };

export default {
  ...SbDecorator({
    title: "Vanguard/Tabs/Tab",
    component: Tab,
    extra: {
      args: {
        testId: "tab",
      },
    },
  }),
};
