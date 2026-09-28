import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { AiGlow } from "@vanguard/AiGlow/AiGlow";
import { Story } from "./stories/_AiGlow.default";
import { Default as _Default } from "./stories/Default.story";
import { WithBorderRadius as _WithBorderRadius } from "./stories/WithBorderRadius.story";
import { WithColors as _WithColors } from "./stories/WithColors.story";
import { WithBorderWidth as _WithBorderWidth } from "./stories/WithBorderWidth.story";
import { WithBlurWidth as _WithBlurWidth } from "./stories/WithBlurWidth.story";
import { WithClassName as _WithClassName } from "./stories/WithClassName.story";
import { TwoAiGlowComponents as _TwoAiGlowComponents } from "./stories/TwoAiGlowComponents.story";
import { DerivedFromBase as _DerivedFromBase } from "./stories/DerivedFromBase.story";

export const Default: Story = { ..._Default };
export const WithBorderRadius: Story = { ..._WithBorderRadius };
export const WithColors: Story = { ..._WithColors };
export const WithBorderWidth: Story = { ..._WithBorderWidth };
export const WithBlurWidth: Story = { ..._WithBlurWidth };
export const WithClassName: Story = { ..._WithClassName };
export const TwoAiGlowComponents: Story = { ..._TwoAiGlowComponents };
export const DerivedFromBase: Story = { ..._DerivedFromBase };

export default {
  ...SbDecorator({
    title: "Vanguard/AiGlow",
    component: AiGlow,
    extra: {
      argTypes: {
        borderRadius: {
          control: { type: "number" },
          description: "Border radius for the AI glow effect",
        },
        blurWidth: {
          control: { type: "number" },
          description: "Blur width for the AI glow effect (in pixels)",
        },
        borderWidth: {
          control: { type: "number" },
          description: "Border width for the AI glow effect (in pixels)",
        },
        baseColor: {
          control: { type: "color" },
          description:
            "The glow's only color; the accent and light stops are derived from it. Defaults to the inherited `--ai-base-color`",
        },
        children: {
          control: false,
          description: "React node to be wrapped with AI glow effect",
        },
      },
    },
    opts: {
      fullScreen: true,
    },
  }),
};
