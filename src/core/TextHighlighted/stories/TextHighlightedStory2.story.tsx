import React from 'react';
import { Story, highlightColors } from './_TextHighlighted.default';

export const TextHighlightedStory2: Story = {
  args: {
    highlightWords: ['office'],
    translate: false,
    highlightColor: highlightColors.error,
    children: 'office@grenierbrasserie.com',
  },
};
