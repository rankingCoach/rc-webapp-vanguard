import { Story } from './_TextHighlighted.default';

export const TextHighlightedXSSProtection: Story = {
  args: {
    children: '><img/src/onerror=confirm(`XSS`)>',
    highlightWords: ['con', 'ct'],
    translate: true,
    highlightColor: 'rgba(var(--w400-rgb),0.4)',
  },
};
