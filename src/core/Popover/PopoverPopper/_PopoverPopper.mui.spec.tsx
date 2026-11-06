/**
 * MUI contract (characterization) spec for PopoverPopper (thin MUI Popper wrapper used as Tooltip PopperComponent).
 *
 * Locks CURRENT behaviour on MUI v5.16 so the MUI v6/v7/v9 bumps go red where MUI changed behaviour.
 * Only `vanguard-popover` is asserted (PopoverPopper.tsx:18, PopoverPopper.scss:2); MUI's own Popper classes are not.
 */
import '@testing-library/jest-dom/vitest';

import { PopoverPopper } from '@vanguard/Popover/PopoverPopper/PopoverPopper';
import React from 'react';
import { afterEach, describe, expect, test } from 'vitest';

import { render, screen, waitFor } from '../../../../test-utils/test-utils';

const anchors: HTMLElement[] = [];
const makeAnchor = () => {
  const anchor = document.createElement('div');
  document.body.appendChild(anchor);
  anchors.push(anchor);
  return anchor;
};

describe('PopoverPopper (MUI Popper) contract', () => {
  afterEach(() => {
    anchors.splice(0).forEach((anchor) => { anchor.remove(); });
  });

  test('open: portals to body with role="tooltip" and class "vanguard-popover"', () => {
    const { container } = render(
      <PopoverPopper open anchorEl={makeAnchor()}>
        <span>{'popper content'}</span>
      </PopoverPopper>,
    );

    const popper = screen.getByRole('tooltip');
    expect(popper.parentElement).toBe(document.body);
    expect(container.contains(popper)).toBe(false);
    expect(popper).toHaveClass('vanguard-popover');
    expect(popper).toHaveTextContent('popper content');
  });

  test('className is appended after "vanguard-popover"', () => {
    render(
      <PopoverPopper open anchorEl={makeAnchor()} className={'extra another'}>
        <span>{'x'}</span>
      </PopoverPopper>,
    );

    expect(screen.getByRole('tooltip')).toHaveClass('vanguard-popover', 'extra', 'another');
  });

  test('closed: nothing rendered (no keepMounted)', () => {
    render(
      <PopoverPopper open={false} anchorEl={makeAnchor()}>
        <span>{'x'}</span>
      </PopoverPopper>,
    );

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  test('keepMounted + closed: mounted but display:none', () => {
    render(
      <PopoverPopper open={false} keepMounted anchorEl={makeAnchor()}>
        <span>{'x'}</span>
      </PopoverPopper>,
    );

    const popper = screen.getByRole('tooltip', { hidden: true });
    expect(popper.style.display).toBe('none');
  });

  test('passthrough: placement, style, id, disablePortal reach the MUI Popper', async () => {
    render(
      <div data-testid={'host'}>
        <PopoverPopper
          open
          anchorEl={makeAnchor()}
          placement={'left'}
          style={{ zIndex: 1234 }}
          id={'pp-id'}
          disablePortal
        >
          <span>{'x'}</span>
        </PopoverPopper>
      </div>,
    );

    const popper = screen.getByRole('tooltip');
    expect(screen.getByTestId('host')).toContainElement(popper);
    expect(popper.id).toBe('pp-id');
    expect(popper.style.zIndex).toBe('1234');
    await waitFor(() => expect(popper).toHaveAttribute('data-popper-placement', 'left'));
  });

  test('render-prop children receive TransitionProps when transition is set', () => {
    render(
      <PopoverPopper open transition anchorEl={makeAnchor()}>
        {({ TransitionProps }) => <span data-testid={'tp'}>{TransitionProps ? 'has-transition' : 'none'}</span>}
      </PopoverPopper>,
    );

    expect(screen.getByTestId('tp')).toHaveTextContent('has-transition');
  });

  test('unmount leaves no popper in body', () => {
    const { unmount } = render(
      <PopoverPopper open anchorEl={makeAnchor()}>
        <span>{'x'}</span>
      </PopoverPopper>,
    );

    unmount();

    expect(document.querySelector('.vanguard-popover')).toBeNull();
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
  });
});
