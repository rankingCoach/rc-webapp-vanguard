import { expect } from 'storybook/test';
import { Story } from './_Text.default';

const baseArgs = {
  children: 'contact@EXAMPLE.com for Contact support CONTACT',
  highlightWords: ['CONTACT'],
  translate: false,
  highlightColor: 'rgba(var(--w400-rgb),0.4)',
} satisfies Partial<Story['args']>;

export const HighlightCaseInsensitiveFalse: Story = {
  args: {
    ...baseArgs,
    highlightCaseInsensitive: false,
  },
  play: async ({ canvasElement }) => {
    const spans = canvasElement.querySelectorAll<HTMLElement>('span[style*="background-color"]');
    // Only the exact uppercase match 'CONTACT' (standalone at end) is highlighted
    await expect(spans).toHaveLength(1);
    await expect(spans[0].textContent).toBe('CONTACT');
  },
};

export const HighlightCaseInsensitiveTrue: Story = {
  args: {
    ...baseArgs,
    highlightCaseInsensitive: true,
  },
  play: async ({ canvasElement }) => {
    const spans = canvasElement.querySelectorAll<HTMLElement>('span[style*="background-color"]');
    // Matches 'contact', 'CONTACT' (in email), 'Contact', and 'CONTACT' (standalone) — all 3
    await expect(spans).toHaveLength(3);
  },
};
