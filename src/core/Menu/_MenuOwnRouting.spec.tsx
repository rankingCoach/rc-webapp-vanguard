import { Menu as MuiMenu, MenuItem as MuiMenuItem } from '@mui/material';
import RtlProvider from '@mui/system/RtlProvider';
import { act, render } from '@testing-library/react';
import { MenuItem } from '@vanguard/MenuItem/MenuItem';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { Menu } from './Menu';

/**
 * Codex review (handoff 11): the own Menu path is taken only when every prop, slot content and item it would render is
 * modelled; anything else keeps MUI's Menu. And where the own path is taken, focus equals MUI's.
 */
const anchor = () => {
  const el = document.createElement('button');
  document.body.appendChild(el);
  return el;
};

const ownRoot = () => document.querySelector('[data-slot="menu-popup"]');
const muiRoot = () => document.querySelector('.MuiMenu-root:not([data-slot])');

const renderMenu = (props: Record<string, unknown>, children?: React.ReactNode) => {
  const view = render(
    <Menu open anchorEl={anchor()} onClose={() => undefined} {...props}>
      {children}
    </Menu>,
  );
  return view;
};

describe('Menu routing to the own core', () => {
  it('takes the own path for the rc-webapp shape (PaperProps className, items)', () => {
    const view = renderMenu({ PaperProps: { className: 'paper-x' }, items: [{ id: 'a', text: 'A' }] });
    expect(ownRoot()).not.toBeNull();
    view.unmount();
  });

  it('keeps MUI for unmodelled paper slot content (elevation)', () => {
    const view = renderMenu({ slotProps: { paper: { elevation: 0 } }, items: [{ id: 'a', text: 'A' }] });
    expect(ownRoot()).toBeNull();
    expect(muiRoot()).not.toBeNull();
    view.unmount();
  });

  it('keeps MUI for unmodelled list slot content (disablePadding)', () => {
    const view = renderMenu({ slotProps: { list: { disablePadding: true } }, items: [{ id: 'a', text: 'A' }] });
    expect(ownRoot()).toBeNull();
    view.unmount();
  });

  it('keeps MUI when an item renders as another component (component="a", href)', () => {
    const view = renderMenu({ items: [{ id: 'a', text: 'Settings', component: 'a', href: '/settings' }] });
    expect(ownRoot()).toBeNull();
    expect(document.querySelector('a[href="/settings"]')).not.toBeNull();
    view.unmount();
  });

  it('keeps MUI when a child MenuItem renders as another component', () => {
    const view = renderMenu(
      {},
      <MenuItem id="a" text="Settings" {...({ component: 'a', href: '/s' } as Record<string, unknown>)} />,
    );
    expect(ownRoot()).toBeNull();
    expect(document.querySelector('a[href="/s"]')).not.toBeNull();
    view.unmount();
  });

  it('keeps MUI in an RTL context (MUI flips the default origins)', () => {
    const view = render(
      <RtlProvider value>
        <Menu open anchorEl={anchor()} onClose={() => undefined} items={[{ id: 'a', text: 'A' }]} />
      </RtlProvider>,
    );
    expect(ownRoot()).toBeNull();
    view.unmount();
  });
});

describe('own Menu focus equals MUI Menu', () => {
  const focused = async (node: React.ReactElement) => {
    const view = render(node);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    const el = document.activeElement as HTMLElement;
    const out = { role: el.getAttribute('role'), text: el.textContent };
    view.unmount();
    return out;
  };

  it('disableAutoFocusItem focuses the list', async () => {
    const mui = await focused(
      <MuiMenu open anchorEl={anchor()} disableAutoFocusItem>
        <MuiMenuItem>{'A'}</MuiMenuItem>
      </MuiMenu>,
    );
    const own = await focused(
      <Menu open anchorEl={anchor()} onClose={() => undefined} disableAutoFocusItem>
        <MenuItem id="a" text="A" />
      </Menu>,
    );
    expect(ownRoot).toBeDefined();
    expect(own.role).toBe(mui.role);
  });

  it('an empty menu focuses the list', async () => {
    const mui = await focused(
      <MuiMenu open anchorEl={anchor()}>
        {[]}
      </MuiMenu>,
    );
    const own = await focused(<Menu open anchorEl={anchor()} onClose={() => undefined} items={[]} />);
    expect(own.role).toBe(mui.role);
  });

  it('MenuItem role={undefined} keeps the menuitem role inside the own host', () => {
    const view = renderMenu({}, <MenuItem id="a" text="A" role={undefined} />);
    expect(ownRoot()).not.toBeNull();
    expect(document.querySelector('[data-slot="menu-popup"] [role="menuitem"]')).not.toBeNull();
    view.unmount();
  });
});
