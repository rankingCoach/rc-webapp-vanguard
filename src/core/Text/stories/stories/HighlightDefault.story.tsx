import { expect } from 'storybook/test';
import { Story } from './_Text.default';

export const HighlightDefault: Story = {
  args: {
    children: 'contact@grenierbrasserie.com',
    highlightWords: ['con'],
    translate: false,
    highlightColor: 'color-mix(in srgb, var(--w400) 40%, transparent)',
  },
  play: async ({ canvasElement }) => {
    const highlighted = canvasElement.querySelector<HTMLElement>('span[style*="background-color"]');
    await expect(highlighted).toBeInTheDocument();
    await expect(highlighted?.textContent).toBe('con');
  },
};
