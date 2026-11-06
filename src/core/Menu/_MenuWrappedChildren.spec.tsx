import '@testing-library/jest-dom/vitest';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MenuItem } from '@vanguard/MenuItem/MenuItem';
import { Render } from '@vanguard/Render/Render';
import React from 'react';
import { afterEach, expect, test, vi } from 'vitest';

import { Menu } from './Menu';

const anchors: HTMLElement[] = [];
afterEach(() => {
  for (const anchor of anchors.splice(0)) anchor.remove();
});

test('Menu supports conditional Render-wrapped and plain MenuItem children with focus and activation', async () => {
  const user = userEvent.setup();
  const trigger = document.createElement('button');
  trigger.getBoundingClientRect = () => new DOMRect(10, 10, 80, 32);
  document.body.appendChild(trigger);
  anchors.push(trigger);
  const plain = vi.fn();
  const wrapped = vi.fn();
  const hidden = vi.fn();
  render(
    <Menu open anchorEl={trigger} transitionDuration={0}>
      <MenuItem onClick={plain}>Plain</MenuItem>
      <Render if>
        <MenuItem onClick={wrapped}>Wrapped</MenuItem>
      </Render>
      <Render if={false}>
        <MenuItem onClick={hidden}>Hidden</MenuItem>
      </Render>
      <MenuItem>Last</MenuItem>
    </Menu>,
  );
  const first = await screen.findByRole('menuitem', { name: 'Plain' });
  const second = screen.getByRole('menuitem', { name: 'Wrapped' });
  const last = screen.getByRole('menuitem', { name: 'Last' });
  expect(screen.getAllByRole('menuitem')).toEqual([first, second, last]);
  expect(screen.queryByRole('menuitem', { name: 'Hidden' })).not.toBeInTheDocument();
  await waitFor(() => expect(first).toHaveFocus());
  await user.keyboard('{ArrowDown}');
  expect(second).toHaveFocus();
  await user.keyboard('{ArrowDown}');
  expect(last).toHaveFocus();
  await user.keyboard('{ArrowUp}');
  expect(second).toHaveFocus();
  await user.keyboard('{Enter}');
  expect(wrapped).toHaveBeenCalledTimes(1);
  await user.click(first);
  expect(plain).toHaveBeenCalledTimes(1);
  expect(hidden).not.toHaveBeenCalled();
});
