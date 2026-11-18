import { render } from '@test-utils/test-utils';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FadedCarousel } from './FadedCarousel';

/** Leak hygiene (track d): the center-mode rAF loop must be cancelled on unmount and on item changes. */
const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((id) => <span key={id}>{id}</span>);

describe('FadedCarousel center-mode rAF hygiene', () => {
  afterEach(() => vi.restoreAllMocks());

  it('cancels its pending animation frame on unmount', () => {
    const pending = new Set<number>();
    let next = 1;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => {
      const id = next++;
      pending.add(id);
      return id;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id: number) => {
      pending.delete(id);
    });
    const { unmount, rerender } = render(<FadedCarousel items={items} mode={'center'} />);
    rerender(<FadedCarousel items={items.slice(0, 5)} mode={'center'} />);
    expect(pending.size).toBe(1);
    unmount();
    expect(pending.size).toBe(0);
  });
});
