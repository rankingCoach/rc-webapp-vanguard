import { disableControls, SbDecorator } from "@test-utils/get-storybook-decorator";
import { TextHighlighted } from "./TextHighlighted";
import { Story } from "./stories/_TextHighlighted.default";
import { TextHighlightedStory as _TextHighlightedStory } from "./stories/TextHighlightedStory.story";
import { TextHighlightedStory2 as _TextHighlightedStory2 } from "./stories/TextHighlightedStory2.story";
import { TextHighlightedWithEmphasisStory as _TextHighlightedWithEmphasisStory } from "./stories/TextHighlightedWithEmphasisStory.story";
import { TextHighlightedWithXSSAttackStory as _TextHighlightedWithXSSAttackStory } from "./stories/TextHighlightedWithXSSAttackStory.story";

export const TextHighlightedStory: Story = { ..._TextHighlightedStory };
export const TextHighlightedStory2: Story = { ..._TextHighlightedStory2 };
export const TextHighlightedWithEmphasisStory: Story = { ..._TextHighlightedWithEmphasisStory };
export const TextHighlightedWithXSSAttackStory: Story = { ..._TextHighlightedWithXSSAttackStory };

export default {
  ...SbDecorator({
    title: "vanguard/TextHighlighted",
    component: TextHighlighted,
    extra: {
      ...disableControls([""]),
    },
  }),
};
