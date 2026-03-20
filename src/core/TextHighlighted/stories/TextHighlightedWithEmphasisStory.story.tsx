import { Story, highlightColors } from './_TextHighlighted.default';

export const TextHighlightedWithEmphasisStory: Story = {
  args: {
    highlightWords: ['off', 'e@'],
    translate: false,
    highlightColor: highlightColors.error,
    children: 'office@<em>grenierbrasserie</em>.com',
  },
};
