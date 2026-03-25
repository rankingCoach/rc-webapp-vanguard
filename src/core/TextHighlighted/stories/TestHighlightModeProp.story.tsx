import { expect } from 'storybook/test';
import { TextTypes } from '@vanguard/Text/Text';
import { Story } from './_TextHighlighted.default';

const baseArgs = {
  translate: false,
  caseInsensitive: true,
  highlightColor: 'var(--p500)',
  type: TextTypes.textHelp,
  color: 'var(--fn-fg-light)',
  balanced: true,
} satisfies Partial<Story['args']>;

export const TestHighlightModeBackground: Story = {
  args: {
    ...baseArgs,
    children: 'Search results for Query inside a longer sentence with query repeated',
    highlightWords: ['query'],
    highlightMode: 'background',
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

export const TestHighlightModeText: Story = {
  args: {
    ...baseArgs,
    children: '@john mentioned @Jane in this conversation',
    highlightWords: ['@john', '@jane'],
    highlightMode: 'text',
  },
  play: async ({ canvasElement }) => {
    // Use the specific highlight color to avoid matching the outer Text element's color style
    const spans = canvasElement.querySelectorAll<HTMLElement>('span[style*="var(--p500)"]');
    // '@john' and '@Jane' (case-insensitive match of '@jane')
    await expect(spans).toHaveLength(2);
    for (const span of spans) {
      await expect(span.style.color).toBe('var(--p500)');
    }
  },
};

export const TestHighlightModeBold: Story = {
  args: {
    ...baseArgs,
    children: 'Contact us at CONTACT@example.com for Support',
    highlightWords: ['contact', 'support'],
    highlightMode: 'bold',
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
