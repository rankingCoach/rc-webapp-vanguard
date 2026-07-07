import { Text } from '@vanguard/Text/Text';
import React from 'react';
import { Story } from './_Text.default';

export const HighlightWithEmphasis: Story = {
  render: () => (
    <div>
      <Text highlightWords={['off', 'e@']} translate={false} highlightColor={'color-mix(in srgb, var(--e400) 40%, transparent)'}>
        office@<b>grenier</b>bra<em>ss</em>erie.com
      </Text>
      <Text highlightWords={['con', 'ct']} translate={false} highlightColor={'color-mix(in srgb, var(--w400) 40%, transparent)'}>
        contact@<span>grenier</span>brasserie.com
      </Text>
    </div>
  ),
};
