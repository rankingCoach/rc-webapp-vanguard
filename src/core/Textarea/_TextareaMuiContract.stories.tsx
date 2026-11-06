/**
 * MUI upgrade contract (S0), real browser: Textarea renders MUI TextareaAutosize. Locks the observable
 * row/height behaviour and the `.MuiOutlinedInput-input` padding from InputBase.scss:118; the highlight
 * backdrop must track the textarea geometry. (`.MuiInputBase-inputMultiline` is not asserted: removed in
 * v9 and its InputBase.scss:252 rule is empty.)
 */
import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';

import { Textarea } from './Textarea';

/** Settle wait for transitions/poppers/async assets: 1s is not enough under a loaded full-suite run. */
const SETTLE = { timeout: 5000 };

export default {
  ...SbDecorator({
    title: 'Vanguard/Textarea/MUI Contract',
    component: Textarea,
    opts: { withRedux: true, maxWidth: '400px' },
  }),
};

type Story = StoryObj<typeof Textarea>;

const visible = (root: HTMLElement) => root.querySelector('textarea:not([aria-hidden])') as HTMLTextAreaElement;

export const AutosizeRowsAndPadding: Story = {
  args: { id: 'mc-ta', label: 'Bio', minRows: 3, maxRows: 5, allowBreakLines: true },
  play: async ({ canvasElement }) => {
    const ta = visible(canvasElement);
    await expect(ta.tagName).toBe('TEXTAREA');
    // `.MuiOutlinedInput-root .MuiOutlinedInput-input { padding: 12px 18px }`
    await expect(getComputedStyle(ta).paddingTop).toBe('12px');
    await expect(getComputedStyle(ta).paddingLeft).toBe('18px');
    const lineHeight = parseFloat(getComputedStyle(ta).lineHeight);
    await expect(lineHeight).toBe(24);
    // minRows=3 -> content height 3 lines (autosize sets an inline height)
    const contentHeight = () => parseFloat(ta.style.height);
    await waitFor(() => expect(contentHeight()).toBe(3 * lineHeight), SETTLE);
    // grows with content up to maxRows=5, then scrolls
    await userEvent.click(ta);
    await userEvent.keyboard('1{Enter}2{Enter}3{Enter}4');
    await waitFor(() => expect(contentHeight()).toBe(4 * lineHeight), SETTLE);
    await userEvent.keyboard('{Enter}5{Enter}6{Enter}7');
    await waitFor(() => expect(contentHeight()).toBe(5 * lineHeight), SETTLE);
    await expect(ta.style.overflow).toBe('');
  },
};

export const BackdropTracksTextarea: Story = {
  args: { id: 'mc-ta-bd', label: 'Post', value: 'see www.example.com today', minRows: 3 },
  play: async ({ canvasElement }) => {
    const ta = visible(canvasElement);
    const backdrop = canvasElement.querySelector('.vanguard-input-backdrop') as HTMLElement;
    await waitFor(() => {
      const t = ta.getBoundingClientRect();
      const b = backdrop.getBoundingClientRect();
      expect(Math.round(b.width)).toBe(Math.round(t.width));
      expect(Math.round(b.height)).toBe(Math.round(t.height));
      expect(Math.round(b.top)).toBe(Math.round(t.top));
      expect(Math.round(b.left)).toBe(Math.round(t.left));
    }, SETTLE);
    const mark = backdrop.querySelector('.vanguard-input-mark-red') as HTMLElement;
    await expect(mark.textContent).toBe('www.example.com');
  },
};
