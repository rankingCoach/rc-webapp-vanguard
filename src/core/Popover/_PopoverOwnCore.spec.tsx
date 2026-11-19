import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { Popover } from './Popover';

/** Queue 2.3: Popover renders on the own Tooltip (own-core marker), the wrapper is the `popover-trigger` slot. */
describe('Popover on the own core', () => {
  it('opens an own-core tooltip on hover, wrapper span is the popover-trigger slot', async () => {
    const view = render(
      <Popover message="Help" position="top">
        <button type="button">{'trigger'}</button>
      </Popover>,
    );
    const wrapper = view.container.querySelector('[data-slot="popover-trigger"]') as HTMLElement;
    expect(wrapper?.tagName).toBe('SPAN');
    await act(async () => {
      fireEvent.mouseEnter(wrapper);
    });
    const popper = document.querySelector('[role="tooltip"]');
    expect(popper?.hasAttribute('data-vg-core')).toBe(true);
    expect(popper?.classList.contains('vanguard-popover')).toBe(true);
    view.unmount();
  });

  it('wrapChildren={false}: no wrapper slot, the child is the trigger', () => {
    const view = render(
      <Popover message="Help" wrapChildren={false}>
        <button type="button">{'trigger'}</button>
      </Popover>,
    );
    expect(view.container.querySelector('[data-slot="popover-trigger"]')).toBeNull();
    view.unmount();
  });
});
