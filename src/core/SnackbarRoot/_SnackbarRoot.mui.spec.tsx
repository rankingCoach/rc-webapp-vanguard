import { PUB_SUB_EVENTS, pubSubService } from '@helpers/pub-sub';
import { SnackbarRoot } from '@vanguard/SnackbarRoot/SnackbarRoot';
import { snackbarService } from '@vanguard/SnackbarRoot/SnackBarService';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { act, fireEvent, render, screen } from '../../../test-utils/test-utils';

/**
 * MUI contract for SnackbarRoot: the app-wide toast host (MUI v5 `Snackbar` + `Slide` via `TransitionComponent`,
 * anchored top/right, autoHideDuration 3000, onClose for every MUI reason). v9 removes `TransitionComponent`
 * (-> `slots.transition`). Real-browser slide position is pinned in `_SnackbarRootMuiContract.stories.tsx`.
 */

/**
 * The ONLY place that touches pubSubService's private state.
 * pubSubService (src/helpers/pub-sub.ts) keeps one ReplaySubject per event for the lifetime of the page and has no
 * public reset/unsubscribe-all API ($pub/$sub only), so without this every test would replay the previous tests'
 * messages into its SnackbarRoot. `reset()` drops the snackbar subjects (beforeEach and afterEach);
 * `openObserverCount()` reads the subscriber count for the unsubscribe test.
 */
const pubSubTestAccess = (() => {
  type Subjects = Record<string, { observers?: unknown[] } | undefined>;
  const events = () => (pubSubService as unknown as { events: Subjects }).events;
  return {
    reset: () => {
      delete events()[PUB_SUB_EVENTS.reactSnackbarOpen];
      delete events()[PUB_SUB_EVENTS.reactSnackbarClose];
    },
    openObserverCount: () => events()[PUB_SUB_EVENTS.reactSnackbarOpen]?.observers?.length ?? 0,
  };
})();

// The MUI Snackbar root is located through Vanguard's own wrapper (`ComponentContainer className="Snackbar-container"`
// in Snackbar.tsx), not through MUI's `.MuiSnackbar-root` class, which no Vanguard production code depends on.
const getRoot = () => document.querySelector('.Snackbar-container > *') as HTMLElement | null;

/** The root opens in a setTimeout(0) after the publish */
const flushOpen = () => act(() => vi.advanceTimersByTime(0));

describe('SnackbarRoot (MUI Snackbar + Slide contract)', () => {
  beforeEach(() => {
    pubSubTestAccess.reset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    pubSubTestAccess.reset();
  });

  it('renders an empty <section> and no MUI snackbar until a message is published', () => {
    const { container } = render(<SnackbarRoot />);

    expect(container.querySelector('section')).not.toBeNull();
    expect(getRoot()).toBeNull();
  });

  it('opens on the next tick after snackbarService.open, anchored top/right, with the LineAlert message', () => {
    render(<SnackbarRoot />);

    act(() => {
      snackbarService.openSuccessSnackbar('Saved!');
    });
    expect(getRoot()).toBeNull();
    flushOpen();

    const root = getRoot()!;
    expect(root.textContent).toContain('Saved!');
    // top/right anchor (jsdom evaluates the xs rules: 8px from the top, pushed to the right)
    const style = getComputedStyle(root);
    expect(style.position).toBe('fixed');
    expect(style.top).toBe('8px');
    expect(style.justifyContent).toBe('flex-end');
    expect(screen.queryByRole('alert')).toBeNull(); // children, not `message`: MUI adds no alert role
  });

  it.each([
    ['openSuccessSnackbar', 'success'],
    ['openErrorSnackbar', 'danger'],
    ['openWarningSnackbar', 'warning'],
  ] as const)('%s renders the %s LineAlert', (method, type) => {
    render(<SnackbarRoot />);

    act(() => {
      snackbarService[method]('Typed');
    });
    flushOpen();

    expect(getRoot()!.querySelector(`[class*="${type}"]`)).not.toBeNull();
  });

  it('enters with the left Slide: transform none + transform transition while entering', () => {
    render(<SnackbarRoot />);

    act(() => {
      snackbarService.openSuccessSnackbar('Slide');
    });
    flushOpen();

    const slid = getRoot()!.firstElementChild as HTMLElement;
    expect(slid.style.transform).toBe('none');
    expect(slid.style.transition).toContain('transform');
    expect(slid.style.visibility).toBe('');
  });

  it("closes after autoHideDuration 3000 and calls the caller's onClose once", () => {
    const onClose = vi.fn();
    render(<SnackbarRoot />);
    act(() => {
      snackbarService.openSuccessSnackbar('Bye', onClose);
    });
    flushOpen();

    act(() => vi.advanceTimersByTime(2999));
    expect(onClose).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClose.mock.calls[0]).toEqual([]);

    // Slide exits to the side, then MUI unmounts the root
    expect((getRoot()!.firstElementChild as HTMLElement).style.transform.startsWith('translateX(')).toBe(true);
    act(() => vi.advanceTimersByTime(1000));
    expect(getRoot()).toBeNull();
  });

  // CURRENT BEHAVIOUR (suspected bug): onClose ignores MUI's reason, so a click anywhere on the page
  // ('clickaway') dismisses the toast and runs the caller's onClose, same as Escape.
  it('[bug-lock] a clickaway closes the toast and calls onClose', () => {
    // Baseline characterization: not a promised contract.
    const onClose = vi.fn();
    render(
      <>
        <button>{'elsewhere'}</button>
        <SnackbarRoot />
      </>,
    );
    act(() => {
      snackbarService.openSuccessSnackbar('Click away', onClose);
    });
    flushOpen();
    act(() => vi.advanceTimersByTime(1)); // ClickAwayListener arms one macrotask after mount

    fireEvent.click(screen.getByText('elsewhere'));

    expect(onClose).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(1000));
    expect(getRoot()).toBeNull();
  });

  it('Escape closes the toast and calls onClose', () => {
    const onClose = vi.fn();
    render(<SnackbarRoot />);
    act(() => {
      snackbarService.openSuccessSnackbar('Esc', onClose);
    });
    flushOpen();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(1000));
    expect(getRoot()).toBeNull();
  });

  it('works without an onClose callback', () => {
    render(<SnackbarRoot />);
    act(() => {
      snackbarService.openSuccessSnackbar('No callback');
    });
    flushOpen();

    fireEvent.keyDown(document, { key: 'Escape' });
    act(() => vi.advanceTimersByTime(1000));

    expect(getRoot()).toBeNull();
  });

  it('closeEv closes the toast without calling onClose', () => {
    const onClose = vi.fn();
    render(<SnackbarRoot />);
    act(() => {
      snackbarService.openSuccessSnackbar('Closing', onClose);
    });
    flushOpen();

    act(() => snackbarService.closeEv('any-id'));
    act(() => vi.advanceTimersByTime(1000));

    expect(getRoot()).toBeNull();
    expect(onClose).not.toHaveBeenCalled();
  });

  describe('queue / stack behaviour', () => {
    // CURRENT BEHAVIOUR (suspected bug): there is no queue. A second message replaces the first one in place
    // (one MUI Snackbar), and the first message's onClose is dropped and never called.
    it('[bug-lock] a second message replaces the first; only one toast exists; the first onClose is never called', () => {
      // Baseline characterization: not a promised contract.
      const first = vi.fn();
      const second = vi.fn();
      render(<SnackbarRoot />);

      act(() => {
        snackbarService.openSuccessSnackbar('First', first);
      });
      flushOpen();
      act(() => {
        snackbarService.openErrorSnackbar('Second', second);
      });
      flushOpen();

      expect(document.querySelectorAll('.Snackbar-container > *')).toHaveLength(1);
      expect(getRoot()!.textContent).toContain('Second');
      expect(getRoot()!.textContent).not.toContain('First');

      act(() => vi.advanceTimersByTime(3000));
      expect(second).toHaveBeenCalledTimes(1);
      expect(first).not.toHaveBeenCalled();
    });

    it('a second message restarts the 3000ms auto-hide', () => {
      const onClose = vi.fn();
      render(<SnackbarRoot />);
      act(() => {
        snackbarService.openSuccessSnackbar('First');
      });
      flushOpen();
      act(() => vi.advanceTimersByTime(2000));
      act(() => {
        snackbarService.openSuccessSnackbar('Second', onClose);
      });
      flushOpen();

      act(() => vi.advanceTimersByTime(2000));
      expect(onClose).not.toHaveBeenCalled();
      act(() => vi.advanceTimersByTime(1000));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    // CURRENT BEHAVIOUR (suspected bug): pubSubService uses a ReplaySubject, so a SnackbarRoot mounted later
    // replays every past message and shows the last one.
    it('[bug-lock] a root mounted after messages were published replays them and shows the last one', () => {
      // Baseline characterization: not a promised contract.
      const first = render(<SnackbarRoot />); // creates the subject
      act(() => {
        snackbarService.openSuccessSnackbar('Old 1');
        snackbarService.openSuccessSnackbar('Old 2');
      });
      first.unmount();

      render(<SnackbarRoot />);
      flushOpen();

      expect(getRoot()!.textContent).toContain('Old 2');
    });

    // CURRENT BEHAVIOUR (suspected bug): the subscriptions are never unsubscribed on unmount.
    it('[bug-lock] unmounting does not remove its pub-sub subscription', () => {
      // Baseline characterization: not a promised contract.
      const { unmount } = render(<SnackbarRoot />);
      const mounted = pubSubTestAccess.openObserverCount();
      expect(mounted).toBeGreaterThan(0);

      unmount();

      expect(pubSubTestAccess.openObserverCount()).toBe(mounted);
    });

    it('[v5-quirk] messages published before any root subscribed are dropped', () => {
      // Baseline characterization: not a promised contract.
      act(() => {
        snackbarService.openSuccessSnackbar('Too early');
      });
      render(<SnackbarRoot />);
      flushOpen();

      expect(getRoot()).toBeNull();
    });
  });

  it('snackbarService.open returns a string id and parseMessage translates object messages', () => {
    render(<SnackbarRoot />);
    let id = '';
    act(() => {
      id = snackbarService.open({ type: 'info', title: '', message: 'Info message' });
    });
    flushOpen();

    expect(typeof id).toBe('string');
    expect(getRoot()!.textContent).toContain('Info message');
    expect(typeof snackbarService.parseMessage({ text: 'Plain key' })).toBe('string');
  });
});
