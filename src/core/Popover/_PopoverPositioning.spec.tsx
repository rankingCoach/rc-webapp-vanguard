import '@testing-library/jest-dom/vitest';

import { OverlayStackingService } from '@vanguard/OverlayStacking/OverlayStackingService';
import React from 'react';
import { afterEach, describe, expect, test } from 'vitest';

import { act, fireEvent, render, screen, waitFor } from '../../../test-utils/test-utils';
import { Popover } from './Popover';

// Inline element (not a component) so MUI can attach its ref and event handlers to it.
const trigger = (
  <span tabIndex={0} data-testid="trigger" aria-label="3 Accounts">
    trigger
  </span>
);

describe('Popover: fixedPosition / openOnFocus / describeChild', () => {
  afterEach(() => OverlayStackingService.__resetForTests());

  test('openOnFocus opens on keyboard focus and closes on blur', async () => {
    render(
      <Popover message={'1, 2, 3'} openOnFocus wrapChildren={false}>
        {trigger}
      </Popover>,
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    await act(async () => fireEvent.focus(screen.getByTestId('trigger')));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('1, 2, 3');
    await act(async () => fireEvent.blur(screen.getByTestId('trigger')));
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  test('without openOnFocus, focus does not open (legacy behaviour)', async () => {
    render(
      <Popover message={'hint'} wrapChildren={false}>
        {trigger}
      </Popover>,
    );
    await act(async () => fireEvent.focus(screen.getByTestId('trigger')));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  test('describeChild keeps the child label and links the tooltip as description', async () => {
    render(
      <Popover message={'1, 2, 3'} describeChild wrapChildren={false}>
        {trigger}
      </Popover>,
    );
    await act(async () => fireEvent.mouseEnter(screen.getByTestId('trigger')));
    const tooltip = await screen.findByRole('tooltip');
    expect(screen.getByTestId('trigger')).toHaveAttribute('aria-label', '3 Accounts');
    expect(screen.getByTestId('trigger')).toHaveAttribute('aria-describedby', tooltip.id);
  });

  test('fixedPosition positions the popper with position: fixed', async () => {
    render(
      <Popover message={'info'} fixedPosition wrapChildren={false}>
        {trigger}
      </Popover>,
    );
    await act(async () => fireEvent.mouseEnter(screen.getByTestId('trigger')));
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip.style.position).toBe('fixed');
  });

  test('default popper keeps absolute positioning', async () => {
    render(
      <Popover message={'info'} wrapChildren={false}>
        {trigger}
      </Popover>,
    );
    await act(async () => fireEvent.mouseEnter(screen.getByTestId('trigger')));
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip.style.position).toBe('absolute');
  });
});
