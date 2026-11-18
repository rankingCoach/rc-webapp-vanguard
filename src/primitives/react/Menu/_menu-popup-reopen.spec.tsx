import { Menu as MuiMenu, MenuItem as MuiMenuItem } from '@mui/material';
import { act, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MenuOption } from './MenuOption';
import { MenuPopup } from './MenuPopup';

/** Review finding (Codex, handoff 10): closing and reopening before the exit transition ends must focus an item. */
type Kind = 'mui' | 'own';
const Probe = ({ kind, open, anchor }: { kind: Kind; open: boolean; anchor: HTMLElement }) =>
  kind === 'mui' ? (
    <MuiMenu open={open} anchorEl={anchor} onClose={() => undefined}>
      <MuiMenuItem>{'One'}</MuiMenuItem>
      <MuiMenuItem>{'Two'}</MuiMenuItem>
    </MuiMenu>
  ) : (
    <MenuPopup open={open} anchorEl={anchor} onClose={() => undefined}>
      <MenuOption role="menuitem">{'One'}</MenuOption>
      <MenuOption role="menuitem">{'Two'}</MenuOption>
    </MenuPopup>
  );

const focusedText = () => (document.activeElement as HTMLElement | null)?.textContent ?? null;

describe('MenuPopup reopen during exit', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  it('matches MUI Menu', () => {
    const go = (kind: Kind) => {
      const anchor = document.createElement('button');
      document.body.appendChild(anchor);
      const view = render(<Probe kind={kind} open anchor={anchor} />);
      act(() => vi.advanceTimersByTime(400));
      const opened = focusedText();
      view.rerender(<Probe kind={kind} open={false} anchor={anchor} />);
      act(() => vi.advanceTimersByTime(50));
      view.rerender(<Probe kind={kind} open anchor={anchor} />);
      act(() => vi.advanceTimersByTime(400));
      const reopened = focusedText();
      view.unmount();
      anchor.remove();
      return { opened, reopened };
    };
    const mui = go('mui');
    expect(mui).toEqual({ opened: 'One', reopened: 'One' });
    expect(go('own')).toEqual(mui);
  });
});
