import { act, render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { PopoverModal } from './PopoverModal';

/** Queue 2.4: PopoverModal renders the own Popper, Backdrop and Portal (own-core markers), inline and portaled. */
describe('PopoverModal on the own core', () => {
  const anchor = () => {
    const el = document.createElement('button');
    document.body.appendChild(el);
    return el;
  };

  it.each([false, true])('renderInPortal=%s: own popper and backdrop', async (renderInPortal) => {
    const view = render(
      <PopoverModal
        isOpen
        anchorEl={anchor()}
        content={<p>{'card'}</p>}
        dimRestOfPage
        renderInPortal={renderInPortal}
      />,
    );
    await act(async () => {
      await Promise.resolve();
    });
    const popper = document.querySelector('[role="tooltip"]');
    const backdrop = document.querySelector('[data-testid="popover-modal-backdrop"]');
    expect(popper?.hasAttribute('data-vg-core')).toBe(true);
    expect(backdrop?.hasAttribute('data-vg-core')).toBe(true);
    expect(backdrop?.getAttribute('data-slot')).toBe('backdrop');
    view.unmount();
  });

  it('centerPopover stays on the own popper (its modifiers are modelled)', async () => {
    const view = render(<PopoverModal isOpen anchorEl={anchor()} content={<p>{'card'}</p>} centerPopover />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(document.querySelector('[role="tooltip"]')?.hasAttribute('data-vg-core')).toBe(true);
    view.unmount();
  });

  it('renders the planner create-event card on first render with centering and a portal', () => {
    const trigger = anchor();
    const view = render(
      <PopoverModal
        anchorEl={trigger}
        centerPopover
        renderInPortal
        disableBackdropClick
        isOpen
        content={<p>{'Create event'}</p>}
        onClose={() => {}}
        zIndex={7}
      />,
    );
    try {
      const card = view.getByText('Create event').closest('[role="tooltip"]');
      expect(card?.parentElement).toBe(document.body);
      expect(card?.hasAttribute('data-vg-core')).toBe(false);
    } finally {
      view.unmount();
      trigger.remove();
    }
  });
});
