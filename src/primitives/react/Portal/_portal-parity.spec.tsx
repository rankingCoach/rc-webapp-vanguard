import MuiPortal from '@mui/material/Portal';
import { render } from '@testing-library/react';
import React, { useLayoutEffect } from 'react';
import { describe, expect, it } from 'vitest';
import { Portal } from './Portal';

/**
 * Differential parity, jsdom: MUI 9.5 Portal vs the own Portal. The children mount one commit after the Portal (MUI
 * sets the mount node in a layout effect), they land in document.body or the container, and `disablePortal` renders
 * them in place.
 */
type Impl = typeof MuiPortal | typeof Portal;

const go = (Impl: Impl, props: Record<string, unknown>) => {
  const order: string[] = [];
  const Probe = ({ name }: { name: string }) => {
    useLayoutEffect(() => {
      order.push(`${name} layout, in body: ${Boolean(document.body.querySelector('[data-probe]'))}`);
    });
    return <span data-probe>{name}</span>;
  };
  const Sibling = () => {
    useLayoutEffect(() => {
      order.push(`sibling layout, portal child present: ${Boolean(document.querySelector('[data-probe]'))}`);
    }, []);
    return null;
  };
  const view = render(
    <div data-host>
      <Impl {...(props as object)}>
        <Probe name="child" />
      </Impl>
      <Sibling />
    </div>,
  );
  const where = document.querySelector('[data-probe]')?.parentElement;
  const out = {
    order,
    inHost: Boolean(where?.closest('[data-host]')),
    parentTag: where?.tagName,
    parentIsBody: where === document.body,
  };
  view.unmount();
  view.container.remove();
  return out;
};

describe('own Portal equals MUI Portal', () => {
  it('portals into document.body one commit later', () => {
    expect(go(Portal, {})).toEqual(go(MuiPortal, {}));
  });

  it('disablePortal renders in place', () => {
    expect(go(Portal, { disablePortal: true })).toEqual(go(MuiPortal, { disablePortal: true }));
  });

  it('container', () => {
    const container = document.createElement('section');
    document.body.appendChild(container);
    expect(go(Portal, { container })).toEqual(go(MuiPortal, { container }));
    container.remove();
  });
});
