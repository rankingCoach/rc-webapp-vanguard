import { expect } from 'storybook/test';
import { Story } from './_TextHighlighted.default';

export const TextHighlightedDefault: Story = {
  args: {
    children: 'contact@grenierbrasserie.com',
    highlightWords: ['con'],
    translate: false,
    highlightColor: 'rgba(var(--w400-rgb),0.4)',
  },
  play: async ({ canvasElement }) => {
    const highlighted = canvasElement.querySelector<HTMLElement>('span[style*="background-color"]');
    await expect(highlighted).toBeInTheDocument();
    await expect(highlighted?.textContent).toBe('con');
  },
};
