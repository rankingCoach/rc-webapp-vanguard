import { TextHighlighted } from '@vanguard/TextHighlighted/TextHighlighted';
import React from 'react';
import { Story } from './_TextHighlighted.default';

export const TextHighlightedWithEmphasis: Story = {
  render: () => (
    <div>
      <TextHighlighted highlightWords={['off', 'e@']} translate={false} highlightColor={'rgba(var(--e400-rgb),0.4)'}>
        office@<b>grenier</b>bra<em>ss</em>erie.com
      </TextHighlighted>
      <TextHighlighted highlightWords={['con', 'ct']} translate={false} highlightColor={'rgba(var(--w400-rgb),0.4)'}>
        contact@<span>grenier</span>brasserie.com
      </TextHighlighted>
    </div>
  ),
};
