import React, { useCallback } from 'react';

const TAB_SELECTOR = ':scope > [role="tab"]';

export interface UseTabsKeyboardOptions {
  /** Ref of the `role="tablist"` element. */
  listRef: React.RefObject<HTMLElement | null>;
}

/**
 * WAI-ARIA tabs keyboard support for a horizontal tablist: ArrowLeft/ArrowRight (wrapping), Home and End move focus
 * between tabs. Activation stays with the native button behaviour (Enter / Space trigger a click).
 */
export const useTabsKeyboard = ({
  listRef,
}: UseTabsKeyboardOptions): ((event: React.KeyboardEvent<HTMLElement>) => void) =>
  useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      const list = listRef.current;
      if (!list || event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      const tabs = Array.from(list.querySelectorAll<HTMLElement>(TAB_SELECTOR));
      if (tabs.length === 0) {
        return;
      }

      const activeElement = list.ownerDocument?.activeElement;
      const currentIndex = tabs.findIndex((tab) => tab === activeElement);
      if (currentIndex === -1) {
        return;
      }

      // In RTL the visual order is reversed: ArrowLeft moves to the next tab.
      const rtl = typeof window !== 'undefined' && window.getComputedStyle?.(list).direction === 'rtl';
      const nextKey = rtl ? 'ArrowLeft' : 'ArrowRight';
      const previousKey = rtl ? 'ArrowRight' : 'ArrowLeft';

      let nextIndex: number;
      switch (event.key) {
        case nextKey:
          nextIndex = (currentIndex + 1) % tabs.length;
          break;
        case previousKey:
          nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = tabs.length - 1;
          break;
        default:
          return;
      }

      event.preventDefault();
      const nextTab = tabs[nextIndex];
      nextTab.focus();
    },
    [listRef],
  );
