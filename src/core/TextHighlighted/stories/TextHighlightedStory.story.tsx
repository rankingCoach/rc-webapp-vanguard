import React from 'react';
import { Story, highlightColors } from './_TextHighlighted.default';

export const TextHighlightedStory: Story = {
  args: {
    highlightWords: ['con', 'ct'],
    translate: false,
    highlightColor: highlightColors.warning,
    children: 'contact@grenierbrasserie.com',
  },
};
