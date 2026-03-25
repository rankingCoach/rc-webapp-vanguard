import { expect } from 'storybook/test';
import { Story } from './_TextHighlighted.default';

export const TextHighlightedStripsImgTag: Story = {
  args: {
    children: '"><img src=x onerror=alert(1)>',
    translate: false,
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('img')).toBeNull();
  },
};

export const TextHighlightedStripsScriptTag: Story = {
  args: {
    children: 'hello<script>alert(1)</script>world',
    translate: false,
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('script')).toBeNull();
  },
};

export const TextHighlightedStripsEventAttributes: Story = {
  args: {
    children: '<span onclick="alert(1)">click me</span>',
    translate: false,
  },
  play: async ({ canvasElement }) => {
    const span = canvasElement.querySelector('span[onclick]');
    await expect(span).toBeNull();
  },
};

export const TextHighlightedPreservesWhitelistedTags: Story = {
  args: {
    children: 'hello <b>bold</b> and <em>italic</em>',
    translate: false,
  },
  play: async ({ canvasElement }) => {
    const bold = canvasElement.querySelector('b');
    await expect(bold).toBeInTheDocument();
    await expect(bold?.textContent).toBe('bold');

    const italic = canvasElement.querySelector('em');
    await expect(italic).toBeInTheDocument();
    await expect(italic?.textContent).toBe('italic');
  },
};
