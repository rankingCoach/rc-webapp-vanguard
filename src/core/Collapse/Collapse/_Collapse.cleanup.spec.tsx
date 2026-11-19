import { render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Collapse } from './Collapse';

/** Track g: the own Collapse leaves no timer behind when unmounted mid-transition; root carries the DOM contract. */
describe('Collapse cleanup and contract', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('unmounting while entering or exiting leaves no pending timer', () => {
    const base = vi.getTimerCount();
    const view = render(<Collapse isOpen={false}>x</Collapse>);
    view.rerender(<Collapse isOpen={true}>x</Collapse>);
    expect(vi.getTimerCount()).toBeGreaterThan(base);
    view.unmount();
    expect(vi.getTimerCount()).toBe(base);

    const v2 = render(<Collapse isOpen={true}>x</Collapse>);
    v2.rerender(<Collapse isOpen={false}>x</Collapse>);
    v2.unmount();
    expect(vi.getTimerCount()).toBe(base);
  });

  it('root is the own-core collapse with slot, orientation and open state', () => {
    const { container, rerender } = render(
      <Collapse isOpen={false} orientation={'horizontal'} className={'mine'}>
        x
      </Collapse>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.hasAttribute('data-vg-core')).toBe(true);
    expect(root.getAttribute('data-slot')).toBe('collapse');
    expect(root.getAttribute('data-orientation')).toBe('horizontal');
    expect(root.hasAttribute('data-open')).toBe(false);
    expect(root.classList.contains('mine')).toBe(true);
    rerender(
      <Collapse isOpen={true} orientation={'horizontal'}>
        x
      </Collapse>,
    );
    expect(root.getAttribute('data-open')).toBe('');
  });
});
