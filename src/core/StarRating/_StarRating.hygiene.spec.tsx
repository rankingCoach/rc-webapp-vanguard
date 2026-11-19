import { act, fireEvent, render } from '@test-utils/test-utils';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { StarRating } from './StarRating';

/** Leak hygiene (track d): the 2 s hover re-enable timer must not outlive the component. */
describe('StarRating timer hygiene', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('leaves no pending timer after a rating change and unmount', () => {
    const { container, unmount } = render(<StarRating size={16} value={2} readonly={false} onChange={() => {}} />);
    const star = container.querySelector('[data-slot="star"]') as HTMLElement;
    act(() => {
      fireEvent.click(star, { clientX: 1 });
    });
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('keeps one pending re-enable timer across repeated changes', () => {
    const { container } = render(<StarRating size={16} value={2} readonly={false} onChange={() => {}} />);
    const star = container.querySelector('[data-slot="star"]') as HTMLElement;
    const before = vi.getTimerCount();
    for (let i = 0; i < 3; i++) {
      act(() => {
        fireEvent.click(star, { clientX: 1 });
      });
    }
    expect(vi.getTimerCount() - before).toBe(1);
  });
});
