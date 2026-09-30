import { cleanup, fireEvent, render } from '@test-utils/test-utils';
import React from 'react';
import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest';

import { Modal } from '../Modal';
import { modalLayout } from '../modal-layout';
import { clampCompactWindowBounds, ModalService } from '../ModalService';
import { CompactWindowControls } from './CompactWindowControls';

beforeAll(() => {
  // jsdom in this environment has no PointerEvent constructor at all, so
  // fireEvent.pointerDown/Move/Up would otherwise dispatch a bare Event with
  // clientX/clientY/pointerId/button all undefined. Polyfill it as a thin
  // MouseEvent subclass so the gesture handlers see real coordinates.
  class PointerEventPolyfill extends MouseEvent {
    public pointerId: number;
    public pointerType: string;
    public isPrimary: boolean;
    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId ?? 0;
      this.pointerType = params.pointerType ?? 'mouse';
      this.isPrimary = params.isPrimary ?? true;
    }
  }
  (globalThis as any).PointerEvent = PointerEventPolyfill;
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    cb(0);
    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', () => {});
});

afterEach(() => {
  cleanup();
  ModalService.__resetForTests();
  vi.restoreAllMocks();
  // vi.restoreAllMocks() only restores spies; re-install the plain stub mocks it can't touch.
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
});

/** Registers a real fullscreen ModalService window that qualifies for compact-window management. */
const openManagedWindow = () => {
  ModalService.setCompactWindowControlsEnabled(true);
  ModalService.setCompactMode(true);
  return ModalService.open(<Modal fullscreen />, { fullscreen: true, allowCompact: true, allowStacking: true });
};

const stubRect = (el: Element | null, rect: { x: number; y: number; width: number; height: number }) => {
  if (!el) return;
  (el as HTMLElement).getBoundingClientRect = () =>
    ({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      top: rect.y,
      left: rect.x,
      right: rect.x + rect.width,
      bottom: rect.y + rect.height,
      toJSON: () => ({}),
    }) as DOMRect;
};

/** DOM shape CompactWindowControls expects: a `.modalRoot` root with the `.rc-modal` panel it measures. */
const Panel = ({
  id,
  title = 'Window',
  index = 0,
  count = 1,
  stacked = false,
  active = true,
  rect,
  rear,
}: {
  id: string;
  title?: string;
  index?: number;
  count?: number;
  stacked?: boolean;
  active?: boolean;
  rect: { x: number; y: number; width: number; height: number };
  rear?: boolean;
}) => (
  <div className="modalRoot modalRoot-window-controls" data-modal-id={id}>
    <div className="rc-modal">
      <div className="modal-content-wrapper" ref={(el) => stubRect(el, rect)} />
    </div>
    <CompactWindowControls id={id} title={title} index={index} count={count} stacked={stacked} active={active} />
    {rear && (
      <button className="modal-stack-activate" onClick={() => ModalService.bringToFront(id)}>
        Bring to front
      </button>
    )}
  </div>
);

const defaultBounds = () =>
  clampCompactWindowBounds(
    {
      x: window.innerWidth - modalLayout.width - modalLayout.inset,
      y: Math.max(modalLayout.inset, window.innerHeight - modalLayout.height - modalLayout.inset),
      width: modalLayout.width,
      height: Math.min(modalLayout.height, window.innerHeight - 2 * modalLayout.inset),
    },
    window.innerWidth,
    window.innerHeight,
  );

describe('move via the move buttons', () => {
  test('dragging the move-left button translates the window by the pointer delta', () => {
    const id = openManagedWindow();
    const rect = defaultBounds();
    const { container } = render(<Panel id={id} rect={rect} />);
    const moveLeft = container.querySelector('.compact-window-move-left') as HTMLElement;

    fireEvent.pointerDown(moveLeft, { pointerId: 1, clientX: 100, clientY: 100, button: 0 });
    fireEvent.pointerMove(moveLeft, { pointerId: 1, clientX: 130, clientY: 160 });
    fireEvent.pointerUp(moveLeft, { pointerId: 1, clientX: 130, clientY: 160, button: 0 });

    const expected = clampCompactWindowBounds(
      { ...rect, x: rect.x + 30, y: rect.y + 60 },
      window.innerWidth,
      window.innerHeight,
    );
    expect(ModalService.getCompactWindowBounds(id)).toEqual(expected);
  });

  test('a sub-threshold move (< 4px) is not treated as a drag: bounds stay unset', () => {
    const id = openManagedWindow();
    const rect = defaultBounds();
    const { container } = render(<Panel id={id} rect={rect} />);
    const moveLeft = container.querySelector('.compact-window-move-left') as HTMLElement;
    fireEvent.pointerDown(moveLeft, { pointerId: 1, clientX: 100, clientY: 100, button: 0 });
    fireEvent.pointerMove(moveLeft, { pointerId: 1, clientX: 101, clientY: 101 });
    fireEvent.pointerUp(moveLeft, { pointerId: 1, clientX: 101, clientY: 101, button: 0 });
    expect(ModalService.getCompactWindowBounds(id)).toBeUndefined();
  });

  test('a non-primary button press is ignored entirely', () => {
    const id = openManagedWindow();
    const rect = defaultBounds();
    const { container } = render(<Panel id={id} rect={rect} />);
    const moveLeft = container.querySelector('.compact-window-move-left') as HTMLElement;
    fireEvent.pointerDown(moveLeft, { pointerId: 1, clientX: 100, clientY: 100, button: 2 });
    fireEvent.pointerMove(moveLeft, { pointerId: 1, clientX: 200, clientY: 200 });
    fireEvent.pointerUp(moveLeft, { pointerId: 1, clientX: 200, clientY: 200, button: 2 });
    expect(ModalService.getCompactWindowBounds(id)).toBeUndefined();
    expect(ModalService.isCompactWindowInteracting()).toBe(false);
  });
});

describe('resize edges', () => {
  test.each([
    ['e', { dx: 100, dy: 0 }, (r: any) => ({ ...r, width: r.width + 100 })],
    ['s', { dx: 0, dy: 80 }, (r: any) => ({ ...r, height: r.height + 80 })],
    ['n', { dx: 0, dy: -40 }, (r: any) => ({ ...r, y: r.y - 40, height: r.height + 40 })],
    ['w', { dx: -40, dy: 0 }, (r: any) => ({ ...r, x: r.x - 40, width: r.width + 40 })],
    ['ne', { dx: 40, dy: -20 }, (r: any) => ({ ...r, y: r.y - 20, width: r.width + 40, height: r.height + 20 })],
    ['sw', { dx: -30, dy: 30 }, (r: any) => ({ ...r, x: r.x - 30, width: r.width + 30, height: r.height + 30 })],
  ] as const)('dragging the %s handle resizes accordingly', (edge, delta, computeExpected) => {
    const id = openManagedWindow();
    const rect = { x: 200, y: 200, width: 480, height: 400 };
    // The gesture's starting geometry comes from ModalService's own bounds
    // (layout()), not from the DOM rect the panel happens to report.
    ModalService.setCompactWindowBounds(id, rect);
    const { container } = render(<Panel id={id} rect={rect} />);
    const handle = container.querySelector(`.compact-window-resize-${edge}`) as HTMLElement;
    fireEvent.pointerDown(handle, { pointerId: 1, clientX: 300, clientY: 300, button: 0 });
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: 300 + delta.dx, clientY: 300 + delta.dy });
    fireEvent.pointerUp(handle, { pointerId: 1, clientX: 300 + delta.dx, clientY: 300 + delta.dy, button: 0 });
    const expected = clampCompactWindowBounds(computeExpected(rect), window.innerWidth, window.innerHeight);
    expect(ModalService.getCompactWindowBounds(id)).toEqual(expected);
  });

  test('shrinking past the minimum clamps width and height to modalLayout.minWidth/minHeight', () => {
    const id = openManagedWindow();
    const rect = { x: 100, y: 100, width: 480, height: 400 };
    ModalService.setCompactWindowBounds(id, rect);
    const { container } = render(<Panel id={id} rect={rect} />);
    const handle = container.querySelector('.compact-window-resize-se') as HTMLElement;
    fireEvent.pointerDown(handle, { pointerId: 1, clientX: 500, clientY: 500, button: 0 });
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: -5000, clientY: -5000 });
    fireEvent.pointerUp(handle, { pointerId: 1, clientX: -5000, clientY: -5000, button: 0 });
    const bounds = ModalService.getCompactWindowBounds(id)!;
    expect(bounds.width).toBe(Math.min(modalLayout.minWidth, window.innerWidth));
    expect(bounds.height).toBe(Math.min(modalLayout.minHeight, window.innerHeight));
  });
});

describe('keyboard control', () => {
  test('Arrow keys on a move button nudge by 10px and refocus the window', () => {
    const id = openManagedWindow();
    const rect = defaultBounds();
    const { container } = render(<Panel id={id} rect={rect} />);
    const spy = vi.spyOn(ModalService, 'focusCompactWindow');
    const moveLeft = container.querySelector('.compact-window-move-left') as HTMLElement;
    fireEvent.keyDown(moveLeft, { key: 'ArrowRight' });
    const expected = clampCompactWindowBounds({ ...rect, x: rect.x + 10 }, window.innerWidth, window.innerHeight);
    expect(ModalService.getCompactWindowBounds(id)).toEqual(expected);
    expect(spy).toHaveBeenCalledWith(id);
  });

  test('Shift+Arrow uses a 40px step', () => {
    const id = openManagedWindow();
    const rect = defaultBounds();
    const { container } = render(<Panel id={id} rect={rect} />);
    const moveLeft = container.querySelector('.compact-window-move-left') as HTMLElement;
    fireEvent.keyDown(moveLeft, { key: 'ArrowDown', shiftKey: true });
    const expected = clampCompactWindowBounds({ ...rect, y: rect.y + 40 }, window.innerWidth, window.innerHeight);
    expect(ModalService.getCompactWindowBounds(id)).toEqual(expected);
  });

  test('Arrow keys on a resize handle change width/height, not position', () => {
    const id = openManagedWindow();
    const rect = { x: 100, y: 100, width: 480, height: 400 };
    ModalService.setCompactWindowBounds(id, rect);
    const { container } = render(<Panel id={id} rect={rect} />);
    const handle = container.querySelector('.compact-window-resize-e') as HTMLElement;
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    const expected = clampCompactWindowBounds(
      { ...rect, width: rect.width + 10 },
      window.innerWidth,
      window.innerHeight,
    );
    expect(ModalService.getCompactWindowBounds(id)).toEqual(expected);
  });

  test('a non-arrow key is ignored', () => {
    const id = openManagedWindow();
    const rect = defaultBounds();
    const { container } = render(<Panel id={id} rect={rect} />);
    const moveLeft = container.querySelector('.compact-window-move-left') as HTMLElement;
    fireEvent.keyDown(moveLeft, { key: 'Enter' });
    expect(ModalService.getCompactWindowBounds(id)).toBeUndefined();
  });

  test('ArrowLeft/ArrowUp nudge in the negative direction', () => {
    const id = openManagedWindow();
    const rect = { x: 300, y: 300, width: 480, height: 400 };
    ModalService.setCompactWindowBounds(id, rect);
    const { container } = render(<Panel id={id} rect={rect} />);
    const moveLeft = container.querySelector('.compact-window-move-left') as HTMLElement;
    fireEvent.keyDown(moveLeft, { key: 'ArrowLeft' });
    fireEvent.keyDown(moveLeft, { key: 'ArrowUp' });
    const expected = clampCompactWindowBounds(
      { ...rect, x: rect.x - 10, y: rect.y - 10 },
      window.innerWidth,
      window.innerHeight,
    );
    expect(ModalService.getCompactWindowBounds(id)).toEqual(expected);
  });

  test("the move-stack control only renders while attached to a stack, and nudges the whole stack's shared bounds", () => {
    openManagedWindow();
    const second = openManagedWindow();
    ModalService.setStackingEnabled(true);
    const rect = { x: 300, y: 300, width: 480, height: 400 };
    // Group-bounds write: keeps `second` attached (not floating) so layout().group is true.
    ModalService.setCompactWindowBounds(second, rect, true);
    const { container } = render(<Panel id={second} rect={rect} stacked />);
    const stackMove = container.querySelector('.compact-window-move-stack') as HTMLElement;
    expect(stackMove).toBeTruthy();
    fireEvent.keyDown(stackMove, { key: 'ArrowLeft' });
    const expected = clampCompactWindowBounds({ ...rect, x: rect.x - 10 }, window.innerWidth, window.innerHeight);
    expect(ModalService.getCompactStackBounds(second)).toEqual(expected);
    // A detached window has no stack to move together, so the control disappears.
    ModalService.setCompactWindowBounds(second, rect);
    const { container: detachedContainer } = render(<Panel id={second} rect={rect} stacked={false} />);
    expect(detachedContainer.querySelector('.compact-window-move-stack')).toBeNull();
  });
});

describe('title-band drag on the root', () => {
  test('a pointer press inside the title band (not on a control) drags the whole window', () => {
    const id = openManagedWindow();
    const rect = defaultBounds();
    const { container } = render(<Panel id={id} rect={rect} />);
    const root = container.querySelector('.modalRoot') as HTMLElement;
    const panel = container.querySelector('.modal-content-wrapper') as HTMLElement;
    const bandY = rect.y + modalLayout.resizeEdge + 2;
    const bandX = rect.x + rect.width / 2;

    fireEvent.pointerDown(panel, { pointerId: 5, clientX: bandX, clientY: bandY, button: 0 });
    fireEvent.pointerMove(root, { pointerId: 5, clientX: bandX + 25, clientY: bandY + 15 });
    fireEvent.pointerUp(root, { pointerId: 5, clientX: bandX + 25, clientY: bandY + 15, button: 0 });

    const expected = clampCompactWindowBounds(
      { ...rect, x: rect.x + 25, y: rect.y + 15 },
      window.innerWidth,
      window.innerHeight,
    );
    expect(ModalService.getCompactWindowBounds(id)).toEqual(expected);
  });

  test('a press outside the title band or resize margins does not start a drag', () => {
    const id = openManagedWindow();
    const rect = defaultBounds();
    const { container } = render(<Panel id={id} rect={rect} />);
    const root = container.querySelector('.modalRoot') as HTMLElement;
    const panel = container.querySelector('.modal-content-wrapper') as HTMLElement;
    const midY = rect.y + rect.height / 2;
    fireEvent.pointerDown(panel, { pointerId: 5, clientX: rect.x + rect.width / 2, clientY: midY, button: 0 });
    fireEvent.pointerMove(root, { pointerId: 5, clientX: rect.x + rect.width / 2 + 50, clientY: midY + 50 });
    fireEvent.pointerUp(root, { pointerId: 5, clientX: rect.x + rect.width / 2 + 50, clientY: midY + 50, button: 0 });
    expect(ModalService.getCompactWindowBounds(id)).toBeUndefined();
  });
});

describe('drop-to-dock (overlap)', () => {
  test('dropping one window fully overlapping another calls ModalService.dockCompactWindow', () => {
    const source = openManagedWindow();
    const target = openManagedWindow();
    const rect = { x: 0, y: 0, width: 400, height: 400 };
    // Seed the SOURCE's own ModalService bounds so the gesture's start position
    // (read from ModalService, not the DOM) matches the DOM rect candidates() reads.
    ModalService.setCompactWindowBounds(source, rect);

    const { container } = render(
      <>
        <Panel id={source} rect={rect} />
        <Panel id={target} rect={rect} />
      </>,
    );
    const spy = vi.spyOn(ModalService, 'dockCompactWindow');
    const sourceMove = container.querySelectorAll('.compact-window-move-left')[0] as HTMLElement;

    fireEvent.pointerDown(sourceMove, { pointerId: 9, clientX: 50, clientY: 50, button: 0 });
    fireEvent.pointerMove(sourceMove, { pointerId: 9, clientX: 55, clientY: 55 });
    fireEvent.pointerUp(sourceMove, { pointerId: 9, clientX: 55, clientY: 55, button: 0 });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toBe(source);
    expect(ModalService.getStackedBamIds()).toEqual(expect.arrayContaining([source, target]));
  });

  test('a drop with no qualifying overlap never docks', () => {
    const source = openManagedWindow();
    const target = openManagedWindow();
    ModalService.setCompactWindowBounds(source, { x: 0, y: 0, width: 400, height: 400 });
    const { container } = render(
      <>
        <Panel id={source} rect={{ x: 0, y: 0, width: 400, height: 400 }} />
        <Panel id={target} rect={{ x: 5000, y: 5000, width: 400, height: 400 }} />
      </>,
    );
    const spy = vi.spyOn(ModalService, 'dockCompactWindow');
    const sourceMove = container.querySelectorAll('.compact-window-move-left')[0] as HTMLElement;
    fireEvent.pointerDown(sourceMove, { pointerId: 9, clientX: 50, clientY: 50, button: 0 });
    fireEvent.pointerMove(sourceMove, { pointerId: 9, clientX: 60, clientY: 60 });
    fireEvent.pointerUp(sourceMove, { pointerId: 9, clientX: 60, clientY: 60, button: 0 });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(ModalService.isCompactWindowDetached(source)).toBe(true);
  });
});

describe('pointercancel / lostpointercapture cleanup', () => {
  test('pointercancel on a move button clears interacting state without applying pending bounds', () => {
    const id = openManagedWindow();
    const rect = defaultBounds();
    const { container } = render(<Panel id={id} rect={rect} />);
    const moveLeft = container.querySelector('.compact-window-move-left') as HTMLElement;
    fireEvent.pointerDown(moveLeft, { pointerId: 1, clientX: 100, clientY: 100, button: 0 });
    fireEvent.pointerMove(moveLeft, { pointerId: 1, clientX: 200, clientY: 200 });
    expect(ModalService.isCompactWindowInteracting()).toBe(true);
    fireEvent.pointerCancel(moveLeft, { pointerId: 1 });
    expect(ModalService.isCompactWindowInteracting()).toBe(false);
  });

  test('lostpointercapture on the band-drag root also ends the gesture cleanly', () => {
    const id = openManagedWindow();
    const rect = defaultBounds();
    const { container } = render(<Panel id={id} rect={rect} />);
    const root = container.querySelector('.modalRoot') as HTMLElement;
    const panel = container.querySelector('.modal-content-wrapper') as HTMLElement;
    const bandY = rect.y + modalLayout.resizeEdge + 2;
    const bandX = rect.x + rect.width / 2;
    fireEvent.pointerDown(panel, { pointerId: 5, clientX: bandX, clientY: bandY, button: 0 });
    fireEvent.pointerMove(root, { pointerId: 5, clientX: bandX + 25, clientY: bandY + 15 });
    expect(ModalService.isCompactWindowInteracting()).toBe(true);
    fireEvent(root, new Event('lostpointercapture', { bubbles: false }));
    expect(ModalService.isCompactWindowInteracting()).toBe(false);
  });
});

describe('rear (inactive) window "bring to front" click', () => {
  test('clicking the stack-activate button on an inactive window brings it to front without moving it', () => {
    openManagedWindow();
    const rear = openManagedWindow();
    ModalService.setStackingEnabled(true);
    const rect = { x: 0, y: 0, width: 400, height: 400 };
    const { container } = render(<Panel id={rear} rect={rect} active={false} rear />);
    const button = container.querySelector('.modal-stack-activate') as HTMLElement;

    fireEvent.pointerDown(button, { pointerId: 3, clientX: 10, clientY: 10, button: 0 });
    fireEvent.pointerUp(button, { pointerId: 3, clientX: 10, clientY: 10, button: 0 });

    expect(ModalService.getBamIds().at(-1)).toBe(rear);
    expect(ModalService.getCompactWindowBounds(rear)).toBeUndefined();
  });
});

describe('hover without dragging (band highlight)', () => {
  test('moving the pointer over the title band without pressing toggles the hover class, and pointerleave clears it', () => {
    const id = openManagedWindow();
    const rect = defaultBounds();
    const { container } = render(<Panel id={id} rect={rect} />);
    const root = container.querySelector('.modalRoot') as HTMLElement;
    const panel = container.querySelector('.modal-content-wrapper') as HTMLElement;
    const bandY = rect.y + modalLayout.resizeEdge + 2;
    const bandX = rect.x + rect.width / 2;

    // The root-level listener keys off event.target, so events must originate
    // on/within the measured panel (bubbling to the root), not on the root itself.
    fireEvent.pointerMove(panel, { pointerId: 7, clientX: bandX, clientY: bandY });
    expect(root.classList.contains('modalRoot-band-hover')).toBe(true);

    fireEvent.pointerMove(panel, { pointerId: 7, clientX: rect.x + rect.width / 2, clientY: rect.y + rect.height / 2 });
    expect(root.classList.contains('modalRoot-band-hover')).toBe(false);
  });

  test('pointerleave always clears the hover class', () => {
    const id = openManagedWindow();
    const rect = defaultBounds();
    const { container } = render(<Panel id={id} rect={rect} />);
    const root = container.querySelector('.modalRoot') as HTMLElement;
    const panel = container.querySelector('.modal-content-wrapper') as HTMLElement;
    const bandY = rect.y + modalLayout.resizeEdge + 2;
    const bandX = rect.x + rect.width / 2;
    fireEvent.pointerMove(panel, { pointerId: 7, clientX: bandX, clientY: bandY });
    expect(root.classList.contains('modalRoot-band-hover')).toBe(true);
    fireEvent.pointerLeave(root, { pointerId: 7 });
    expect(root.classList.contains('modalRoot-band-hover')).toBe(false);
  });
});

describe('viewport resize while active', () => {
  test('a window resize refits the active compact window to the viewport', () => {
    const id = openManagedWindow();
    const rect = defaultBounds();
    render(<Panel id={id} rect={rect} active />);
    const spy = vi.spyOn(ModalService, 'fitCompactWindowToViewport');
    fireEvent(window, new Event('resize'));
    expect(spy).toHaveBeenCalledWith(id);
  });

  test('an inactive (rear) window does not listen for resize', () => {
    const id = openManagedWindow();
    const rect = defaultBounds();
    render(<Panel id={id} rect={rect} active={false} />);
    const spy = vi.spyOn(ModalService, 'fitCompactWindowToViewport');
    fireEvent(window, new Event('resize'));
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('unmount cleanup', () => {
  test('unmounting mid-drag clears interacting state, band-hover and drop-target classes', () => {
    const id = openManagedWindow();
    const rect = defaultBounds();
    const { container, unmount } = render(<Panel id={id} rect={rect} />);
    const root = container.querySelector('.modalRoot') as HTMLElement;
    const moveLeft = container.querySelector('.compact-window-move-left') as HTMLElement;
    fireEvent.pointerDown(moveLeft, { pointerId: 1, clientX: 100, clientY: 100, button: 0 });
    fireEvent.pointerMove(moveLeft, { pointerId: 1, clientX: 200, clientY: 200 });
    expect(ModalService.isCompactWindowInteracting()).toBe(true);
    unmount();
    expect(ModalService.isCompactWindowInteracting()).toBe(false);
    expect(root.classList.contains('modalRoot-band-hover')).toBe(false);
  });
});
