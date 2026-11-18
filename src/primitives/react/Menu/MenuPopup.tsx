import { classNames } from '@helpers/classNames';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createListTypeahead, nextListIndex } from '../../core/listbox';
import { OriginH, OriginV, popoverPosition } from '../../core/position';
import { GROW_HIDDEN_TRANSFORM, growTransition } from '../../core/transition';
import { ModalCloseReason, ModalHost } from '../Modal/ModalHost';
import { OptionHostContext } from './option-host-context';

export type FocusSource = 'keyboard' | 'pointer' | null;

export const PAPER_SHADOW_8 =
  '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)';

export interface MenuPopupProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: (event: React.SyntheticEvent | Event, reason: ModalCloseReason) => void;
  id?: string;
  anchorOrigin?: { vertical: OriginV; horizontal: OriginH };
  transformOrigin?: { vertical: OriginV; horizontal: OriginH };
  /** Popover root (`MuiPopover-root MuiMenu-root MuiModal-root`) props. */
  rootProps?: { className?: string; style?: React.CSSProperties } & Record<string, unknown>;
  paperProps?: { className?: string; style?: React.CSSProperties; ref?: React.Ref<HTMLDivElement> } & Record<
    string,
    unknown
  >;
  listProps?: { className?: string; style?: React.CSSProperties } & Record<string, unknown>;
  /** Focus the selected item (else the first enabled one) on open, like MUI `variant="selectedMenu"`. */
  autoFocusItem?: boolean;
  focusSource?: FocusSource;
  disableListWrap?: boolean;
  marginThreshold?: number;
  disableScrollLock?: boolean;
  children: React.ReactNode;
}

const items = (list: HTMLElement | null) =>
  list ? Array.from(list.querySelectorAll<HTMLElement>(':scope > [role="option"], :scope > [role="menuitem"]')) : [];

const itemInfo = (el: HTMLElement) => ({
  // biome-ignore lint/performance/useDomNodeTextContent: MUI MenuList typeahead matches the rendered text (innerText, textContent fallback)
  text: (el.innerText ?? el.textContent ?? '') as string,
  disabled: el.getAttribute('aria-disabled') === 'true',
});

/**
 * Menu popup = MUI Menu/Popover parity: ModalHost + Paper (elevation 8, Grow "auto" transition, positioned by the
 * core popover maths, repositioned on resize) + List with MUI MenuList keyboard (roving tab index, no-wrap option,
 * 500 ms typeahead). Tab closes it (`tabKeyDown`).
 */
export const MenuPopup = (props: MenuPopupProps) => {
  const {
    open,
    anchorEl,
    onClose,
    id,
    anchorOrigin = { vertical: 'top', horizontal: 'left' },
    transformOrigin = { vertical: 'top', horizontal: 'left' },
    rootProps,
    paperProps,
    listProps,
    autoFocusItem = true,
    focusSource = null,
    disableListWrap = false,
    marginThreshold = 16,
    disableScrollLock = false,
    children,
  } = props;
  const paperRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const [exiting, setExiting] = useState(false);
  const wasOpen = useRef(open);
  const typeahead = useRef(createListTypeahead());

  if (wasOpen.current && !open && !exiting) setExiting(true);
  wasOpen.current = open;

  const position = useCallback(() => {
    const paper = paperRef.current;
    if (!paper || !anchorEl) return;
    const p = popoverPosition({
      anchorRect: anchorEl.getBoundingClientRect(),
      element: { width: paper.offsetWidth, height: paper.offsetHeight },
      anchorOrigin,
      transformOrigin,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      marginThreshold,
    });
    paper.style.top = p.top;
    paper.style.left = p.left;
    paper.style.transformOrigin = p.transformOrigin;
  }, [anchorEl, anchorOrigin, transformOrigin, marginThreshold]);

  // Enter: position, then run the Grow transition from the hidden state.
  useLayoutEffect(() => {
    const paper = paperRef.current;
    if (!open || !paper) return;
    position();
    paper.style.opacity = '0';
    paper.style.transform = GROW_HIDDEN_TRANSFORM;
    void paper.offsetHeight; // reflow so the transition starts from the hidden styles
    paper.style.transition = growTransition('enter', paper.clientHeight);
    paper.style.opacity = '1';
    paper.style.transform = 'none';
  }, [open, position]);

  // Exit: reverse Grow, unmount when done.
  useLayoutEffect(() => {
    const paper = paperRef.current;
    if (!exiting || !paper) return undefined;
    paper.style.transition = growTransition('exit', paper.clientHeight);
    paper.style.opacity = '0';
    paper.style.transform = GROW_HIDDEN_TRANSFORM;
    const duration = parseInt(paper.style.transition.split(' ')[1], 10) || 0;
    const t = setTimeout(() => setExiting(false), duration);
    return () => clearTimeout(t);
  }, [exiting]);

  useEffect(() => {
    if (!open) return undefined;
    const onResize = () => position();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open, position]);

  // Roving tab index + initial focus.
  useLayoutEffect(() => {
    if (!open) return;
    const list = items(listRef.current);
    const selected = list.findIndex((el) => el.getAttribute('aria-selected') === 'true' && !itemInfo(el).disabled);
    const first = list.findIndex((el) => !itemInfo(el).disabled);
    const active = selected !== -1 ? selected : first;
    list.forEach((el, i) => {
      el.setAttribute('tabindex', i === active && !itemInfo(el).disabled ? '0' : '-1');
    });
    if (autoFocusItem && active !== -1) {
      try {
        list[active].focus(
          focusSource == null ? undefined : ({ focusVisible: focusSource === 'keyboard' } as FocusOptions),
        );
      } catch {
        list[active].focus();
      }
    }
  }, [open, autoFocusItem, focusSource]);

  const moveTo = (list: HTMLElement[], index: number | null) => {
    if (index === null || !list[index]) return;
    for (const el of list) el.setAttribute('tabindex', '-1');
    list[index].setAttribute('tabindex', '0');
    list[index].focus();
  };

  const handleListKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    (listProps?.onKeyDown as React.KeyboardEventHandler<HTMLUListElement> | undefined)?.(event);
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === 'Tab') {
      event.preventDefault();
      onClose(event, 'tabKeyDown');
      return;
    }
    const list = items(listRef.current);
    const current = list.indexOf(document.activeElement as HTMLElement);
    const infos = list.map(itemInfo);
    const nav = nextListIndex(infos, current === -1 ? -1 : current, event.key, { wrap: !disableListWrap });
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

  const { className: rootClass, style: rootStyle, ...rootRest } = rootProps ?? {};
  const { className: paperClass, style: paperStyle, ref: paperRefProp, ...paperRest } = paperProps ?? {};
  const { className: listClass, style: listStyle, onKeyDown: _ok, ...listRest } = listProps ?? {};

  const setPaperRef = (node: HTMLDivElement | null) => {
    paperRef.current = node;
    if (typeof paperRefProp === 'function') paperRefProp(node);
    else if (paperRefProp) (paperRefProp as React.RefObject<HTMLDivElement | null>).current = node;
  };

  return (
    <ModalHost
      open={open}
      exiting={exiting}
      onClose={onClose}
      id={id}
      disableScrollLock={disableScrollLock}
      className={classNames('MuiPopover-root', 'MuiMenu-root', rootClass ?? '')}
      style={rootStyle}
      backdropStyle={{ opacity: open ? 1 : 0, transition: 'opacity 225ms cubic-bezier(0.4, 0, 0.2, 1)' }}
      data-slot="menu-popup"
      data-open={open ? '' : undefined}
      {...rootRest}
    >
      <div
        className={classNames(
          'MuiPaper-root',
          'MuiPaper-elevation',
          'MuiPaper-rounded',
          'MuiPaper-elevation8',
          'MuiPopover-paper',
          'MuiMenu-paper',
          paperClass ?? '',
        )}
        tabIndex={-1}
        data-slot="menu-paper"
        ref={setPaperRef}
        style={{
          ['--Paper-shadow' as string]: PAPER_SHADOW_8,
          opacity: 0,
          transform: GROW_HIDDEN_TRANSFORM,
          ...paperStyle,
        }}
        {...paperRest}
      >
        <ul
          className={classNames('MuiList-root', 'MuiList-padding', 'MuiMenu-list', listClass ?? '')}
          tabIndex={-1}
          data-slot="menu-list"
          ref={listRef}
          style={listStyle}
          onKeyDown={handleListKeyDown}
          {...listRest}
        >
          <OptionHostContext.Provider value={true}>{children}</OptionHostContext.Provider>
        </ul>
      </div>
    </ModalHost>
  );
};
