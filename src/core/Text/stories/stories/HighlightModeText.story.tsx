import { expect } from 'storybook/test';
import { Story } from './_Text.default';

export const HighlightModeText: Story = {
  args: {
    children: '@john mentioned @Jane in this conversation',
    highlightWords: ['@john', '@jane'],
    translate: false,
    caseInsensitive: true,
    highlightMode: 'text',
    highlightColor: 'var(--p500)',
  },
  play: async ({ canvasElement }) => {
    // Use specific highlight color to avoid matching the outer Text element's color style
    const spans = canvasElement.querySelectorAll<HTMLElement>('span[style*="var(--p500)"]');
    // '@john' and '@Jane' (case-insensitive match of '@jane')
    await expect(spans).toHaveLength(2);
    for (const span of spans) {
      await expect(span.style.color).toBe('var(--p500)');
    }
  },
};
