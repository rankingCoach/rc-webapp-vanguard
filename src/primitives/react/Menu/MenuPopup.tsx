// Ported from @mui/material@9.5.0 Menu/Menu.js, Popover/Popover.js (MIT)
import { classNames } from '@helpers/classNames';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { OriginH, OriginV, popoverPosition } from '../../core/position';
import { GROW_HIDDEN_TRANSFORM, growTransition } from '../../core/transition';
import { ModalCloseReason, ModalHost } from '../Modal/ModalHost';
import { FocusSource, MenuList } from './MenuList';

export type { FocusSource };

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
  /**
   * MUI Menu `autoFocus` (default true): the menu manages initial focus (item, else the list) and the modal's own
   * auto-focus is off; false hands initial focus back to the modal (content root).
   */
  autoFocus?: boolean;
  focusSource?: FocusSource;
  disableListWrap?: boolean;
  marginThreshold?: number;
  disableScrollLock?: boolean;
  children: React.ReactNode;
}

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
    autoFocus = true,
    focusSource = null,
    disableListWrap = false,
    marginThreshold = 16,
    disableScrollLock = false,
    children,
  } = props;
  const paperRef = useRef<HTMLDivElement | null>(null);
  // ModalHost portals its content one commit after `open` (MUI Portal timing): the enter effect waits for the paper.
  const [paperNode, setPaperNode] = useState<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const [exiting, setExiting] = useState(false);
  const wasOpen = useRef(open);

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
  }, [open, position, paperNode]);

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

  // Tab closes the menu (MUI Menu's handleListKeyDown); everything else is MenuList's.
  const handleListKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    (listProps?.onKeyDown as React.KeyboardEventHandler<HTMLUListElement> | undefined)?.(event);
    if (event.key === 'Tab' && !(event.ctrlKey || event.metaKey || event.altKey)) {
      event.preventDefault();
      onClose(event, 'tabKeyDown');
    }
  };

  const { className: rootClass, style: rootStyle, ...rootRest } = rootProps ?? {};
  const { className: paperClass, style: paperStyle, ref: paperRefProp, ...paperRest } = paperProps ?? {};
  const { className: listClass, style: listStyle, onKeyDown: _ok, ...listRest } = listProps ?? {};

  const setPaperRef = useCallback(
    (node: HTMLDivElement | null) => {
      paperRef.current = node;
      setPaperNode(node);
      if (typeof paperRefProp === 'function') paperRefProp(node);
      else if (paperRefProp) (paperRefProp as React.RefObject<HTMLDivElement | null>).current = node;
    },
    [paperRefProp],
  );

  return (
    <ModalHost
      open={open}
      exiting={exiting}
      onClose={onClose}
      id={id}
      disableScrollLock={disableScrollLock}
      // MUI Menu: `disableAutoFocus={autoFocus}` on its Popover (the menu list moves focus itself).
      disableAutoFocus={autoFocus}
      className={classNames('MuiPopover-root', 'MuiMenu-root', rootClass ?? '')}
      style={rootStyle}
      backdropStyle={{ opacity: open ? 1 : 0, transition: 'opacity 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms' }}
      data-slot="menu-popup"
      data-vg-core=""
      data-open={open ? '' : undefined}
      {...rootRest}
    >
      <div
        className={[
          'MuiPaper-root',
          'MuiPaper-elevation',
          'MuiPaper-rounded',
          'MuiPaper-elevation8',
          'MuiPopover-paper',
          'MuiMenu-paper',
          paperClass,
        ]
          .filter(Boolean)
          .join(' ')}
        tabIndex={-1}
        data-slot="menu-paper"
        data-vg-core=""
        ref={setPaperRef}
        style={{
          ['--Paper-shadow' as string]: PAPER_SHADOW_8,
          opacity: 0,
          transform: GROW_HIDDEN_TRANSFORM,
          ...paperStyle,
        }}
        {...paperRest}
      >
        <MenuList
          className={classNames('MuiMenu-list', listClass ?? '')}
          ref={listRef}
          style={listStyle}
          autoFocusItem={open && autoFocus && autoFocusItem}
          autoFocus={open && autoFocus}
          focusSource={focusSource}
          disableListWrap={disableListWrap}
          onKeyDown={handleListKeyDown}
          {...listRest}
        >
          {children}
        </MenuList>
      </div>
    </ModalHost>
  );
};
