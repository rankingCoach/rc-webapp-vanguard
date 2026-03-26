import { expect } from 'storybook/test';
import { Story } from './_Text.default';

export const HighlightModeBackground: Story = {
  args: {
    children: 'Search results for Query inside a longer sentence with query repeated',
    highlightWords: ['query'],
    translate: false,
    caseInsensitive: true,
    highlightMode: 'background',
    highlightColor: 'var(--p500)',
  },
  play: async ({ canvasElement }) => {
    const spans = canvasElement.querySelectorAll<HTMLElement>('span[style*="background-color"]');
    // 'query' case-insensitive matches 'Query' and 'query'
    await expect(spans).toHaveLength(2);
    for (const span of spans) {
      await expect(span.style.backgroundColor).toBe('var(--p500)');
    }
  },
};
