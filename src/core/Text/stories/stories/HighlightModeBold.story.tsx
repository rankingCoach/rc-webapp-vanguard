import { expect } from 'storybook/test';
import { Story } from './_Text.default';

export const HighlightModeBold: Story = {
  args: {
    children: 'Contact us at CONTACT@example.com for Support',
    highlightWords: ['contact', 'support'],
    translate: false,
    caseInsensitive: true,
    highlightMode: 'bold',
    highlightColor: 'var(--p500)',
  },
  play: async ({ canvasElement }) => {
    // Use "bold" not "font-weight" to avoid matching the outer Text element which has font-weight:normal
    const spans = canvasElement.querySelectorAll<HTMLElement>('span[style*="bold"]');
    // 'contact' matches 'Contact' and 'CONTACT', 'support' matches 'Support'
    await expect(spans).toHaveLength(3);
    for (const span of spans) {
      await expect(span.style.fontWeight).toBe('bold');
    }
  },
};
