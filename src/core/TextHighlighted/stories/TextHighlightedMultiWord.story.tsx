import { expect } from 'storybook/test';
import { Story } from './_TextHighlighted.default';

export const TextHighlightedMultiWord: Story = {
  args: {
    children: 'office@grenierbrasserie.com',
    highlightWords: ['office', 'gre'],
    translate: false,
    highlightColor: 'rgba(var(--e400-rgb),0.4)',
  },
  play: async ({ canvasElement }) => {
    const spans = canvasElement.querySelectorAll<HTMLElement>('span[style*="background-color"]');
    await expect(spans).toHaveLength(2);
    await expect(spans[0].textContent).toBe('office');
    await expect(spans[1].textContent).toBe('gre');
  },
};
