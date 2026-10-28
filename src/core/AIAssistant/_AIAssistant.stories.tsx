import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { aiAssistantStore } from "./stories/bootstrap/aiassistant.test.slice";
import { AIAssistant } from "@vanguard/AIAssistant/AIAssistant";
import { Story } from "./stories/_AIAssistant.default";
import { Default as _Default } from "./stories/Default.story";
import { WithCustomButtonText as _WithCustomButtonText } from "./stories/WithCustomButtonText.story";
import { Disabled as _Disabled } from "./stories/Disabled.story";
import { WithCallbacks as _WithCallbacks } from "./stories/WithCallbacks.story";
import { WithKeywords as _WithKeywords } from "./stories/WithKeywords.story";
import { WithOptions as _WithOptions } from "./stories/WithOptions.story";
import { PanelOpen as _PanelOpen } from "./stories/PanelOpen.story";

export const Default: Story = { ..._Default };
export const WithCustomButtonText: Story = { ..._WithCustomButtonText };
export const Disabled: Story = { ..._Disabled };
export const WithCallbacks: Story = { ..._WithCallbacks };
export const WithKeywords: Story = { ..._WithKeywords };
export const WithOptions: Story = { ..._WithOptions };
export const PanelOpen: Story = { ..._PanelOpen };

export default {
  ...SbDecorator({
    title: "Vanguard/AIAssistant",
    component: AIAssistant,
    opts: {
      customStore: aiAssistantStore,
    },
  }),
};