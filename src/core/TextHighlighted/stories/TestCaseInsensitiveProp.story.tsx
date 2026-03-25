import { expect } from 'storybook/test';
import { Story } from './_TextHighlighted.default';

const baseArgs = {
  children: 'contact@EXAMPLE.com for Contact support CONTACT',
  highlightWords: ['CONTACT'],
  translate: false,
  highlightColor: 'rgba(var(--w400-rgb),0.4)',
} satisfies Partial<Story['args']>;

export const TestCaseInsensitiveFalse: Story = {
  args: {
    ...baseArgs,
    caseInsensitive: false,
  },
  play: async ({ canvasElement }) => {
    const spans = canvasElement.querySelectorAll<HTMLElement>('span[style*="background-color"]');
    // Only the exact uppercase match 'CONTACT' is highlighted
    await expect(spans).toHaveLength(1);
    await expect(spans[0].textContent).toBe('CONTACT');
  },
};

export const TestCaseInsensitiveTrue: Story = {
  args: {
    ...baseArgs,
    caseInsensitive: true,
  },
  play: async ({ canvasElement }) => {
    const spans = canvasElement.querySelectorAll<HTMLElement>('span[style*="background-color"]');
    // Matches 'contact', 'CONTACT', and 'Contact' — all 3 occurrences
    await expect(spans).toHaveLength(3);
  },
};
