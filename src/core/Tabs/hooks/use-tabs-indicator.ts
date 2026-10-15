import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

/** Selector for the selected tab button rendered directly inside the tablist. */
const SELECTED_TAB_SELECTOR = ':scope > [role="tab"][aria-selected="true"]';

/** Scale at the middle of a glide: the chip squishes (mostly vertically) while moving and springs back on arrival. */
const SQUISH_KEYFRAMES: Keyframe[] = [{ scale: '1 1' }, { scale: '0.97 0.8' }, { scale: '1 1' }];

/** Box of the selected tab, relative to the tablist (its offset parent). */
export interface TabsIndicatorRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface UseTabsIndicatorOptions {
  /** Ref for the `role="tablist"` element; must be the offset parent of the tabs (`position: relative`). */
  listRef: React.RefObject<HTMLDivElement | null>;
  /** Ref for the indicator element; it squishes while gliding to a newly selected tab. */
  indicatorRef: React.RefObject<HTMLElement | null>;
  /** When false no indicator is measured (themes that draw the selection on the tab itself). */
  enabled: boolean;
  /** Value of the currently selected tab; the indicator moves whenever it changes. */
  currentValue: unknown;
  /** Identity of the rendered tabs; the indicator is re-measured and the tabs re-observed when it changes. */
  layoutKey: string;
}

const getSelectedTab = (list: HTMLElement): HTMLElement | null => {
  try {
    return list.querySelector<HTMLElement>(SELECTED_TAB_SELECTOR);
  } catch {
    return null;
  }
};

const isSameRect = (a: TabsIndicatorRect | null, b: TabsIndicatorRect | null): boolean =>
  a === b ||
  (a !== null && b !== null && a.left === b.left && a.top === b.top && a.width === b.width && a.height === b.height);

/**
 * Plays the squish on the indicator, for as long as its CSS glide transition (0s under reduced motion: no squish).
 * The chip is positioned with the individual `translate` property, which applies after `scale`: the squish scales the
 * chip around its own centre without scaling its offset in the bar (a `transform: translate()` would be scaled too).
 */
const playSquish = (indicator: HTMLElement | null, previous: Animation | null): Animation | null => {
  if (!indicator || typeof indicator.animate !== 'function' || typeof window.getComputedStyle !== 'function') {
    return null;
  }
  const duration = parseFloat(window.getComputedStyle(indicator).transitionDuration) * 1000;
  if (!(duration > 0)) {
    return null;
  }
  previous?.cancel();
  return indicator.animate(SQUISH_KEYFRAMES, { duration, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' });
};

/**
 * Tracks the box of the selected tab so a single indicator ("chip") can glide between tabs instead of each tab
 * painting its own selected background. Returns `null` while there is nothing measurable (no selected visible tab,
 * hidden bar, jsdom/SSR); callers then fall back to the tab's own selected styling.
 */
export const useTabsIndicator = ({
  listRef,
  indicatorRef,
  enabled,
  currentValue,
  layoutKey,
}: UseTabsIndicatorOptions): TabsIndicatorRect | null => {
  const [rect, setRect] = useState<TabsIndicatorRect | null>(null);
  const previousValueRef = useRef(currentValue);
  /** Set when the selection changed while the chip was shown, so the next move of the chip squishes. */
  const squishPendingRef = useRef(false);
  const squishRef = useRef<Animation | null>(null);

  const measure = useCallback(() => {
    const list = listRef.current;
    const selected = enabled && list ? getSelectedTab(list) : null;
    const next =
      selected && selected.offsetWidth > 0
        ? {
            left: selected.offsetLeft,
            top: selected.offsetTop,
            width: selected.offsetWidth,
            height: selected.offsetHeight,
          }
        : null;
    setRect((prev) => (isSameRect(prev, next) ? prev : next));
  }, [listRef, enabled]);

  // Before paint, so the chip and the newly selected tab update in the same frame.
  useLayoutEffect(() => {
    if (!Object.is(previousValueRef.current, currentValue)) {
      previousValueRef.current = currentValue;
      squishPendingRef.current = indicatorRef.current !== null;
    }
    measure();
  }, [measure, indicatorRef, currentValue, layoutKey]);

  // Squish only for selection changes, not for resizes; runs once the chip has its new position.
  useEffect(() => {
    if (squishPendingRef.current) {
      squishPendingRef.current = false;
      squishRef.current = playSquish(indicatorRef.current, squishRef.current);
    }
  }, [indicatorRef, rect]);

  useEffect(() => (): void => squishRef.current?.cancel(), []);

  // Labels loading, translations, fonts or the bar becoming visible change the tabs' boxes without a re-render.
  useEffect(() => {
    const list = listRef.current;
    if (!enabled || !list || typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const observer = new ResizeObserver(() => measure());
    observer.observe(list);
    Array.from(list.children).forEach((child) => observer.observe(child));
    return (): void => observer.disconnect();
  }, [listRef, enabled, measure, layoutKey]);

  // A `dir` switch (LTR <-> RTL) on the bar or any ancestor moves the tabs without resizing them.
  useEffect(() => {
    if (!enabled || typeof MutationObserver === 'undefined' || typeof document === 'undefined') {
      return undefined;
    }
    const observer = new MutationObserver(() => measure());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['dir'], subtree: true });
    return (): void => observer.disconnect();
  }, [enabled, measure]);

  return rect;
};
