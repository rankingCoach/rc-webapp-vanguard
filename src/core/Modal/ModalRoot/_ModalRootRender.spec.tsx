import { PublicWidgetData } from '@stores/public-widgets-data.store';
import { rcWindow } from '@stores/window.store';
import { appScreen, cleanup, render } from '@test-utils/test-utils';
import { act } from '@testing-library/react';
import React from 'react';
import { Globals } from 'react-spring';
import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest';

import { Modal } from '../Modal';
import { ModalProvider } from '../ModalContext';
import { ModalService } from '../ModalService';
import { useModalPresentation } from '../use-modal-presentation';
import { ModalRoot } from './ModalRoot';

beforeAll(() => {
  // Deterministic, instant transitions instead of driving react-spring frame by frame.
  Globals.assign({ skipAnimation: true });
  // jsdom does not implement scrollIntoView; the tab row's onFocus calls it.
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(async () => {
  // ModalRoot subscribes to pubSubService's reactModalOpen/reactModalClose ReplaySubjects,
  // which replay their FULL history to every new subscriber (pubSubService has no reset
  // and is a module-level singleton — see report). Left-open modals from one test would
  // therefore "ghost-reopen" into the next test's freshly-mounted ModalRoot. Publish a
  // matching close for everything still open so replay nets to empty before the next test.
  await act(async () => {
    ModalService.closeAllModals();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  cleanup();
  ModalService.__resetForTests();
  document.body.style.overflow = '';
  document.body.style.marginRight = '';
  vi.restoreAllMocks();
});

const renderRoot = () =>
  render(
    <ModalProvider>
      <ModalRoot />
    </ModalProvider>,
  );

const rootFor = (id: string) => document.querySelector(`[data-modal-id="${id}"]`) as HTMLElement | null;

describe('animation lanes', () => {
  test('grow/slide/pop modals each render their own .modalRoot with the matching data-modal-id', () => {
    renderRoot();
    let grow: string, slide: string, pop: string;
    act(() => {
      grow = ModalService.open(<div>grow</div>, { animation: 'grow' });
      slide = ModalService.open(<div>slide</div>, { animation: 'slide' });
      pop = ModalService.open(<div>pop</div>, { animation: 'pop' });
    });
    expect(rootFor(grow!)).toBeTruthy();
    expect(rootFor(slide!)).toBeTruthy();
    expect(rootFor(pop!)).toBeTruthy();
  });

  test('z-index follows overlay registration/open order', () => {
    renderRoot();
    let first: string, second: string;
    act(() => {
      first = ModalService.open(<div>a</div>);
      second = ModalService.open(<div>b</div>);
    });
    const firstZ = Number(rootFor(first!)!.style.zIndex);
    const secondZ = Number(rootFor(second!)!.style.zIndex);
    expect(secondZ).toBeGreaterThan(firstZ);
  });

  test('closing a modal removes its .modalRoot from the DOM', async () => {
    renderRoot();
    let id: string;
    act(() => {
      id = ModalService.open(<div>x</div>);
    });
    expect(rootFor(id!)).toBeTruthy();
    await act(async () => {
      await ModalService.closeEv(id);
    });
    await vi.waitFor(() => expect(rootFor(id)).toBeNull());
  });
});

describe('body scroll lock', () => {
  test('locks overflow to hidden for a normal (non-compact) modal', () => {
    renderRoot();
    act(() => {
      ModalService.open(<div />);
    });
    expect(document.body.style.overflow).toBe('hidden');
  });

  test('does not lock when only compact modals are open', () => {
    renderRoot();
    act(() => {
      ModalService.setCompactMode(true);
      ModalService.open(<Modal fullscreen />, { fullscreen: true, allowCompact: true });
    });
    expect(document.body.style.overflow).toBe('');
  });

  test('restores overflow after the blocking modal closes', async () => {
    renderRoot();
    let id: string;
    act(() => {
      id = ModalService.open(<div />);
    });
    expect(document.body.style.overflow).toBe('hidden');
    await act(async () => {
      await ModalService.closeEv(id);
    });
    await vi.waitFor(() => expect(document.body.style.overflow).toBe(''));
  });
});

describe('flags off', () => {
  test('root className is exactly "modalRoot" with no stacking/tabs/window-controls classes', () => {
    renderRoot();
    let id: string;
    act(() => {
      id = ModalService.open(<div />);
    });
    const root = rootFor(id!)!;
    // classNames() joins unconditionally with a space, so falsy modifiers leave trailing
    // whitespace tokens; assert on the actual class TOKEN set, not the raw string.
    expect(root.className.split(/\s+/).filter(Boolean)).toEqual(['modalRoot']);
    expect(document.querySelector('.modal-stack-tabs')).toBeNull();
    expect(document.querySelector('.compact-window-controls')).toBeNull();
    expect(document.querySelector('.modal-stack-activate')).toBeNull();
  });
});

describe('stacking', () => {
  const openBam = () => ModalService.open(<Modal fullscreen />, { fullscreen: true, allowStacking: true });
  const openCompactableBam = () =>
    ModalService.open(<Modal fullscreen />, { fullscreen: true, allowCompact: true, allowStacking: true });

  test('back BAMs get modalRoot-stacked/modalRoot-stack-back + inert, the active one gets data-stack-active', () => {
    renderRoot();
    let first: string, second: string, third: string;
    act(() => {
      ModalService.setStackingEnabled(true);
      first = openBam();
      second = openBam();
      third = openBam();
    });
    const firstRoot = rootFor(first!)!;
    const secondRoot = rootFor(second!)!;
    const thirdRoot = rootFor(third!)!;
    expect(thirdRoot.className).toContain('modalRoot-stacked');
    expect(thirdRoot.className).not.toContain('modalRoot-stack-back');
    expect(thirdRoot.getAttribute('data-stack-active')).toBe('true');
    expect(firstRoot.className).toContain('modalRoot-stack-back');
    expect(firstRoot.querySelector('.modalRoot-container')?.getAttribute('inert')).not.toBeNull();
    expect(secondRoot.className).toContain('modalRoot-stack-back');
  });

  test('"Bring to front" button calls bringToFront and reorders the stack', () => {
    renderRoot();
    let first: string, second: string;
    act(() => {
      ModalService.setStackingEnabled(true);
      first = openBam();
      second = openBam();
    });
    const spy = vi.spyOn(ModalService, 'bringToFront');
    const button = rootFor(first!)!.querySelector('.modal-stack-activate') as HTMLButtonElement;
    expect(button).toBeTruthy();
    act(() => {
      button.click();
    });
    expect(spy).toHaveBeenCalledWith(first);
    expect(ModalService.getBamIds()).toEqual([second, first]);
  });

  test('a compact back card (index 0, compact) still gets a transparent stack background', () => {
    renderRoot();
    let first: string;
    act(() => {
      ModalService.setStackingEnabled(true);
      ModalService.setCompactMode(true);
      first = openCompactableBam();
      openCompactableBam();
    });
    expect(rootFor(first!)!.style.backgroundColor).toBe('transparent');
  });
});

describe('tabs (>3 expanded stacked BAMs)', () => {
  const openBam = (title?: string) =>
    ModalService.open(<Modal fullscreen />, { fullscreen: true, allowStacking: true, title });

  const setupFour = () => {
    let ids: string[] = [];
    act(() => {
      ModalService.setStackingEnabled(true);
      ids = [openBam('One'), openBam('Two'), openBam('Three'), openBam('Four')];
    });
    return ids;
  };

  test('renders a tablist with a tab per expanded BAM, labeled from title, and marks the active one', () => {
    renderRoot();
    const ids = setupFour();
    const tablist = appScreen.getByRole('tablist');
    expect(tablist).toBeTruthy();
    const tabs = appScreen.getAllByRole('tab');
    expect(tabs).toHaveLength(4);
    expect(tabs.map((tab) => tab.getAttribute('aria-selected'))).toEqual(['false', 'false', 'false', 'true']);
    expect(tabs[3].id).toBe(`bam-tab-${ids[3]}`);
  });

  test('falls back to the translated "Window" label when no title/stackTitle is set', () => {
    renderRoot();
    act(() => {
      ModalService.setStackingEnabled(true);
      [0, 1, 2, 3].forEach(() => openBam());
    });
    const tabs = appScreen.getAllByRole('tab');
    expect(tabs.every((tab) => tab.getAttribute('title') === 'Window')).toBe(true);
  });

  test('translates the string title but keeps stackTitle literal', () => {
    rcWindow.TranslationsData = { Settings: 'Einstellungen', 'Custom tab': 'Übersetzt' };
    try {
      renderRoot();
      act(() => {
        ModalService.setStackingEnabled(true);
        [0, 1, 2].forEach(() => openBam('Settings'));
        ModalService.open(<Modal fullscreen />, { fullscreen: true, allowStacking: true, stackTitle: 'Custom tab' });
      });
      const tabs = appScreen.getAllByRole('tab');
      expect(tabs.slice(0, 3).map((tab) => tab.textContent)).toEqual(['Einstellungen', 'Einstellungen', 'Einstellungen']);
      expect(tabs.slice(0, 3).every((tab) => tab.getAttribute('title') === 'Einstellungen')).toBe(true);
      expect(tabs[3].textContent).toBe('Custom tab');
    } finally {
      delete rcWindow.TranslationsData;
    }
  });

  test('prefers stackTitle over the string title', () => {
    renderRoot();
    act(() => {
      ModalService.setStackingEnabled(true);
      [0, 1, 2].forEach(() => openBam('Ignored'));
      ModalService.open(<Modal fullscreen />, {
        fullscreen: true,
        allowStacking: true,
        title: 'Ignored',
        stackTitle: 'Custom tab',
      });
    });
    const tabs = appScreen.getAllByRole('tab');
    expect(tabs.at(-1)!.getAttribute('title')).toBe('Custom tab');
  });

  test('ArrowRight/ArrowLeft/Home/End move focus and bring the target to front, wrapping at the ends', () => {
    renderRoot();
    const ids = setupFour();
    const spy = vi.spyOn(ModalService, 'bringToFront');
    const firstTab = document.getElementById(`bam-tab-${ids[0]}`) as HTMLButtonElement;
    act(() => {
      firstTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }));
    });
    expect(spy).toHaveBeenCalledWith(ids[3]);

    const lastTab = document.getElementById(`bam-tab-${ids[3]}`) as HTMLButtonElement;
    act(() => {
      lastTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    });
    expect(spy).toHaveBeenCalledWith(ids[0]);

    act(() => {
      lastTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true }));
    });
    expect(spy).toHaveBeenCalledWith(ids[0]);
    act(() => {
      lastTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }));
    });
    expect(spy).toHaveBeenCalledWith(ids[3]);
  });

  test('clicking a tab brings that BAM to front', () => {
    renderRoot();
    const ids = setupFour();
    const spy = vi.spyOn(ModalService, 'bringToFront');
    const tab = document.getElementById(`bam-tab-${ids[0]}`) as HTMLButtonElement;
    act(() => {
      tab.click();
    });
    expect(spy).toHaveBeenCalledWith(ids[0]);
  });

  test('3 or fewer expanded stacked BAMs render the rear-card button instead of tabs', () => {
    renderRoot();
    act(() => {
      ModalService.setStackingEnabled(true);
      [0, 1, 2].forEach(() => openBam());
    });
    expect(document.querySelector('.modal-stack-tabs')).toBeNull();
    expect(document.querySelectorAll('.modal-stack-activate').length).toBeGreaterThan(0);
  });

  test('a BAM without allowStacking opens outside the stack: no tab, no stack classes, stack front unchanged', () => {
    renderRoot();
    let ids: string[] = [];
    let plain: string;
    act(() => {
      ModalService.setStackingEnabled(true);
      ids = [openBam('One'), openBam('Two'), openBam('Three')];
      plain = ModalService.open(<Modal fullscreen />, { fullscreen: true, title: 'Plain' });
    });
    expect(document.querySelector('.modal-stack-tabs')).toBeNull();
    expect(rootFor(plain!)!.className.split(/\s+/).filter(Boolean)).toEqual(['modalRoot']);
    expect(rootFor(plain!)!.getAttribute('data-stack-active')).toBeNull();
    expect(Number(rootFor(plain!)!.style.zIndex)).toBeGreaterThan(Number(rootFor(ids[2])!.style.zIndex));
    expect(rootFor(ids[2])!.getAttribute('data-stack-active')).toBe('true');
    expect(rootFor(ids[0])!.className).toContain('modalRoot-stack-back');
  });
});

describe('setStackTitle', () => {
  const openBam = (stackTitle: string) =>
    ModalService.open(<Modal fullscreen />, { fullscreen: true, allowStacking: true, stackTitle });

  test('relabels the rear-card strip and the stack tab of an open stacking modal', () => {
    renderRoot();
    let first: string;
    act(() => {
      ModalService.setStackingEnabled(true);
      first = openBam('Draft');
      openBam('Other');
    });
    const strip = () => rootFor(first!)!.querySelector('.modal-stack-activate')!;
    expect(strip().textContent).toContain('Draft');

    act(() => ModalService.setStackTitle(first!, 'Renamed'));
    expect(strip().textContent).toContain('Renamed');
    expect(strip().textContent).not.toContain('Draft');

    act(() => {
      openBam('Three');
      openBam('Four');
    });
    expect(document.getElementById(`bam-tab-${first!}`)!.getAttribute('title')).toBe('Renamed');
    act(() => ModalService.setStackTitle(first!, 'Final'));
    expect(document.getElementById(`bam-tab-${first!}`)!.getAttribute('title')).toBe('Final');
    expect(document.getElementById(`bam-tab-${first!}`)!.textContent).toBe('Final');
  });

  test('ignores unknown ids and an unchanged title', () => {
    renderRoot();
    let id: string;
    act(() => {
      ModalService.setStackingEnabled(true);
      id = openBam('Same');
    });
    const revision = ModalService.getPresentationRevision();
    ModalService.setStackTitle(id!, 'Same');
    ModalService.setStackTitle('missing', 'Anything');
    expect(ModalService.getPresentationRevision()).toBe(revision);
  });
});

describe('presented state (isModalPresented / useModalPresentation)', () => {
  /** Rendered inside <Modal>, so it also proves the hook survives Modal's presentation reset. */
  const Probe = () => {
    const { presented, modalId } = useModalPresentation();
    return <span data-testid={`probe-${modalId}`} data-presented={String(presented)} />;
  };
  const windowOpts = { fullscreen: true, allowCompact: true, allowStacking: true };
  const openWith = (opts: object) => ModalService.open(<Modal fullscreen><Probe /></Modal>, opts);
  const hookPresented = (id: string) => appScreen.getByTestId(`probe-${id}`).getAttribute('data-presented') === 'true';
  /** Service, hook and rendered stack-active state must all agree. */
  const expectPresented = (expected: Record<string, boolean>) => {
    for (const [id, presented] of Object.entries(expected)) {
      expect(ModalService.isModalPresented(id)).toBe(presented);
      expect(hookPresented(id)).toBe(presented);
      expect(rootFor(id)!.className.includes('modalRoot-stack-back')).toBe(!presented);
    }
  };

  test('outside a service modal the hook reports presented with no owner', () => {
    const Outside = () => <span data-testid="outside" data-presented={String(useModalPresentation().presented)} />;
    render(<Outside />);
    expect(appScreen.getByTestId('outside').getAttribute('data-presented')).toBe('true');
    expect(ModalService.isModalPresented('missing')).toBe(false);
  });

  test('a detached compact window is presented while its former stack keeps only its front window presented', () => {
    renderRoot();
    let ids: string[] = [];
    act(() => {
      ModalService.setStackingEnabled(true);
      ModalService.setCompactWindowControlsEnabled(true);
      ModalService.setCompactMode(true);
      ids = [openWith(windowOpts), openWith(windowOpts), openWith(windowOpts)];
    });
    const [first, second, detached] = ids;
    expectPresented({ [first]: false, [second]: false, [detached]: true });

    // Dragged out of the stack: no longer the stack front, but a free window of its own.
    act(() => ModalService.setCompactWindowBounds(first, { x: 20, y: 20, width: 400, height: 400 }));
    expect(ModalService.isCompactWindowDetached(first)).toBe(true);
    expectPresented({ [first]: true, [second]: false, [detached]: true });

    act(() => ModalService.returnCompactWindowToStack(first));
    expectPresented({ [first]: true, [second]: false, [detached]: false });
  });

  test('a docked compact stack presents only its active window and follows bringToFront', () => {
    renderRoot();
    let ids: string[] = [];
    act(() => {
      ModalService.setStackingEnabled(true);
      ModalService.setCompactWindowControlsEnabled(true);
      ModalService.setCompactMode(true);
      ids = [openWith(windowOpts), openWith(windowOpts)];
    });
    const [back, front] = ids;
    expect(ModalService.getModalComponent(back).isCompact).toBe(true);
    expectPresented({ [back]: false, [front]: true });

    act(() => ModalService.bringToFront(back));
    expectPresented({ [back]: true, [front]: false });
  });

  test('an expanded stack presents only its front card, and every card once stacking is disabled', () => {
    renderRoot();
    let ids: string[] = [];
    act(() => {
      ModalService.setStackingEnabled(true);
      ids = [0, 1, 2].map(() => openWith({ fullscreen: true, allowStacking: true }));
    });
    const [first, second, third] = ids;
    expectPresented({ [first]: false, [second]: false, [third]: true });

    act(() => ModalService.bringToFront(second));
    expectPresented({ [first]: false, [second]: true, [third]: false });

    act(() => ModalService.setStackingEnabled(false));
    expectPresented({ [first]: true, [second]: true, [third]: true });
  });

  test('closing the front card presents the next one, notifies subscribers and reports the closed id as not presented', async () => {
    renderRoot();
    let ids: string[] = [];
    act(() => {
      ModalService.setStackingEnabled(true);
      ids = [0, 1, 2].map(() => openWith({ fullscreen: true, allowStacking: true }));
    });
    const [first, second, third] = ids;
    const listener = vi.fn();
    const unsubscribe = ModalService.subscribePresentation(listener);
    await act(async () => {
      await ModalService.closeEv(third);
    });
    unsubscribe();
    expect(listener).toHaveBeenCalled();
    expect(ModalService.isModalPresented(third)).toBe(false);
    expect(rootFor(third)).toBeNull();
    expectPresented({ [first]: false, [second]: true });
  });

  test('each stack presents its own front window: expanded, default compact and a separately docked compact group', () => {
    renderRoot();
    const bounds = { x: 40, y: 40, width: 400, height: 400 };
    let ids: string[] = [];
    act(() => {
      ModalService.setStackingEnabled(true);
      ModalService.setCompactWindowControlsEnabled(true);
      ModalService.setCompactMode(true);
      ids = [
        openWith({ fullscreen: true, allowStacking: true }),
        openWith({ fullscreen: true, allowStacking: true }),
        ...[0, 1, 2, 3].map(() => openWith(windowOpts)),
      ];
    });
    const [expandedBack, expandedFront, compactBack, compactFront, groupBack, groupFront] = ids;
    act(() => {
      ModalService.setCompactWindowBounds(groupBack, bounds);
      ModalService.setCompactWindowBounds(groupFront, bounds);
      ModalService.dockCompactWindow(groupFront, [{ id: groupBack, bounds }]);
    });
    expect(ModalService.getStackedBamIds(groupFront)).toEqual([groupBack, groupFront]);
    expect(ModalService.getStackedBamIds(compactFront)).toEqual([compactBack, compactFront]);
    expectPresented({
      [expandedBack]: false, [expandedFront]: true,
      [compactBack]: false, [compactFront]: true,
      [groupBack]: false, [groupFront]: true,
    });

    // Promoting inside one stack leaves the other stacks' front windows presented.
    act(() => ModalService.bringToFront(compactBack));
    expectPresented({
      [expandedFront]: true,
      [compactBack]: true, [compactFront]: false,
      [groupBack]: false, [groupFront]: true,
    });
  });

  test('a tabbed stack presents only the selected tab', () => {
    renderRoot();
    let ids: string[] = [];
    act(() => {
      ModalService.setStackingEnabled(true);
      ids = [0, 1, 2, 3].map(() => openWith({ fullscreen: true, allowStacking: true }));
    });
    expect(appScreen.getByRole('tablist')).toBeTruthy();
    const presented = (selected: string) => Object.fromEntries(ids.map((id) => [id, id === selected]));
    expectPresented(presented(ids[3]));
    expect(document.getElementById(`bam-tab-${ids[3]}`)!.getAttribute('aria-selected')).toBe('true');

    act(() => document.getElementById(`bam-tab-${ids[1]}`)!.click());
    expectPresented(presented(ids[1]));
  });
});

describe('compact window controls', () => {
  const setup = () => {
    let id: string;
    act(() => {
      ModalService.setCompactWindowControlsEnabled(true);
      ModalService.setCompactMode(true);
      id = ModalService.open(<Modal fullscreen />, { fullscreen: true, allowCompact: true });
    });
    return id!;
  };

  test('renders window-controls class, CompactWindowControls markup and CSS geometry vars', () => {
    renderRoot();
    const id = setup();
    const root = rootFor(id)!;
    expect(root.className).toContain('modalRoot-window-controls');
    expect(root.querySelector('.compact-window-controls')).toBeTruthy();
    expect(root.style.getPropertyValue('--compact-window-x')).not.toBe('');
    expect(root.style.getPropertyValue('--compact-window-y')).not.toBe('');
    expect(root.style.getPropertyValue('--compact-window-width')).not.toBe('');
    expect(root.style.getPropertyValue('--compact-window-height')).not.toBe('');
  });

  test('a pointer press anywhere on an active window-controlled root focuses that compact window', () => {
    renderRoot();
    const id = setup();
    const spy = vi.spyOn(ModalService, 'focusCompactWindow');
    const root = rootFor(id)!;
    root.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(spy).toHaveBeenCalledWith(id);
  });

  test('adds modalRoot-window-interacting while ModalService reports interaction', () => {
    renderRoot();
    const id = setup();
    act(() => {
      ModalService.setCompactWindowInteracting(true, id);
    });
    expect(rootFor(id)!.className).toContain('modalRoot-window-interacting');
    act(() => {
      ModalService.setCompactWindowInteracting(false, id);
    });
    expect(rootFor(id)!.className).not.toContain('modalRoot-window-interacting');
  });
});

describe('compact window expanded geometry', () => {
  const tokens = (id: string) => rootFor(id)!.className.split(/\s+/).filter(Boolean);
  const openWindow = (opts: { fullscreen: boolean; allowCompact?: boolean }) => {
    let id: string;
    act(() => {
      id = ModalService.open(<Modal fullscreen={opts.fullscreen} />, { fullscreen: opts.fullscreen, allowCompact: opts.allowCompact ?? true });
    });
    return id!;
  };

  test('adds modalRoot-window-expanded to an expanded fullscreen allowCompact modal with window controls', () => {
    renderRoot();
    act(() => ModalService.setCompactWindowControlsEnabled(true));
    const id = openWindow({ fullscreen: true });
    expect(tokens(id)).toContain('modalRoot-window-expanded');
    expect(tokens(id)).not.toContain('modalRoot-window-controls');
  });

  test('swaps to modalRoot-window-controls when compacted and back when expanded', () => {
    renderRoot();
    act(() => ModalService.setCompactWindowControlsEnabled(true));
    const id = openWindow({ fullscreen: true });
    act(() => ModalService.compact(id));
    expect(tokens(id)).not.toContain('modalRoot-window-expanded');
    expect(tokens(id)).toContain('modalRoot-window-controls');
    act(() => ModalService.expand(id));
    expect(tokens(id)).toContain('modalRoot-window-expanded');
    expect(tokens(id)).not.toContain('modalRoot-window-controls');
  });

  test('flags modalRoot-window-morphing only briefly after a compact/expand flip, not on open', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      renderRoot();
      act(() => ModalService.setCompactWindowControlsEnabled(true));
      const id = openWindow({ fullscreen: true });
      expect(tokens(id)).not.toContain('modalRoot-window-morphing');
      for (const flip of [() => ModalService.compact(id), () => ModalService.expand(id)]) {
        act(flip);
        expect(tokens(id)).toContain('modalRoot-window-morphing');
        await act(async () => { await vi.advanceTimersByTimeAsync(300); });
        expect(tokens(id)).not.toContain('modalRoot-window-morphing');
      }
    } finally {
      vi.useRealTimers();
    }
  });

  test('is absent for non-fullscreen modals, modals without allowCompact, and when window controls are disabled', () => {
    renderRoot();
    act(() => ModalService.setCompactWindowControlsEnabled(true));
    const dialog = openWindow({ fullscreen: false });
    const plain = openWindow({ fullscreen: true, allowCompact: false });
    expect(tokens(dialog)).not.toContain('modalRoot-window-expanded');
    expect(tokens(plain)).not.toContain('modalRoot-window-expanded');
    act(() => ModalService.setCompactWindowControlsEnabled(false));
    const disabled = openWindow({ fullscreen: true });
    expect(tokens(disabled)).not.toContain('modalRoot-window-expanded');
  });
});

describe('compact/expand prop injection', () => {
  test('injects compact/expand functions only when allowCompact is opted in', () => {
    renderRoot();
    let withCompact: string, without: string;
    act(() => {
      withCompact = ModalService.open(<div />, { allowCompact: true });
      without = ModalService.open(<div />);
    });
    expect(typeof ModalService.getModalComponent(withCompact!).props.compact).toBe('function');
    expect(typeof ModalService.getModalComponent(withCompact!).props.expand).toBe('function');
    expect(ModalService.getModalComponent(without!).props.compact).toBeUndefined();
    expect(ModalService.getModalComponent(without!).props.expand).toBeUndefined();
  });
});

describe('Esc handling', () => {
  const pressEsc = () =>
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));

  test('with flags off, only the topmost modal closes on Esc', () => {
    renderRoot();
    const closeA = vi.fn();
    const closeB = vi.fn();
    act(() => {
      ModalService.open(<Modal fullscreen={false} onClose={closeA} />);
      ModalService.open(<Modal fullscreen={false} onClose={closeB} />);
    });
    act(() => {
      pressEsc();
    });
    expect(closeB).toHaveBeenCalledTimes(1);
    expect(closeA).not.toHaveBeenCalled();
  });

  test('with stacking enabled, only the topmost BAM closes on Esc', () => {
    renderRoot();
    const closeA = vi.fn();
    const closeB = vi.fn();
    act(() => {
      ModalService.setStackingEnabled(true);
      ModalService.open(<Modal fullscreen onClose={closeA} />, { fullscreen: true, allowStacking: true });
      ModalService.open(<Modal fullscreen onClose={closeB} />, { fullscreen: true, allowStacking: true });
    });
    act(() => {
      pressEsc();
    });
    expect(closeB).toHaveBeenCalledTimes(1);
    expect(closeA).not.toHaveBeenCalled();
  });

  test('with stacking enabled, a standalone modal above a service-managed BAM closes first', () => {
    const { rerender } = renderRoot();
    const closeManaged = vi.fn();
    const closeStandalone = vi.fn();
    act(() => {
      ModalService.setStackingEnabled(true);
      ModalService.open(<Modal fullscreen onClose={closeManaged} />, { fullscreen: true, allowStacking: true });
    });
    rerender(
      <ModalProvider>
        <ModalRoot />
        <Modal fullscreen={false} onClose={closeStandalone} />
      </ModalProvider>,
    );
    act(() => {
      pressEsc();
    });
    expect(closeStandalone).toHaveBeenCalledTimes(1);
    expect(closeManaged).not.toHaveBeenCalled();
  });
});

// MUST run last: PublicWidgetData.set() can only assign its widgetId ONCE per
// process (see src/stores/public-widgets-data.store.ts — it silently refuses a
// second `set`, no reset exists), and once set, ModalService.open() suffixes
// every id with it for the rest of this test file's lifetime.
describe('widget scoping (useGetModals)', () => {
  test('once a widgetId is set, opened ids carry the suffix and still render through useGetModals', () => {
    PublicWidgetData.getInstance().set({ token: '', host: '', locationId: '', widgetId: 'w1' });
    renderRoot();
    let id: string;
    act(() => {
      id = ModalService.open(<div />);
    });
    expect(id!.endsWith('_w1')).toBe(true);
    expect(rootFor(id!)).toBeTruthy();
  });
});
