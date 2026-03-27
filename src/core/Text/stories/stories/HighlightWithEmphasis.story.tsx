import { Text } from '@vanguard/Text/Text';
import React from 'react';
import { Story } from './_Text.default';

export const HighlightWithEmphasis: Story = {
  render: () => (
    <div>
      <Text highlightWords={['off', 'e@']} translate={false} highlightColor={'rgba(var(--e400-rgb),0.4)'}>
        office@<b>grenier</b>bra<em>ss</em>erie.com
      </Text>
      <Text highlightWords={['con', 'ct']} translate={false} highlightColor={'rgba(var(--w400-rgb),0.4)'}>
        contact@<span>grenier</span>brasserie.com
      </Text>
    </div>
  ),
};
