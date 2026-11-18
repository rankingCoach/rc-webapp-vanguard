import { Popper as MuiPopper } from '@mui/material';
import { act, render } from '@testing-library/react';
import React, { useLayoutEffect } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OwnPopper } from './Popper';

/**
 * Differential timing against MUI 9.5 Popper (popper.js 2.11): popper.js positions a new instance and every
 * scroll/resize in a debounced microtask, so a layout change made later in the same commit (a parent's layout effect,
 * a focus move) is picked up. Verifier handoff 10: DropdownMenu opened during load sat 4px above MUI's position.
 */

let anchorTop = 100;
const rect = (top: number, height: number, left = 10, width = 80) =>
  ({
    top,
    left,
    bottom: top + height,
    right: left + width,
    width,
    height,
    x: left,
    y: top,
    toJSON: () => ({}),
  }) as DOMRect;

const makeAnchor = () => {
  const el = document.createElement('button');
  document.body.appendChild(el);
  el.getBoundingClientRect = () => rect(anchorTop, 20);
  return el;
};

/** Moves the anchor in its layout effect, which runs after the child Popper's layout effect in the same commit. */
const MovesAnchorOnMount = ({ children }: { children: React.ReactNode }) => {
  useLayoutEffect(() => {
    anchorTop = 140;
  }, []);
  return <>{children}</>;
};

const transformOf = (container: HTMLElement) =>
  (document.querySelector('[data-testid="floating"]') as HTMLElement | null)?.style.transform ?? container.innerHTML;

const run = async (Comp: React.ElementType, extraProps: Record<string, unknown> = {}) => {
  anchorTop = 100;
  const anchor = makeAnchor();
  const view = render(
    <MovesAnchorOnMount>
      <Comp open anchorEl={anchor} placement="bottom" data-testid="floating" {...extraProps}>
        <div>{'floating'}</div>
      </Comp>
    </MovesAnchorOnMount>,
  );
  await act(async () => {
    await Promise.resolve();
  });
  const afterMount = transformOf(view.container);
  // A scroll on the window (popper's eventListeners) after a move outside React.
  anchorTop = 200;
  await act(async () => {
    window.dispatchEvent(new Event('scroll'));
    await Promise.resolve();
  });
  const afterScroll = transformOf(view.container);
  view.unmount();
  anchor.remove();
  return { afterMount, afterScroll };
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('OwnPopper update timing equals MUI Popper', () => {
  it('positions after the commit, so a later layout effect in the same commit is picked up', async () => {
    const mui = await run(MuiPopper);
    const own = await run(OwnPopper);
    // MUI follows the move made after its layout effect (anchor 100 → 140) and the move before the scroll (→ 200).
    expect([mui.afterMount, mui.afterScroll]).toEqual(['translate(10px, 140px)', 'translate(10px, 200px)']);
    expect(own).toEqual(mui);
  });

  it('with a new modifiers array per render (DropdownMenu), same result', async () => {
    const props = { modifiers: [{ name: 'offset', options: { offset: [0, 20] } }] };
    const mui = await run(MuiPopper, props);
    const own = await run(OwnPopper, props);
    expect(own).toEqual(mui);
  });

  // Codex review (PopoverModal): popper.js debounces scroll/resize updates into a microtask, so a handler registered
  // later in the same event can still move the anchor first.
  it('a scroll handler registered after the popper moves the anchor in the same event', async () => {
    const go = async (Comp: React.ElementType) => {
      anchorTop = 100;
      const anchor = makeAnchor();
      const view = render(
        <Comp open anchorEl={anchor} placement="bottom" data-testid="floating">
          <div>{'floating'}</div>
        </Comp>,
      );
      await act(async () => {
        await Promise.resolve();
      });
      const late = () => {
        anchorTop = 400;
      };
      window.addEventListener('scroll', late);
      await act(async () => {
        window.dispatchEvent(new Event('scroll'));
        await Promise.resolve();
        await Promise.resolve();
      });
      window.removeEventListener('scroll', late);
      const out = transformOf(view.container);
      view.unmount();
      anchor.remove();
      return out;
    };
    expect(await go(OwnPopper)).toBe(await go(MuiPopper));
  });
});
