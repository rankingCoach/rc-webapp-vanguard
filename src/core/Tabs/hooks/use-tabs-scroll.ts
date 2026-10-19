import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

/** Selector for the tab buttons rendered directly inside the tablist. */
const TAB_SELECTOR = ':scope > [role="tab"]';

/** Pixel tolerance for sub-pixel rounding when comparing scroll positions. */
const EPSILON = 1;

export interface UseTabsScrollOptions {
  /** Value of the currently selected tab; the selected tab is scrolled into view whenever it changes. */
  currentValue: unknown;
  /**
   * Identity of the rendered tabs (e.g. their indices and values, in order). When it changes, the tabs are
   * re-measured, re-observed and the selected tab is scrolled back into view (tabs swapped or reordered).
   */
  layoutKey: string;
  /** Any extra value whose change should trigger a re-measure (e.g. the theme). */
  measureKey?: unknown;
}

export interface UseTabsScrollResult {
  /** Ref for the horizontally scrolling viewport. */
  scrollerRef: React.RefObject<HTMLDivElement | null>;
  /** Ref for the `role="tablist"` element inside the scroller. */
  listRef: React.RefObject<HTMLDivElement | null>;
  /** True when there is hidden content on the physical left of the viewport. */
  canScrollLeft: boolean;
  /** True when there is hidden content on the physical right of the viewport. */
  canScrollRight: boolean;
  /** True when the tabs overflow the scroller (either direction can scroll). */
  isOverflowing: boolean;
  /** `onScroll` handler for the scroller (rAF-throttled re-measure). */
  onScroll: () => void;
  /** Scrolls one "page" of whole tabs to the physical left. */
  scrollLeftward: () => void;
  /** Scrolls one "page" of whole tabs to the physical right. */
  scrollRightward: () => void;
}

const isRtl = (element: HTMLElement): boolean =>
  typeof window !== 'undefined' &&
  typeof window.getComputedStyle === 'function' &&
  window.getComputedStyle(element).direction === 'rtl';

const hasRaf = (): boolean => typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function';

const scrollScrollerTo = (scroller: HTMLElement, left: number, smooth: boolean): void => {
  if (typeof scroller.scrollTo === 'function') {
    try {
      scroller.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' });
      return;
    } catch {
      // Fall through to direct assignment (older engines / test environments).
    }
  }
  scroller.scrollLeft = left;
};

const getSelectedGeometry = (scroller: HTMLElement, selected: HTMLElement): string =>
  `${selected.offsetLeft}:${selected.offsetWidth}:${scroller.clientWidth}`;

const getTabElements = (list: HTMLElement | null): HTMLElement[] => {
  if (!list) {
    return [];
  }
  try {
    return Array.from(list.querySelectorAll<HTMLElement>(TAB_SELECTOR));
  } catch {
    return Array.from(list.children) as HTMLElement[];
  }
};

/**
 * Horizontal overflow handling for the tab bar: measures whether the tabs overflow, exposes scroll-button handlers
 * (scrolling by whole tabs, like MUI's `getScrollSize`) and keeps the selected tab inside the visible viewport.
 * All DOM APIs are feature-guarded so it is safe in jsdom/SSR.
 */
export const useTabsScroll = ({ currentValue, layoutKey, measureKey }: UseTabsScrollOptions): UseTabsScrollResult => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const hasScrolledSelectedRef = useRef(false);
  /** Geometry of the selected tab and viewport the last time it was scrolled into view. */
  const selectedGeometryRef = useRef('');

  const [scrollState, setScrollState] = useState({ left: false, right: false });

  // Physical (left/right) measurement. In RTL, modern browsers report `scrollLeft` from 0 (start, right edge)
  // down to -(scrollWidth - clientWidth) (end, left edge); in LTR it goes from 0 up to the maximum.
  const measure = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }
    const { scrollLeft, clientWidth, scrollWidth } = scroller;
    const maxScroll = Math.max(0, scrollWidth - clientWidth);
    const rtl = isRtl(scroller);
    const minLeft = rtl ? -maxScroll : 0;
    const maxLeft = rtl ? 0 : maxScroll;
    const left = scrollLeft > minLeft + EPSILON;
    const right = scrollLeft < maxLeft - EPSILON;
    setScrollState((prev) => (prev.left === left && prev.right === right ? prev : { left, right }));
  }, []);

  /** Keeps the selected tab inside the viewport via rect math; never uses scrollIntoView (would scroll the page). */
  const scrollSelectedIntoView = useCallback(() => {
    const scroller = scrollerRef.current;
    const list = listRef.current;
    if (!scroller || !list || typeof scroller.getBoundingClientRect !== 'function') {
      return;
    }
    const selected = getTabElements(list).find((tab) => tab.getAttribute('aria-selected') === 'true');
    if (!selected) {
      return;
    }
    selectedGeometryRef.current = getSelectedGeometry(scroller, selected);

    // Instant the first time (mount), smooth afterwards.
    const smooth = hasScrolledSelectedRef.current;
    hasScrolledSelectedRef.current = true;

    const scrollerRect = scroller.getBoundingClientRect();
    const tabRect = selected.getBoundingClientRect();
    let next: number | undefined;
    if (tabRect.left < scrollerRect.left) {
      next = scroller.scrollLeft + (tabRect.left - scrollerRect.left);
    } else if (tabRect.right > scrollerRect.right) {
      next = scroller.scrollLeft + (tabRect.right - scrollerRect.right);
    }
    if (next !== undefined) {
      scrollScrollerTo(scroller, next, smooth);
    }
  }, []);

  const onScroll = useCallback(() => {
    if (!hasRaf()) {
      measure();
      return;
    }
    if (rafRef.current !== null) {
      return;
    }
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      measure();
    });
  }, [measure]);

  // Measure synchronously after layout whenever the rendered tabs change.
  useLayoutEffect(() => {
    measure();
  }, [measure, layoutKey, measureKey]);

  // Re-measure (and keep the selected tab visible) on size changes of the scroller or of any tab. The tablist box
  // itself keeps the viewport width when its children overflow, so each tab is observed individually (labels
  // loading or changing with the same tab count). Re-subscribed whenever the rendered tabs change.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const handleResize = (): void => {
      measure();
      // Like MUI, only re-scroll when the selected tab itself (or the viewport) changed size/position, so a resize
      // of another tab (badge, late translation, icon load) does not yank the user back from where they scrolled.
      const list = listRef.current;
      const selected = getTabElements(list).find((tab) => tab.getAttribute('aria-selected') === 'true');
      if (scroller && selected && getSelectedGeometry(scroller, selected) !== selectedGeometryRef.current) {
        scrollSelectedIntoView();
      }
    };
    let observer: ResizeObserver | undefined;

    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(handleResize);
      if (scroller) {
        observer.observe(scroller);
      }
      getTabElements(listRef.current).forEach((tab) => observer?.observe(tab));
    }

    const hasWindow = typeof window !== 'undefined';
    if (hasWindow) {
      window.addEventListener('resize', handleResize);
    }

    return (): void => {
      observer?.disconnect();
      if (hasWindow) {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, [measure, scrollSelectedIntoView, layoutKey]);

  // Cancel any pending rAF on unmount.
  useEffect(
    () => (): void => {
      if (rafRef.current !== null && hasRaf()) {
        window.cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = null;
    },
    [],
  );

  /** Sum of the widths of the leading tabs that fully fit in the viewport (MUI `getScrollSize`). */
  const getScrollSize = useCallback((): number => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return 0;
    }
    const containerSize = scroller.clientWidth;
    let totalSize = 0;
    const tabs = getTabElements(listRef.current);
    for (let i = 0; i < tabs.length; i += 1) {
      const tabSize = tabs[i].clientWidth;
      if (totalSize + tabSize > containerSize) {
        if (i === 0) {
          totalSize = containerSize;
        }
        break;
      }
      totalSize += tabSize;
    }
    return totalSize;
  }, []);

  const moveBy = useCallback((delta: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }
    scrollScrollerTo(scroller, scroller.scrollLeft + delta, true);
  }, []);

  // Physical directions: decreasing `scrollLeft` always moves the viewport left, in LTR and RTL alike.
  const scrollLeftward = useCallback(() => moveBy(-getScrollSize()), [moveBy, getScrollSize]);
  const scrollRightward = useCallback(() => moveBy(getScrollSize()), [moveBy, getScrollSize]);

  // Keep the selected tab inside the viewport whenever the selection or the rendered tabs change.
  useEffect(() => {
    scrollSelectedIntoView();
  }, [scrollSelectedIntoView, currentValue, layoutKey]);

  return {
    scrollerRef,
    listRef,
    canScrollLeft: scrollState.left,
    canScrollRight: scrollState.right,
    isOverflowing: scrollState.left || scrollState.right,
    onScroll,
    scrollLeftward,
    scrollRightward,
  };
};
