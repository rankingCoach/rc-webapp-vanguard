import React from 'react';
import { Story, highlightColors } from './_TextHighlighted.default';

export const TextHighlightedWithXSSAttackStory: Story = {
  args: {
    highlightWords: ['con', 'ct'],
    translate: true,
    highlightColor: highlightColors.warning,
    children: '"><img/src/onerror=confirm(`XSS`)>',
  },
};
