import '@testing-library/jest-dom/vitest';

import React from 'react';
import { expect, test } from 'vitest';

import { fireEvent, render, screen, waitFor } from '../../../test-utils/test-utils';
import { Popover } from './Popover';

test('interactive popper keeps public classes and stops intercepting pointers during exit', async () => {
  render(
    <Popover interactive message="Closing content">
      <button>trigger</button>
    </Popover>,
  );
  const trigger = screen.getByRole('button', { name: 'trigger' });
  fireEvent.mouseOver(trigger);
  const popper = await screen.findByRole('tooltip');
  expect(popper).toHaveClass('MuiTooltip-popper', 'vanguard-popover');
  await waitFor(() => expect(getComputedStyle(popper).pointerEvents).toBe('auto'));
  fireEvent.mouseLeave(trigger.parentElement!);
  expect(popper).toBeInTheDocument();
  expect(getComputedStyle(popper).pointerEvents).toBe('none');
  await waitFor(() => expect(popper).not.toBeInTheDocument());
});
