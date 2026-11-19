import { classNames } from '@helpers/classNames';
import React, { useLayoutEffect, useRef } from 'react';
import { createListTypeahead, nextListIndex } from '../../core/listbox';
import { OptionHostContext } from './option-host-context';

export type FocusSource = 'keyboard' | 'pointer' | null;

export interface MenuListProps extends Omit<React.HTMLAttributes<HTMLUListElement>, 'children'> {
  /** Focus the selected item (else the first enabled one) when mounted / when this turns on (MUI `selectedMenu`). */
  autoFocusItem?: boolean;
  /** MUI MenuList `autoFocus`: focus the list itself when no item takes the initial focus. */
  autoFocus?: boolean;
  /** How the menu was opened (focus-visible on the first item only for keyboard). */
  focusSource?: FocusSource;
  disableListWrap?: boolean;
  children?: React.ReactNode;
  ref?: React.Ref<HTMLUListElement | null>;
  [dataAttr: `data-${string}`]: unknown;
}

// MUI 9.5 MenuList manages its MenuItems only (own MenuOption and MUI MenuItem both carry MuiMenuItem-root): plain
// children Select clones with role="option" (a search bar, a footer) get no tab stop and are not navigated.
const items = (list: HTMLElement | null) =>
  list ? Array.from(list.querySelectorAll<HTMLElement>(':scope > .MuiMenuItem-root')) : [];

const itemInfo = (el: HTMLElement) => ({
  // biome-ignore lint/performance/useDomNodeTextContent: MUI MenuList typeahead matches the rendered text (innerText, textContent fallback)
  text: (el.innerText ?? el.textContent ?? '') as string,
  disabled: el.getAttribute('aria-disabled') === 'true',
});

/**
 * MUI 9.5 MenuList on the own core: `ul.MuiList-root.MuiList-padding[role=menu]`, roving tab index on the selected
 * (else first enabled) item, arrow/Home/End navigation with optional wrap, 500 ms text typeahead (core/listbox.ts).
 * Shared by MenuPopup (Select, Menu) and DropdownMenu.
 */
export const MenuList = (props: MenuListProps) => {
  const {
    autoFocusItem = false,
    autoFocus = false,
    focusSource = null,
    disableListWrap = false,
    className,
    onKeyDown,
    children,
    ref,
    ...rest
  } = props;
  const listRef = useRef<HTMLUListElement | null>(null);
  const typeahead = useRef(createListTypeahead());

  const itemCount = React.Children.count(children);
  // MUI roving tab index: until the user moves (arrows, focusing an item), the tab stop is the default item, recomputed
  // when the items or their selection change (a controlled value change while open).
  const selectionKey = React.Children.toArray(children)
    .map((c) => (React.isValidElement<{ selected?: boolean }>(c) && c.props.selected ? '1' : '0'))
    .join('');
  const userMoved = useRef(false);
  const focusPending = useRef(false);
  const listFocused = useRef(false);

  // Initial tab stop + focus: the first focusable selected item, else the first focusable one (MUI MenuList). Re-run
  // when the items change, so items that arrive after mount still get the tab stop / pending auto-focus.
  // biome-ignore lint/correctness/useExhaustiveDependencies: itemCount is the trigger, the DOM is read directly.
  useLayoutEffect(() => {
    if (autoFocusItem) focusPending.current = true;
    const list = items(listRef.current);
    const holder = list.find((el) => el.getAttribute('tabindex') === '0' && !itemInfo(el).disabled);
    const active =
      holder !== undefined && !focusPending.current && userMoved.current
        ? list.indexOf(holder)
        : (() => {
            const selected = list.findIndex(
              (el) =>
                (el.getAttribute('aria-selected') === 'true' || el.classList.contains('Mui-selected')) &&
                !itemInfo(el).disabled,
            );
            return selected !== -1 ? selected : list.findIndex((el) => !itemInfo(el).disabled);
          })();
    list.forEach((el, i) => {
      el.setAttribute('tabindex', i === active && !itemInfo(el).disabled ? '0' : '-1');
    });
    // MUI MenuList focusInitialTarget: the active item when item focus is on and one exists, else the list itself
    // when `autoFocus` is on.
    if (autoFocusItem && focusPending.current && active !== -1) {
      focusPending.current = false;
      try {
        list[active].focus(
          focusSource == null ? undefined : ({ focusVisible: focusSource === 'keyboard' } as FocusOptions),
        );
      } catch {
        list[active].focus();
      }
    } else if (autoFocus && !listFocused.current) {
      listFocused.current = true;
      listRef.current?.focus();
    }
    if (!autoFocus) listFocused.current = false;
  }, [autoFocusItem, autoFocus, focusSource, itemCount, selectionKey]);

  const moveTo = (list: HTMLElement[], index: number | null) => {
    if (index === null || !list[index]) return;
    userMoved.current = true;
    for (const el of list) el.setAttribute('tabindex', '-1');
    list[index].setAttribute('tabindex', '0');
    list[index].focus();
  };

  // MUI MenuList: navigate first (arrows/Home/End ignore Shift), then typeahead, then the consumer's onKeyDown, which
  // sees the new focus and `defaultPrevented`.
  const navigate = (event: React.KeyboardEvent<HTMLUListElement>) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const list = items(listRef.current);
    const current = list.indexOf(document.activeElement as HTMLElement);
    const infos = list.map(itemInfo);
    const nav = event.shiftKey
      ? null
      : nextListIndex(infos, current === -1 ? -1 : current, event.key, { wrap: !disableListWrap });
    if (nav !== null) {
      event.preventDefault();
      moveTo(list, nav);
      return;
    }
    if (event.key.length === 1) {
      const hit = typeahead.current.type(event.key, infos, current, performance.now());
      if (hit !== null) {
        event.preventDefault();
        moveTo(list, hit);
      }
    }
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    navigate(event);
    onKeyDown?.(event);
  };

  // Focus that lands on an item by pointer or code moves the tab stop there (MUI's roving focus handler).
  const handleFocus = (event: React.FocusEvent<HTMLUListElement>) => {
    rest.onFocus?.(event);
    const list = items(listRef.current);
    const index = list.indexOf(event.target as HTMLElement);
    if (index === -1) return;
    userMoved.current = true;
    list.forEach((el, i) => {
      el.setAttribute('tabindex', i === index ? '0' : '-1');
    });
  };

  return (
    <ul
      role="menu"
      tabIndex={-1}
      data-slot="menu-list"
      data-vg-core=""
      {...rest}
      className={classNames('MuiList-root', 'MuiList-padding', className ?? '')}
      ref={(node) => {
        listRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLUListElement | null>).current = node;
      }}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
    >
      <OptionHostContext.Provider value={true}>{children}</OptionHostContext.Provider>
    </ul>
  );
};
