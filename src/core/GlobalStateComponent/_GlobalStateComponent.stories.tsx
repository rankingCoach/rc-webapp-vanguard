import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { GlobalStateComponent } from "./GlobalStateComponent";
import { Story } from "./stories/_GlobalStateComponent.default";
import { Default as _Default } from "./stories/Default.story";
import { Hoverable as _Hoverable } from "./stories/Hoverable.story";
import { Blurred as _Blurred } from "./stories/Blurred.story";
import { Shimmering as _Shimmering } from "./stories/Shimmering.story";

export default {
  ...SbDecorator({
    title: "Vanguard/GlobalStateComponent",
    component: GlobalStateComponent,
    extra: {
      argTypes: {
        hoverable: {
          control: { type: "boolean" },
          description: "Highlights the content while the pointer is over it",
        },
        blurred: {
          control: { type: "boolean" },
          description: "Blurs the content and blocks pointer interaction with it",
        },
        shimmering: {
          control: { type: "boolean" },
          description: "Sweeps a shimmer band over the content, e.g. while it is loading",
        },
        children: {
          control: false,
          description: "Content the states are drawn over",
        },
      },
    },
  }),
};

export const Default: Story = { ..._Default };
export const Hoverable: Story = { ..._Hoverable };
export const Blurred: Story = { ..._Blurred };
export const Shimmering: Story = { ..._Shimmering };
