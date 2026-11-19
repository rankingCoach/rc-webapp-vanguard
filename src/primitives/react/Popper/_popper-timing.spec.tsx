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

it('centres the settled BusinessProfile tooltip on the same reference as MUI', async () => {
  const floatingWidth = 171.1;
  const html = document.documentElement;
  const width = vi.spyOn(html, 'clientWidth', 'get');
  vi.spyOn(html, 'clientHeight', 'get').mockReturnValue(900);
  const getRect = HTMLElement.prototype.getBoundingClientRect;
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    if (this.dataset.testid === 'business-profile-popper') return rect(0, 40, 0, floatingWidth);
    return getRect.call(this);
  });
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return this.dataset.testid === 'business-profile-popper' ? 171 : 0;
  });
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
    return this.dataset.testid === 'business-profile-popper' ? 40 : 0;
  });

  const horizontalOrigin = async (Popper: React.ElementType, center: number, viewport: number) => {
    width.mockReturnValue(viewport);
    const anchor = document.createElement('button');
    document.body.append(anchor);
    anchor.getBoundingClientRect = () => rect(300, 24, center - 12, 24);
    const view = render(
      <Popper open anchorEl={anchor} placement="top" data-testid="business-profile-popper">
        <span>{'Edit business details'}</span>
      </Popper>,
    );
    try {
      await act(async () => {});
      const popper = view.getByTestId('business-profile-popper');
      expect(popper.getAttribute('data-popper-placement')).toBe('top');
      return popper.style.transform.match(/^translate(?:3d)?\(([-\d.]+)px,/)?.[1];
    } finally {
      view.unmount();
      anchor.remove();
    }
  };

  // The centres are diagnostic inputs. The two browser builds still need to report their actual anchor rects.
  for (const [center, viewport, expected] of [[599.8, 1280, '514'], [599.8, 1265, '514'], [591.8, 1280, '506']] as const) {
    expect(await horizontalOrigin(MuiPopper, center, viewport)).toBe(expected);
    expect(await horizontalOrigin(OwnPopper, center, viewport)).toBe(expected);
  }
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

  // Codex review (PopoverModal): MUI Popper portals through Portal, whose content mounts one commit later, so nested
  // overlays register in outer-then-inner order (OverlayStackingService).
  it('portaled content mounts after its siblings, like MUI Portal', () => {
    const go = (Comp: React.ElementType, disablePortal: boolean) => {
      const order: string[] = [];
      const Content = () => {
        useLayoutEffect(() => {
          order.push('content');
        }, []);
        return <div>{'floating'}</div>;
      };
      const Sibling = () => {
        useLayoutEffect(() => {
          order.push('sibling');
        }, []);
        return null;
      };
      const anchor = makeAnchor();
      const view = render(
        <>
          <Comp open anchorEl={anchor} placement="bottom" disablePortal={disablePortal}>
            <Content />
          </Comp>
          <Sibling />
        </>,
      );
      view.unmount();
      anchor.remove();
      return order;
    };
    expect(go(OwnPopper, false)).toEqual(go(MuiPopper, false));
    expect(go(OwnPopper, true)).toEqual(go(MuiPopper, true));
  });
});
