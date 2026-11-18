import { fireEvent, render } from '@test-utils/test-utils';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ListItems } from './ListItems';

/** Leak hygiene (track d): the <ul> scroll listener must not pile up across item updates and must go on unmount. */
const item = (id: string) => ({ id, left: 'L', right: 'R', title: id, content: 'C', last: 'X' });

const countScrollListeners = () => {
  const add = vi.spyOn(HTMLUListElement.prototype, 'addEventListener');
  const remove = vi.spyOn(HTMLUListElement.prototype, 'removeEventListener');
  return () =>
    add.mock.calls.filter(([type]) => type === 'scroll').length -
    remove.mock.calls.filter(([type]) => type === 'scroll').length;
};

describe('ListItems listener hygiene', () => {
  afterEach(() => vi.restoreAllMocks());

  it('keeps at most one scroll listener on the list across item updates', () => {
    const active = countScrollListeners();
    const { rerender } = render(<ListItems items={[item('a')]} />);
    rerender(<ListItems items={[item('a'), item('b')]} />);
    rerender(<ListItems items={[item('a'), item('b'), item('c')]} />);
    expect(active()).toBe(1);
  });

  it('removes the scroll listener on unmount', () => {
    const active = countScrollListeners();
    const { unmount } = render(<ListItems items={[item('a')]} />);
    unmount();
    expect(active()).toBe(0);
  });

  it('after 3 item updates + scroll shows the same as a fresh mount with the final items + scroll', () => {
    const final = [item('a'), item('b'), item('c')];
    const updated = render(<ListItems items={[item('a')]} stickyIndex={0} testId={'u'} />);
    updated.rerender(<ListItems items={[item('a'), item('b')]} stickyIndex={0} testId={'u'} />);
    updated.rerender(<ListItems items={[item('a'), item('b'), item('d')]} stickyIndex={0} testId={'u'} />);
    updated.rerender(<ListItems items={final} stickyIndex={0} testId={'u'} />);
    fireEvent.scroll(updated.container.querySelector('ul') as HTMLElement);
    const fresh = render(<ListItems items={final} stickyIndex={0} testId={'u'} />);
    fireEvent.scroll(fresh.container.querySelector('ul') as HTMLElement);
    expect(updated.container.innerHTML).toBe(fresh.container.innerHTML);
  });
});
