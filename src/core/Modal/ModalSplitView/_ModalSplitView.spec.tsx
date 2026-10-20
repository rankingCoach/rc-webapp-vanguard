import { act, cleanup, fireEvent, render } from '@test-utils/test-utils';
import React from 'react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { ModalSplitView, ModalSplitViewResize, SplitViewElement } from './ModalSplitView';
import {
  ARM_DELAY_MS,
  CLOSE_PULL,
  clampSplitWidth,
  isPulledToClose,
  rubberBand,
  tabOffsetFor,
} from './use-split-view-resize';

const setInnerWidth = (value: number) => {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value,
  });
};

const elements: [SplitViewElement, SplitViewElement] = [
  {
    fullWidth: '100%',
    contractedWidth: '25%',
    component: <div data-testid="left-panel">LEFT</div>,
  },
  {
    fullWidth: '75%',
    contractedWidth: '75%',
    component: <div data-testid="right-panel">RIGHT</div>,
  },
];

describe('ModalSplitView', () => {
  beforeEach(() => {
    setInnerWidth(1200);
  });

  afterEach(() => {
    cleanup();
  });

  describe('basic rendering', () => {
    test('renders with null elements', () => {
      const { container } = render(<ModalSplitView isContracted={true} elements={[null, null]} />);
      expect(container.querySelector('.SplitView-left-component')).not.toBeNull();
      expect(container.querySelector('.SplitView-right-component')).not.toBeNull();
    });

    test('renders left and right components', () => {
      const { getByTestId } = render(<ModalSplitView isContracted={true} elements={elements} />);
      expect(getByTestId('left-panel')).not.toBeNull();
      expect(getByTestId('right-panel')).not.toBeNull();
    });
  });

  describe('left-overlay mode (default)', () => {
    test('right panel sits beside left using contractedWidth as left offset', () => {
      const { container } = render(<ModalSplitView isContracted={true} elements={elements} />);
      const right = container.querySelector('.SplitView-right-component') as HTMLElement;
      expect(right.style.left).toBe('25%');
      expect(right.style.width).toBe('75%');
    });

    test('right panel has no overlay modifier classes', () => {
      const { container } = render(<ModalSplitView isContracted={true} elements={elements} />);
      const right = container.querySelector('.SplitView-right-component') as HTMLElement;
      expect(right.className).not.toContain('SplitView-right-component--overlay');
      expect(right.className).not.toContain('SplitView-right-component--with-bottom-margin');
    });

    test('explicit collapseMode="left-overlay" matches default', () => {
      const { container } = render(
        <ModalSplitView isContracted={true} collapseMode="left-overlay" elements={elements} />,
      );
      const right = container.querySelector('.SplitView-right-component') as HTMLElement;
      expect(right.style.left).toBe('25%');
      expect(right.className).not.toContain('SplitView-right-component--overlay');
    });

    test('renders when isContracted=false (right hidden via opacity spring)', () => {
      const { container, getByTestId } = render(<ModalSplitView isContracted={false} elements={elements} />);
      const right = container.querySelector('.SplitView-right-component') as HTMLElement;
      expect(getByTestId('right-panel')).not.toBeNull();
      expect(right.style.left).toBe('25%');
    });
  });

  describe('right-overlay mode — above autoCloseWidth (desktop)', () => {
    test('behaves like left-overlay side-by-side when no autoCloseWidth set', () => {
      const { container } = render(
        <ModalSplitView isContracted={true} collapseMode="right-overlay" elements={elements} />,
      );
      const right = container.querySelector('.SplitView-right-component') as HTMLElement;
      expect(right.className).not.toContain('SplitView-right-component--overlay');
      expect(right.style.left).toBe('25%');
      expect(right.style.width).toBe('75%');
    });

    test('side-by-side when window width >= autoCloseWidth', () => {
      setInnerWidth(1200);
      const { container } = render(
        <ModalSplitView isContracted={true} collapseMode="right-overlay" autoCloseWidth={850} elements={elements} />,
      );
      const right = container.querySelector('.SplitView-right-component') as HTMLElement;
      expect(right.className).not.toContain('SplitView-right-component--overlay');
      expect(right.style.left).toBe('25%');
      expect(right.style.width).toBe('75%');
    });
  });

  describe('right-overlay mode — below autoCloseWidth (mobile)', () => {
    beforeEach(() => {
      setInnerWidth(500);
    });

    test('applies overlay modifier class', () => {
      const { container } = render(
        <ModalSplitView isContracted={true} collapseMode="right-overlay" autoCloseWidth={850} elements={elements} />,
      );
      const right = container.querySelector('.SplitView-right-component') as HTMLElement;
      expect(right.className).toContain('SplitView-right-component--overlay');
    });

    test('right panel covers full width anchored to right edge', () => {
      const { container } = render(
        <ModalSplitView isContracted={true} collapseMode="right-overlay" autoCloseWidth={850} elements={elements} />,
      );
      const right = container.querySelector('.SplitView-right-component') as HTMLElement;
      expect(right.style.right).toBe('0px');
      expect(right.style.width).toBe('100%');
    });

    test('right panel takes full height when no bottomMargin', () => {
      const { container } = render(
        <ModalSplitView isContracted={true} collapseMode="right-overlay" autoCloseWidth={850} elements={elements} />,
      );
      const right = container.querySelector('.SplitView-right-component') as HTMLElement;
      expect(right.style.bottom).toBe('0px');
      expect(right.style.height).toBe('100vh');
      expect(right.className).not.toContain('SplitView-right-component--with-bottom-margin');
    });

    test('applies bottom margin styles and modifier class', () => {
      const { container } = render(
        <ModalSplitView
          isContracted={true}
          collapseMode="right-overlay"
          autoCloseWidth={850}
          bottomMargin="150px"
          elements={elements}
        />,
      );
      const right = container.querySelector('.SplitView-right-component') as HTMLElement;
      expect(right.className).toContain('SplitView-right-component--with-bottom-margin');
      expect(right.style.bottom).toBe('150px');
      expect(right.style.height).toBe('calc(100vh - 150px)');
    });

    test('overlay class is driven by viewport, not isContracted', () => {
      const { container } = render(
        <ModalSplitView isContracted={false} collapseMode="right-overlay" autoCloseWidth={850} elements={elements} />,
      );
      const right = container.querySelector('.SplitView-right-component') as HTMLElement;
      expect(right.className).toContain('SplitView-right-component--overlay');
      expect(right.style.width).toBe('100%');
    });
  });

  describe('left element background color', () => {
    test('uses element backgroundColor when provided', () => {
      const elementsWithBg: [SplitViewElement, SplitViewElement] = [
        {
          fullWidth: '100%',
          contractedWidth: '25%',
          backgroundColor: 'rgb(255, 0, 0)',
          component: <div>LEFT</div>,
        },
        null,
      ];
      const { container } = render(<ModalSplitView isContracted={true} elements={elementsWithBg} />);
      const left = container.querySelector('.SplitView-left-component') as HTMLElement;
      expect(left.style.backgroundColor).toBe('rgb(255, 0, 0)');
    });
  });

  describe('window resize', () => {
    test('left-overlay variant initial width is driven by shared useWindowResize hook', () => {
      // Below autoCloseWidth: window too narrow, isOpen=false → left spring targets fullWidth.
      setInnerWidth(500);
      const narrow = render(<ModalSplitView isContracted={true} autoCloseWidth={850} elements={elements} />);
      const leftNarrow = narrow.container.querySelector('.SplitView-left-component') as HTMLElement;
      expect(leftNarrow.style.width).toBe('100%');
      narrow.unmount();

      // Above autoCloseWidth: isOpen=true → left spring targets contractedWidth synchronously on mount.
      setInnerWidth(1200);
      const wide = render(<ModalSplitView isContracted={true} autoCloseWidth={850} elements={elements} />);
      const leftWide = wide.container.querySelector('.SplitView-left-component') as HTMLElement;
      expect(leftWide.style.width).toBe('25%');
    });

    test('switches between side-by-side and overlay on resize', () => {
      setInnerWidth(1200);
      const { container, rerender } = render(
        <ModalSplitView isContracted={true} collapseMode="right-overlay" autoCloseWidth={850} elements={elements} />,
      );
      let right = container.querySelector('.SplitView-right-component') as HTMLElement;
      expect(right.className).not.toContain('SplitView-right-component--overlay');

      setInnerWidth(500);
      window.dispatchEvent(new Event('resize'));
      rerender(
        <ModalSplitView isContracted={true} collapseMode="right-overlay" autoCloseWidth={850} elements={elements} />,
      );
      right = container.querySelector('.SplitView-right-component') as HTMLElement;
      expect(right.className).toContain('SplitView-right-component--overlay');
    });
  });
});

describe('split view resize — pure maths', () => {
  test('clampSplitWidth rounds and keeps the width between the limits', () => {
    expect(clampSplitWidth(300, 420, 640)).toBe(420);
    expect(clampSplitWidth(700, 420, 640)).toBe(640);
    expect(clampSplitWidth(500.4, 420, 640)).toBe(500);
    expect(clampSplitWidth(500.6, 420, 640)).toBe(501);
    expect(clampSplitWidth(500, 420, 420)).toBe(420);
  });

  test('rubberBand is signed, grows slowly and never reaches its 44px cap', () => {
    expect(rubberBand(0)).toBe(0);
    expect(rubberBand(70)).toBeCloseTo(44 * (1 - Math.exp(-1)), 5);
    expect(rubberBand(-70)).toBeCloseTo(-rubberBand(70), 5);
    expect(rubberBand(140)).toBeGreaterThan(rubberBand(70));
    expect(rubberBand(140) - rubberBand(70)).toBeLessThan(rubberBand(70) - rubberBand(0));
    expect(rubberBand(10000)).toBeLessThanOrEqual(44);
  });

  test('tabOffsetFor holds the lean within the limits, stretches past the narrowest, leans out past the widest', () => {
    expect(tabOffsetFor(0, 12)).toBe(12);
    expect(tabOffsetFor(0, -12)).toBe(-12);
    expect(tabOffsetFor(0, 0)).toBe(0);
    // Past the narrowest: never back from the 12px lean first, then the band
    expect(tabOffsetFor(5, 0)).toBe(12);
    expect(tabOffsetFor(100, 0)).toBeCloseTo(rubberBand(100), 5);
    expect(tabOffsetFor(100, -12)).toBeCloseTo(rubberBand(100), 5);
    // Past the widest: out of the panel, whatever the lean
    expect(tabOffsetFor(-30, 12)).toBe(-12);
    expect(tabOffsetFor(-30, 0)).toBe(-12);
  });

  test('isPulledToClose needs the narrowest width and CLOSE_PULL past it', () => {
    expect(isPulledToClose(420, 420, CLOSE_PULL)).toBe(true);
    expect(isPulledToClose(420, 420, CLOSE_PULL + 100)).toBe(true);
    expect(isPulledToClose(420, 420, CLOSE_PULL - 1)).toBe(false);
    expect(isPulledToClose(421, 420, CLOSE_PULL + 100)).toBe(false);
    expect(isPulledToClose(420, 420, -50)).toBe(false);
  });
});

describe('ModalSplitView resize (right-overlay, animateOnSlideEnd)', () => {
  const SPLIT_WIDTH = 1000;
  const MIN_WIDTH = 420;
  const MIN_OTHER_WIDTH = 360;
  const MAX_WIDTH = SPLIT_WIDTH - MIN_OTHER_WIDTH;
  /** The pointer x that puts the visible edge at `edgeWidth` from the split's right edge */
  const pointerAtWidth = (edgeWidth: number) => SPLIT_WIDTH - edgeWidth;
  /** The value as jsdom's CSSOM keeps it: it re-serialises clamp() with the commas mangled, whatever a browser does. */
  const asJsdom = (property: 'width' | 'left', value: string) => {
    const probe = document.createElement('div');
    probe.style[property] = value;
    return probe.style[property];
  };
  const rightWidthCss = (px: number) =>
    asJsdom('width', `clamp(${MIN_WIDTH}px, ${px}px, calc(100% - ${MIN_OTHER_WIDTH}px))`);
  const leftOfRightCss = (px: number) =>
    asJsdom('left', `calc(100% - clamp(${MIN_WIDTH}px, ${px}px, calc(100% - ${MIN_OTHER_WIDTH}px)))`);

  const rectOf = (left: number, width: number): DOMRect =>
    ({
      x: left,
      y: 0,
      left,
      top: 0,
      right: left + width,
      bottom: 800,
      width,
      height: 800,
      toJSON: () => ({}),
    }) as DOMRect;

  // jsdom has no layout and no PointerEvent: give the split its width, the panels their offsetParent, and the
  // pointer events their coordinates.
  let panelOffsetWidth = 0;
  const original = {
    pointerEvent: (globalThis as any).PointerEvent,
    setPointerCapture: Element.prototype.setPointerCapture,
    // jsdom's own: put back as they were, not deleted
    offsetParent: Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent'),
    offsetWidth: Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth'),
  };

  beforeAll(() => {
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
    Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
      configurable: true,
      get(this: HTMLElement) {
        return this.parentElement;
      },
    });
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      get() {
        return panelOffsetWidth;
      },
    });
  });

  afterAll(() => {
    (globalThis as any).PointerEvent = original.pointerEvent;
    Element.prototype.setPointerCapture = original.setPointerCapture;
    for (const key of ['offsetParent', 'offsetWidth'] as const) {
      const descriptor = original[key];
      if (descriptor) Object.defineProperty(HTMLElement.prototype, key, descriptor);
      else delete (HTMLElement.prototype as any)[key];
    }
  });

  beforeEach(() => {
    setInnerWidth(1200);
    panelOffsetWidth = 0;
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    document.body.innerHTML = '';
  });

  const ui = (
    props: Partial<React.ComponentProps<typeof ModalSplitView>> = {},
    resize?: Partial<ModalSplitViewResize>,
  ) => (
    <ModalSplitView
      isContracted={true}
      collapseMode="right-overlay"
      animateOnSlideEnd
      autoCloseWidth={850}
      elements={elements}
      resize={{
        minWidth: MIN_WIDTH,
        minOtherWidth: MIN_OTHER_WIDTH,
        onCloseByDrag: () => {},
        ariaLabel: 'Resize panel',
        ...resize,
      }}
      {...props}
    />
  );

  /** Renders into a split root 1000px wide, the right panel's offsetParent. */
  const renderSplit = (element: React.ReactElement) => {
    const root = document.createElement('div');
    document.body.appendChild(root);
    Object.defineProperty(root, 'clientWidth', { configurable: true, value: SPLIT_WIDTH });
    root.getBoundingClientRect = () => rectOf(0, SPLIT_WIDTH);
    const utils = render(element, { container: root });
    const query = (selector: string) => root.querySelector(selector) as HTMLElement;
    return {
      ...utils,
      root,
      left: () => query('.SplitView-left-component'),
      right: () => query('.SplitView-right-component'),
      rail: () => root.querySelector('.SplitView-edge-rail') as HTMLElement | null,
      handle: () => utils.getByRole('separator'),
    };
  };

  /** Grabs the handle at `clientX`, its visible edge at `edgeX` (by default right under the pointer). */
  const pointerDown = (el: HTMLElement, clientX: number, edgeX = clientX) => {
    // The handle is the 12px strip centred on the visible edge
    el.getBoundingClientRect = () => rectOf(edgeX - 6, 12);
    return fireEvent.pointerDown(el, { button: 0, pointerId: 1, clientX, clientY: 300 });
  };
  const pointerMove = (el: HTMLElement, clientX: number) =>
    fireEvent.pointerMove(el, { pointerId: 1, clientX, clientY: 300 });
  const pointerUp = (el: HTMLElement) => fireEvent.pointerUp(el, { pointerId: 1 });
  /** The window to `width`, as useWindowResize hears it */
  const resizeWindow = (width: number) =>
    act(() => {
      setInnerWidth(width);
      window.dispatchEvent(new Event('resize'));
    });

  /** Drags the edge to `edgeWidth` and lets go. */
  const dragTo = (el: HTMLElement, edgeWidth: number) => {
    pointerDown(el, pointerAtWidth(MAX_WIDTH));
    pointerMove(el, pointerAtWidth(edgeWidth));
    pointerUp(el);
  };

  describe('what it needs', () => {
    test('renders no handle and no rail without `resize`', () => {
      const { container, queryByRole } = render(
        <ModalSplitView
          isContracted={true}
          collapseMode="right-overlay"
          animateOnSlideEnd
          autoCloseWidth={850}
          elements={elements}
        />,
      );
      expect(queryByRole('separator')).toBeNull();
      expect(container.querySelector('.SplitView-edge-rail')).toBeNull();
      const right = container.querySelector('.SplitView-right-component') as HTMLElement;
      expect(right.style.left).toBe('25%');
      expect(right.style.width).toBe('75%');
      expect(right.className).not.toContain('--resizing');
    });

    test('is not honoured without animateOnSlideEnd', () => {
      const { queryByRole, container } = render(ui({ animateOnSlideEnd: false }));
      expect(queryByRole('separator')).toBeNull();
      expect(container.querySelector('.SplitView-edge-rail')).toBeNull();
    });

    test('is not honoured on mobile (below autoCloseWidth)', () => {
      setInnerWidth(500);
      const { queryByRole, container } = render(ui());
      expect(queryByRole('separator')).toBeNull();
      expect(container.querySelector('.SplitView-edge-rail')).toBeNull();
    });
  });

  describe('the handle', () => {
    test('is a focusable vertical separator with its limits in px', () => {
      panelOffsetWidth = 750;
      const { handle } = renderSplit(ui());
      expect(handle().getAttribute('aria-orientation')).toBe('vertical');
      expect(handle().getAttribute('aria-label')).toBe('Resize panel');
      expect(handle().tabIndex).toBe(0);
      expect(handle().getAttribute('aria-valuemin')).toBe(String(MIN_WIDTH));
      expect(handle().getAttribute('aria-valuemax')).toBe(String(MAX_WIDTH));
      // Not dragged yet: the default layout's width
      expect(handle().getAttribute('aria-valuenow')).toBe('750');
    });

    test('rides the edge rail, which shares the right panel left, width and transform', () => {
      const { rail, right, handle } = renderSplit(ui());
      expect(rail()?.contains(handle())).toBe(true);
      expect(right().contains(handle())).toBe(false);
      expect(rail()?.style.left).toBe(right().style.left);
      expect(rail()?.style.width).toBe(right().style.width);
      expect(rail()?.style.transform).toBe(right().style.transform);
    });

    test('is inert while the panel is closed, and back when it opens', () => {
      const { rerender, handle } = renderSplit(ui({ isContracted: false }));
      expect(handle().hasAttribute('inert')).toBe(true);
      rerender(ui({ isContracted: true }));
      expect(handle().hasAttribute('inert')).toBe(false);
    });

    test('sits on the visible edge: edgeOffset moves it into the rail', () => {
      const { handle } = renderSplit(ui({}, { edgeOffset: 8 }));
      expect(handle().style.getPropertyValue('--edge-offset')).toBe('8px');
    });
  });

  describe('dragging', () => {
    test('the edge follows the pointer: the right panel takes the width, the left what is left', () => {
      const { handle, left, right } = renderSplit(ui());
      pointerDown(handle(), pointerAtWidth(750));
      pointerMove(handle(), pointerAtWidth(500));
      expect(right().style.width).toBe(rightWidthCss(500));
      expect(right().style.left).toBe(leftOfRightCss(500));
      expect(left().style.width).toBe(
        asJsdom('width', `calc(100% - clamp(${MIN_WIDTH}px, 500px, calc(100% - ${MIN_OTHER_WIDTH}px)))`),
      );
      expect(handle().getAttribute('aria-valuenow')).toBe('500');
      pointerUp(handle());
      // Let go: the width stays
      expect(right().style.width).toBe(rightWidthCss(500));
    });

    test('edgeOffset keeps the visible edge under the pointer', () => {
      const { handle, right } = renderSplit(ui({}, { edgeOffset: 8 }));
      pointerDown(handle(), pointerAtWidth(750));
      pointerMove(handle(), pointerAtWidth(500));
      // The panel's own left edge is 8px further left than the pointer
      expect(right().style.width).toBe(rightWidthCss(508));
      pointerUp(handle());
    });

    test('stops at the limits', () => {
      const { handle, right } = renderSplit(ui());
      pointerDown(handle(), pointerAtWidth(750));
      pointerMove(handle(), pointerAtWidth(100));
      expect(right().style.width).toBe(rightWidthCss(MIN_WIDTH));
      pointerMove(handle(), pointerAtWidth(2000));
      expect(right().style.width).toBe(rightWidthCss(MAX_WIDTH));
      pointerUp(handle());
    });

    test('marks the right panel and the body while dragging, and cleans up on release', () => {
      const { handle, right } = renderSplit(ui());
      pointerDown(handle(), pointerAtWidth(750));
      expect(right().className).toContain('SplitView-right-component--resizing');
      expect(document.body.style.cursor).toBe('col-resize');
      expect(handle().getAttribute('data-tab')).toBe('drag');
      pointerUp(handle());
      expect(right().className).not.toContain('SplitView-right-component--resizing');
      expect(document.body.style.cursor).toBe('');
      expect(handle().getAttribute('data-tab')).not.toBe('drag');
    });

    test('grabbed off the edge, the edge keeps its distance from the pointer instead of jumping under it', () => {
      const { handle, right } = renderSplit(ui());
      // 15px into the panel (the safe area round the tab)
      pointerDown(handle(), pointerAtWidth(600) + 15, pointerAtWidth(600));
      pointerMove(handle(), pointerAtWidth(600) + 16);
      expect(right().style.width).toBe(rightWidthCss(599));
      pointerMove(handle(), pointerAtWidth(500) + 15);
      expect(right().style.width).toBe(rightWidthCss(500));
      pointerUp(handle());
    });

    test('cleans the body up when it unmounts mid-drag', () => {
      const { handle, unmount } = renderSplit(ui());
      pointerDown(handle(), pointerAtWidth(750));
      expect(document.body.style.cursor).toBe('col-resize');
      unmount();
      expect(document.body.style.cursor).toBe('');
    });

    test('ends when the window goes down to mobile mid-drag (the handle goes, with its pointerup)', () => {
      const { handle, right, queryByRole } = renderSplit(ui());
      pointerDown(handle(), pointerAtWidth(750));
      resizeWindow(500);
      expect(queryByRole('separator')).toBeNull();
      expect(document.body.style.cursor).toBe('');
      expect(document.body.style.userSelect).toBe('');
      expect(right().className).not.toContain('--resizing');
      resizeWindow(1200);
      expect(handle().getAttribute('data-tab')).toBe('idle');
    });

    test('ends when the consumer turns resize off mid-drag', () => {
      const { handle, right, rerender } = renderSplit(ui());
      pointerDown(handle(), pointerAtWidth(750));
      rerender(ui({ resize: undefined }));
      expect(document.body.style.cursor).toBe('');
      expect(right().className).not.toContain('--resizing');
    });

    test('ends, without closing, when the handle loses the pointer capture', () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      const onCloseByDrag = vi.fn();
      const { handle, right } = renderSplit(ui({}, { onCloseByDrag }));
      pointerDown(handle(), pointerAtWidth(750));
      pointerMove(handle(), pointerAtWidth(MIN_WIDTH - CLOSE_PULL));
      act(() => {
        vi.advanceTimersByTime(ARM_DELAY_MS);
      });
      expect(handle().getAttribute('data-tab')).toBe('armed');
      fireEvent.lostPointerCapture(handle(), { pointerId: 1 });
      expect(onCloseByDrag).not.toHaveBeenCalled();
      expect(document.body.style.cursor).toBe('');
      expect(right().className).not.toContain('--resizing');
      // …and the moves after it no longer drag
      pointerMove(handle(), pointerAtWidth(600));
      expect(right().style.width).toBe(rightWidthCss(MIN_WIDTH));
    });

    test('captures the pointer, so an iframe in the panel cannot take the moves', () => {
      const { handle } = renderSplit(ui());
      pointerDown(handle(), pointerAtWidth(750));
      expect(Element.prototype.setPointerCapture).toHaveBeenCalledWith(1);
      pointerUp(handle());
    });

    test('ignores a pointer that is not the main button', () => {
      const { handle, right } = renderSplit(ui());
      fireEvent.pointerDown(handle(), { button: 2, pointerId: 1, clientX: pointerAtWidth(750) });
      expect(right().className).not.toContain('--resizing');
    });
  });

  describe('close by drag', () => {
    const pullPastMinimum = (el: HTMLElement) => {
      pointerDown(el, pointerAtWidth(750));
      pointerMove(el, pointerAtWidth(MIN_WIDTH - CLOSE_PULL));
    };

    test('held past the minimum for ARM_DELAY_MS it arms, and letting go closes once', () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      const onCloseByDrag = vi.fn();
      const { handle } = renderSplit(ui({}, { onCloseByDrag }));
      pullPastMinimum(handle());
      expect(handle().getAttribute('data-tab')).toBe('drag');
      act(() => {
        vi.advanceTimersByTime(ARM_DELAY_MS);
      });
      expect(handle().getAttribute('data-tab')).toBe('armed');
      expect(onCloseByDrag).not.toHaveBeenCalled();
      pointerUp(handle());
      expect(onCloseByDrag).toHaveBeenCalledTimes(1);
      act(() => {
        vi.runOnlyPendingTimers();
      });
      expect(onCloseByDrag).toHaveBeenCalledTimes(1);
    });

    test('letting go before the arm delay does not close', () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      const onCloseByDrag = vi.fn();
      const { handle } = renderSplit(ui({}, { onCloseByDrag }));
      pullPastMinimum(handle());
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(handle().getAttribute('data-tab')).toBe('drag');
      pointerUp(handle());
      act(() => {
        vi.runOnlyPendingTimers();
      });
      expect(onCloseByDrag).not.toHaveBeenCalled();
      expect(handle().getAttribute('data-tab')).not.toBe('armed');
    });

    test('pulling back before the arm delay cancels it', () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      const onCloseByDrag = vi.fn();
      const { handle } = renderSplit(ui({}, { onCloseByDrag }));
      pullPastMinimum(handle());
      act(() => {
        vi.advanceTimersByTime(200);
      });
      pointerMove(handle(), pointerAtWidth(MIN_WIDTH + 100));
      act(() => {
        vi.advanceTimersByTime(ARM_DELAY_MS);
      });
      expect(handle().getAttribute('data-tab')).toBe('drag');
      pointerUp(handle());
      expect(onCloseByDrag).not.toHaveBeenCalled();
    });

    test('less than CLOSE_PULL past the minimum never arms', () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      const onCloseByDrag = vi.fn();
      const { handle } = renderSplit(ui({}, { onCloseByDrag }));
      pointerDown(handle(), pointerAtWidth(750));
      pointerMove(handle(), pointerAtWidth(MIN_WIDTH - CLOSE_PULL + 1));
      act(() => {
        vi.advanceTimersByTime(ARM_DELAY_MS * 2);
      });
      pointerUp(handle());
      expect(onCloseByDrag).not.toHaveBeenCalled();
    });

    test('an interrupted drag (pointercancel) while armed does not close', () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      const onCloseByDrag = vi.fn();
      const { handle } = renderSplit(ui({}, { onCloseByDrag }));
      pullPastMinimum(handle());
      act(() => {
        vi.advanceTimersByTime(ARM_DELAY_MS);
      });
      fireEvent.pointerCancel(handle(), { pointerId: 1 });
      expect(onCloseByDrag).not.toHaveBeenCalled();
      expect(handle().getAttribute('data-tab')).not.toBe('armed');
    });
  });

  describe('the dragged width', () => {
    test('lasts through a plain close and open', () => {
      const { handle, right, rerender } = renderSplit(ui());
      dragTo(handle(), 500);
      rerender(ui({ isContracted: false }));
      expect(right().style.width).toBe(rightWidthCss(500));
      rerender(ui({ isContracted: true }));
      expect(right().style.width).toBe(rightWidthCss(500));
    });

    test('goes on the next open after a close by drag, not while the panel slides out', () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      const { handle, right, left, rerender } = renderSplit(ui());
      pointerDown(handle(), pointerAtWidth(750));
      pointerMove(handle(), pointerAtWidth(MIN_WIDTH - CLOSE_PULL));
      act(() => {
        vi.advanceTimersByTime(ARM_DELAY_MS);
      });
      pointerUp(handle());
      // The consumer closes the panel: it leaves at the width it was pulled to
      rerender(ui({ isContracted: false }));
      expect(right().style.width).toBe(rightWidthCss(MIN_WIDTH));
      // …and the left panel's own width is back with its spring, not the dragged split
      expect(left().style.width).not.toContain('clamp');
      rerender(ui({ isContracted: true }));
      expect(right().style.width).toBe('75%');
      expect(right().style.left).toBe('25%');
    });

    test('goes at once when resetKey changes while the panel is open', () => {
      const { handle, right, rerender } = renderSplit(ui({}, { resetKey: 'a' }));
      dragTo(handle(), 500);
      expect(right().style.width).toBe(rightWidthCss(500));
      rerender(ui({}, { resetKey: 'b' }));
      expect(right().style.width).toBe('75%');
    });

    test('goes on the next open when resetKey changes while the panel is closed', () => {
      const { handle, right, rerender } = renderSplit(ui({}, { resetKey: 'a' }));
      dragTo(handle(), 500);
      rerender(ui({ isContracted: false }, { resetKey: 'a' }));
      rerender(ui({ isContracted: false }, { resetKey: 'b' }));
      expect(right().style.width).toBe(rightWidthCss(500));
      rerender(ui({ isContracted: true }, { resetKey: 'b' }));
      expect(right().style.width).toBe('75%');
    });

    test('keeps it when resetKey stays the same', () => {
      const { handle, right, rerender } = renderSplit(ui({}, { resetKey: 'a' }));
      dragTo(handle(), 500);
      rerender(ui({ isContracted: false }, { resetKey: 'a' }));
      rerender(ui({ isContracted: true }, { resetKey: 'a' }));
      expect(right().style.width).toBe(rightWidthCss(500));
    });

    test.each([
      ['with a resetKey', { resetKey: 'a' }],
      ['without one', {}],
    ])('lasts through a trip to mobile and back, %s', (_, resize) => {
      const { handle, right } = renderSplit(ui({}, resize));
      dragTo(handle(), 500);
      resizeWindow(500);
      resizeWindow(1200);
      expect(right().style.width).toBe(rightWidthCss(500));
    });

    test('goes on a double click, back to the default split', () => {
      const { handle, right, left } = renderSplit(ui());
      dragTo(handle(), 500);
      expect(right().style.width).toBe(rightWidthCss(500));
      fireEvent.doubleClick(handle());
      expect(right().style.width).toBe('75%');
      expect(right().style.left).toBe('25%');
      expect(left().style.width).toBe('25%');
    });
  });

  describe('keyboard', () => {
    test('Home goes to the narrowest (aria-valuemin), End to the widest (aria-valuemax)', () => {
      const { handle, right } = renderSplit(ui());
      fireEvent.keyDown(handle(), { key: 'Home' });
      expect(right().style.width).toBe(rightWidthCss(MIN_WIDTH));
      expect(handle().getAttribute('aria-valuenow')).toBe(handle().getAttribute('aria-valuemin'));
      fireEvent.keyDown(handle(), { key: 'End' });
      expect(right().style.width).toBe(rightWidthCss(MAX_WIDTH));
      expect(handle().getAttribute('aria-valuenow')).toBe(handle().getAttribute('aria-valuemax'));
    });

    test('left makes it 24px wider, right 24px narrower, within the limits', () => {
      panelOffsetWidth = 500;
      const { handle, right } = renderSplit(ui());
      fireEvent.keyDown(handle(), { key: 'ArrowLeft' });
      expect(right().style.width).toBe(rightWidthCss(524));
      panelOffsetWidth = 524;
      fireEvent.keyDown(handle(), { key: 'ArrowRight' });
      expect(right().style.width).toBe(rightWidthCss(500));
      panelOffsetWidth = 430;
      fireEvent.keyDown(handle(), { key: 'ArrowRight' });
      expect(right().style.width).toBe(rightWidthCss(MIN_WIDTH));
      panelOffsetWidth = 630;
      fireEvent.keyDown(handle(), { key: 'ArrowLeft' });
      expect(right().style.width).toBe(rightWidthCss(MAX_WIDTH));
    });

    test('other keys leave it alone', () => {
      const { handle, right } = renderSplit(ui());
      fireEvent.keyDown(handle(), { key: 'a' });
      expect(right().style.width).toBe('75%');
    });
  });

  describe('the tab near the edge', () => {
    test('comes out as the pointer nears the edge and goes as it leaves, without a state change', () => {
      const { handle, right, left } = renderSplit(ui());
      right().getBoundingClientRect = () => rectOf(300, 700);
      fireEvent.pointerMove(right(), { clientX: 330, clientY: 100 });
      expect(handle().dataset.near).toBe('true');
      expect(handle().style.getPropertyValue('--mag-x')).not.toBe('');
      fireEvent.pointerMove(left(), { clientX: 100, clientY: 100 });
      expect(handle().dataset.near).toBe('false');
      // Within reach in x but not in the panel's height
      fireEvent.pointerMove(right(), { clientX: 330, clientY: 900 });
      expect(handle().dataset.near).toBe('false');
    });

    test('measures from the visible edge (edgeOffset)', () => {
      const { handle, right } = renderSplit(ui({}, { edgeOffset: 8 }));
      right().getBoundingClientRect = () => rectOf(300, 700);
      fireEvent.pointerMove(right(), { clientX: 347, clientY: 100 });
      expect(handle().dataset.near).toBe('true');
      fireEvent.pointerMove(right(), { clientX: 349, clientY: 100 });
      expect(handle().dataset.near).toBe('false');
    });

    test('far from the edge, moves over the panels neither measure the handle nor write to it', () => {
      const { handle, right, left } = renderSplit(ui());
      right().getBoundingClientRect = () => rectOf(300, 700);
      fireEvent.pointerMove(right(), { clientX: 330, clientY: 100 });
      const measure = vi.spyOn(handle(), 'getBoundingClientRect');
      const write = vi.spyOn(handle().style, 'setProperty');
      // The move that leaves puts the tab back to rest, once
      fireEvent.pointerMove(left(), { clientX: 100, clientY: 100 });
      expect(handle().style.getPropertyValue('--mag-x')).toBe('0px');
      expect(handle().style.getPropertyValue('--mag-y')).toBe('0px');
      expect(write).toHaveBeenCalledTimes(2);
      fireEvent.pointerMove(left(), { clientX: 120, clientY: 200 });
      fireEvent.pointerMove(right(), { clientX: 600, clientY: 300 });
      expect(measure).not.toHaveBeenCalled();
      expect(write).toHaveBeenCalledTimes(2);
    });

    test('stays near when the pointer moves from a panel onto the handle, and goes when it leaves for elsewhere', () => {
      const { handle, right } = renderSplit(ui());
      right().getBoundingClientRect = () => rectOf(300, 700);
      fireEvent.pointerMove(right(), { clientX: 310, clientY: 100 });
      fireEvent.pointerOut(right(), { relatedTarget: handle() });
      expect(handle().dataset.near).toBe('true');
      fireEvent.pointerOut(right(), { relatedTarget: document.body });
      expect(handle().dataset.near).toBe('false');
    });

    test('is darker on the handle (hover) and settles back when the pointer goes', () => {
      const { handle } = renderSplit(ui());
      fireEvent.pointerOver(handle());
      expect(handle().getAttribute('data-tab')).toBe('hover');
      fireEvent.pointerOut(handle());
      expect(handle().getAttribute('data-tab')).toBe('idle');
    });
  });

  describe('the divider FAB', () => {
    const collapseToggle = { onToggle: () => {} };

    test('without resize it stays as it was: out of the rail, open and closed', () => {
      const first = render(
        <ModalSplitView
          isContracted={true}
          collapseMode="right-overlay"
          animateOnSlideEnd
          autoCloseWidth={850}
          elements={elements}
          collapseToggle={collapseToggle}
        />,
      );
      expect(first.container.querySelector('.SplitView-collapse-fab')).not.toBeNull();
      expect(first.container.querySelector('.SplitView-edge-rail')).toBeNull();
      first.unmount();
      const second = render(
        <ModalSplitView
          isContracted={false}
          collapseMode="right-overlay"
          animateOnSlideEnd
          autoCloseWidth={850}
          elements={elements}
          collapseToggle={collapseToggle}
        />,
      );
      expect(second.container.querySelector('.SplitView-collapse-fab')).not.toBeNull();
      expect(second.container.querySelector('.SplitView-edge-rail')).toBeNull();
    });

    test('with resize it shows only while the panel is closed, on the edge rail', () => {
      const { rail, rerender } = renderSplit(ui({ collapseToggle }));
      expect(rail()?.querySelector('.SplitView-collapse-fab')).toBeNull();
      rerender(ui({ isContracted: false, collapseToggle }));
      expect(rail()?.querySelector('.SplitView-collapse-fab')).not.toBeNull();
      rerender(ui({ isContracted: true, collapseToggle }));
      expect(rail()?.querySelector('.SplitView-collapse-fab')).toBeNull();
    });
  });
});
