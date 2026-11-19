import { act, fireEvent, render } from '@testing-library/react';
import React, { useRef, useState } from 'react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { defaultLayerStack } from '../core/layer-stack';
import { defaultModalManager } from '../core/modal-manager';
import { Backdrop } from './Backdrop/Backdrop';
import { ButtonBase } from './ButtonBase/ButtonBase';
import { ClickAway } from './ClickAway/ClickAway';
import { MenuOption } from './Menu/MenuOption';
import { MenuPopup } from './Menu/MenuPopup';
import { OwnPopper } from './Popper/Popper';
import { Portal } from './Portal/Portal';
import { InputTextField } from './TextField/InputTextField';
import { Tooltip } from './Tooltip/Tooltip';
import { Fade } from './Transitions/Fade';

/**
 * Tier P groundwork (plan §30.3): every own-core primitive that adds a listener, timer, observer, portal node, body
 * style, sibling aria-hidden, modal-manager entry or layer must leave nothing behind after close and unmount.
 */
type Key = string;
const live = new Map<Key, number>();
const keyOf = (target: EventTarget, type: string, fn: unknown) => {
  const id = (fn as { __leakId?: number }).__leakId ?? Math.random();
  (fn as { __leakId?: number }).__leakId = id;
  const name = target === window ? 'window' : target === document ? 'document' : ((target as Node).nodeName ?? 'other');
  return `${name}:${type}:${id}`;
};
const origAdd = EventTarget.prototype.addEventListener;
const origRemove = EventTarget.prototype.removeEventListener;
// jsdom's window does not route add/removeEventListener through EventTarget.prototype: patch it separately.
const winAdd = window.addEventListener;
const winRemove = window.removeEventListener;

class FakeObserver {
  static active = new Set<FakeObserver>();
  observe() {
    FakeObserver.active.add(this);
  }
  unobserve() {}
  disconnect() {
    FakeObserver.active.delete(this);
  }
}

const baseline = () => ({
  bodyChildren: document.body.children.length,
  bodyStyle: document.body.getAttribute('style'),
  ariaHidden: Array.from(document.body.children).filter((c) => c.hasAttribute('aria-hidden')).length,
});

const leftovers = (before: ReturnType<typeof baseline>) => ({
  windowDocumentListeners: [...live.entries()]
    .filter(([k, n]) => n > 0 && /^(window|document):/.test(k))
    .map(([k]) => k.split(':').slice(0, 2).join(':')),
  timers: vi.getTimerCount(),
  observers: FakeObserver.active.size,
  layers: defaultLayerStack.size(),
  modals: defaultModalManager.modalCount(),
  bodyChildren: document.body.children.length - before.bodyChildren,
  bodyStyle: document.body.getAttribute('style') === before.bodyStyle,
  ariaHidden:
    Array.from(document.body.children).filter((c) => c.hasAttribute('aria-hidden')).length - before.ariaHidden,
});

const CLEAN = {
  windowDocumentListeners: [],
  timers: 0,
  observers: 0,
  layers: 0,
  modals: 0,
  bodyChildren: 0,
  bodyStyle: true,
  ariaHidden: 0,
};

// Once-per-document globals (React's selectionchange listener, the focus-visible modality listeners) are installed
// on first use and intentionally never removed; warm every primitive up once before tracking starts.
beforeAll(() => {
  const anchor = document.createElement('button');
  document.body.appendChild(anchor);
  const view = render(
    <>
      <ButtonBase>{'warm'}</ButtonBase>
      <ClickAway onClickAway={() => undefined}>
        <div>{'warm'}</div>
      </ClickAway>
      <MenuPopup open anchorEl={anchor} onClose={() => undefined}>
        <MenuOption role="menuitem">{'warm'}</MenuOption>
      </MenuPopup>
      <InputTextField id="warm" multiline />
    </>,
  );
  const warmButton = view.container.querySelector('button') as HTMLElement;
  fireEvent.mouseDown(warmButton);
  fireEvent.mouseUp(warmButton);
  fireEvent.mouseOver(warmButton);
  view.unmount();
  view.container.remove();
  anchor.remove();
});

beforeEach(() => {
  vi.useFakeTimers();
  live.clear();
  vi.stubGlobal('ResizeObserver', FakeObserver);
  EventTarget.prototype.addEventListener = function (type: string, fn: unknown, opts?: unknown) {
    if (fn) live.set(keyOf(this, type, fn), (live.get(keyOf(this, type, fn)) ?? 0) + 1);
    return origAdd.call(this, type, fn as EventListener, opts as AddEventListenerOptions);
  };
  EventTarget.prototype.removeEventListener = function (type: string, fn: unknown, opts?: unknown) {
    if (fn) live.set(keyOf(this, type, fn), Math.max(0, (live.get(keyOf(this, type, fn)) ?? 0) - 1));
    return origRemove.call(this, type, fn as EventListener, opts as EventListenerOptions);
  };
  window.addEventListener = ((type: string, fn: unknown, opts?: unknown) => {
    if (fn) live.set(keyOf(window, type, fn), (live.get(keyOf(window, type, fn)) ?? 0) + 1);
    return winAdd.call(window, type, fn as EventListener, opts as AddEventListenerOptions);
  }) as typeof window.addEventListener;
  window.removeEventListener = ((type: string, fn: unknown, opts?: unknown) => {
    if (fn) live.set(keyOf(window, type, fn), Math.max(0, (live.get(keyOf(window, type, fn)) ?? 0) - 1));
    return winRemove.call(window, type, fn as EventListener, opts as EventListenerOptions);
  }) as typeof window.removeEventListener;
});
afterEach(() => {
  EventTarget.prototype.addEventListener = origAdd;
  EventTarget.prototype.removeEventListener = origRemove;
  window.addEventListener = winAdd;
  window.removeEventListener = winRemove;
  vi.unstubAllGlobals();
  vi.useRealTimers();
  FakeObserver.active.clear();
});

const done = (view: { unmount: () => void; container: HTMLElement }) => {
  view.unmount();
  view.container.remove();
};

const settle = () =>
  act(() => {
    vi.advanceTimersByTime(2000);
  });

const TooltipHarness = ({ open }: { open: boolean }) => (
  <Tooltip open={open} title={<b>{'tip'}</b>} arrow placement="top">
    <span>{'trigger'}</span>
  </Tooltip>
);

const MenuPopupHarness = ({ open }: { open: boolean }) => {
  const anchor = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button ref={anchor} type="button">
        {'anchor'}
      </button>
      <MenuPopup open={open} anchorEl={anchor.current} onClose={() => undefined}>
        <MenuOption role="menuitem">{'One'}</MenuOption>
      </MenuPopup>
    </>
  );
};

const PopperHarness = ({ open }: { open: boolean }) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return (
    <div style={{ overflow: 'auto' }}>
      <button ref={setAnchor} type="button">
        {'anchor'}
      </button>
      {anchor ? (
        <OwnPopper open={open} anchorEl={anchor}>
          {'content'}
        </OwnPopper>
      ) : null}
    </div>
  );
};

const FadePopperHarness = ({ open }: { open: boolean }) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return (
    <>
      <button ref={setAnchor} type="button">
        {'anchor'}
      </button>
      {anchor ? (
        <OwnPopper open={open} anchorEl={anchor} transition>
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={250}>
              <div>{'content'}</div>
            </Fade>
          )}
        </OwnPopper>
      ) : null}
    </>
  );
};

describe('own-core resources are released', () => {
  it('ButtonBase ripple (press, release, unmount)', () => {
    const before = baseline();
    const view = render(<ButtonBase>{'press'}</ButtonBase>);
    const button = view.getByRole('button');
    act(() => {
      fireEvent.mouseDown(button, { clientX: 5, clientY: 5 });
      fireEvent.mouseUp(button);
    });
    done(view);
    settle();
    expect(leftovers(before)).toEqual(CLEAN);
  });

  it('MenuPopup (ModalHost: manager entry, scroll lock, aria-hidden, layer, resize listener, exit timer)', () => {
    const before = baseline();
    const view = render(<MenuPopupHarness open={false} />);
    view.rerender(<MenuPopupHarness open />);
    settle();
    view.rerender(<MenuPopupHarness open={false} />);
    settle();
    done(view);
    settle();
    expect(leftovers(before)).toEqual(CLEAN);
  });

  it('OwnPopper (scroll-parent and resize listeners, portal node)', () => {
    const before = baseline();
    const view = render(<PopperHarness open />);
    settle();
    view.rerender(<PopperHarness open={false} />);
    done(view);
    settle();
    expect(leftovers(before)).toEqual(CLEAN);
  });

  it('OwnPopper with a Fade transition (keepMounted off, exit completes)', () => {
    const before = baseline();
    const view = render(<FadePopperHarness open />);
    settle();
    view.rerender(<FadePopperHarness open={false} />);
    settle();
    done(view);
    settle();
    expect(leftovers(before)).toEqual(CLEAN);
  });

  it('Tooltip (popper listeners and observer, Grow exit, touch timers, body user-select)', () => {
    const before = baseline();
    const vendor = () => (document.body.style as unknown as { WebkitUserSelect?: string }).WebkitUserSelect;
    // Browsers report '' for an unset style property; jsdom's vendor-prefixed expando starts undefined (MUI's
    // restore logic, ported as-is, skips an undefined previous value).
    (document.body.style as unknown as { WebkitUserSelect?: string }).WebkitUserSelect = '';
    const userSelectBefore = vendor();
    const view = render(<TooltipHarness open={false} />);
    view.rerender(<TooltipHarness open />);
    settle();
    const trigger = view.getByText('trigger');
    // Long press pending (700 ms timer, body user-select none), then unmount mid-press.
    fireEvent.touchStart(trigger);
    fireEvent.touchEnd(trigger);
    fireEvent.touchStart(trigger);
    view.rerender(<TooltipHarness open={false} />);
    done(view);
    settle();
    expect(leftovers(before)).toEqual(CLEAN);
    expect(vendor()).toBe(userSelectBefore);
  });

  it('OwnPopper font-set listener: only while open, removed on close and unmount; absent font set is a no-op', () => {
    const fonts = new EventTarget();
    const live = new Set<unknown>();
    const add = fonts.addEventListener.bind(fonts);
    const remove = fonts.removeEventListener.bind(fonts);
    fonts.addEventListener = ((type: string, fn: EventListener) => {
      live.add(`${type}`);
      add(type, fn);
    }) as typeof fonts.addEventListener;
    fonts.removeEventListener = ((type: string, fn: EventListener) => {
      live.delete(`${type}`);
      remove(type, fn);
    }) as typeof fonts.removeEventListener;
    Object.defineProperty(document, 'fonts', { configurable: true, value: fonts });
    try {
      const view = render(<PopperHarness open={false} />);
      settle();
      expect([...live]).toEqual([]);
      view.rerender(<PopperHarness open />);
      settle();
      expect([...live]).toEqual(['loadingdone']);
      view.rerender(<PopperHarness open={false} />);
      settle();
      expect([...live]).toEqual([]);
      view.rerender(<PopperHarness open />);
      settle();
      done(view);
      settle();
      expect([...live]).toEqual([]);
    } finally {
      delete (document as unknown as { fonts?: unknown }).fonts;
    }
    // jsdom has no font set: opening a popper must not throw.
    const view = render(<PopperHarness open />);
    settle();
    done(view);
    settle();
  });

  it('Backdrop in a Portal (Fade timers, portal node), closed mid-exit then unmounted', () => {
    const before = baseline();
    const tree = (open: boolean) => (
      <Portal>
        <Backdrop open={open} zIndex={1031} onMouseDown={() => undefined} />
      </Portal>
    );
    const view = render(tree(true));
    settle();
    view.rerender(tree(false));
    act(() => {
      vi.advanceTimersByTime(50);
    });
    done(view);
    settle();
    expect(leftovers(before)).toEqual(CLEAN);
  });

  it('ClickAway (document listeners, activation timer, layer)', () => {
    const before = baseline();
    const view = render(
      <ClickAway onClickAway={() => undefined}>
        <div>{'inside'}</div>
      </ClickAway>,
    );
    settle();
    done(view);
    settle();
    expect(leftovers(before)).toEqual(CLEAN);
  });

  it('ClickAway unmounted before activation (timer cleared)', () => {
    const before = baseline();
    const view = render(
      <ClickAway onClickAway={() => undefined}>
        <div>{'inside'}</div>
      </ClickAway>,
    );
    done(view);
    expect(leftovers(before)).toEqual(CLEAN);
  });

  it('InputTextField multiline (TextareaAutosize resize listener, ResizeObserver, rAF)', () => {
    const before = baseline();
    const view = render(<InputTextField id="t" multiline minRows={2} maxRows={4} defaultValue={'a\nb\nc'} />);
    settle();
    fireEvent.change(view.container.querySelector('textarea') as HTMLTextAreaElement, { target: { value: 'x' } });
    done(view);
    settle();
    expect(leftovers(before)).toEqual(CLEAN);
  });
});
