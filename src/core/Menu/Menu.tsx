import styles from './Menu.module.scss';
import { uuidv4 } from '@helpers/generate-uid';
import { Menu as MuiMenu, MenuProps as MuiMenuProps } from '@mui/material';
import { useThemeProps } from '@mui/material/styles';
import { useRtl } from '@mui/system/RtlProvider';
import type { VanguardLegacyMenuProps } from '@vanguard/_internal/mui-legacy-props';
import { mapLegacyModalAliases, mapLegacySlots } from '@vanguard/_internal/mui-slot-compat';
import { MenuItem, MenuItemProps } from '@vanguard/MenuItem/MenuItem';
import { OVERLAY_BASE_Z_INDEX, OverlayStackingService } from '@vanguard/OverlayStacking/OverlayStackingService';
import React, { useEffect, useRef, useState } from 'react';
import { MenuPopup } from '../../primitives/react/Menu/MenuPopup';

export type MenuItemConfig = MenuItemProps & {
  key?: React.Key;
};

export type MenuProps = {
  testId?: string;
  items?: MenuItemConfig[];
  width?: React.CSSProperties['width'];
  height?: React.CSSProperties['height'];
  maxWidth?: React.CSSProperties['maxWidth'];
  maxHeight?: React.CSSProperties['maxHeight'];
} & Omit<MuiMenuProps, 'children'> &
  VanguardLegacyMenuProps & {
    children?: React.ReactNode;
  };

/** Props (after legacy-slot mapping) the own-core Menu models; any other key keeps MUI's Menu. */
const OWN_MENU_PROPS = new Set([
  'open',
  'anchorEl',
  'onClose',
  'anchorOrigin',
  'transformOrigin',
  'id',
  'slotProps',
  'slots',
  'autoFocus',
  'disableAutoFocusItem',
]);
const OWN_MENU_SLOTS = new Set(['paper', 'root', 'list']);

/** Slot-object keys the own popup renders like MUI; anything else (elevation, disablePadding, sx, ...) keeps MUI. */
const isModelledSlotKey = (key: string) =>
  key === 'className' ||
  key === 'style' ||
  key === 'ref' ||
  key === 'id' ||
  key.startsWith('data-') ||
  key.startsWith('aria-') ||
  /^on[A-Z]/.test(key);
const isModelledSlot = (slot: unknown) =>
  slot === undefined || (typeof slot === 'object' && slot !== null && Object.keys(slot).every(isModelledSlotKey));

/** An item the own option renders like MUI: not another component (`component`, `href` → MUI renders that element). */
const isModelledItem = (props: Record<string, unknown> | undefined) =>
  !props || (props.component === undefined && props.href === undefined);

export const Menu = (inProps: MenuProps) => {
  const { testId, items, children, width, height, maxWidth, maxHeight, disableEscapeKeyDown, ...rest } = useThemeProps({
    props: inProps,
    name: 'MuiMenu',
  });
  const mapped = mapLegacySlots(
    mapLegacyModalAliases(rest),
    { MenuListProps: 'list', PaperProps: 'paper', TransitionProps: 'transition', BackdropProps: 'backdrop' },
    { TransitionComponent: 'transition', BackdropComponent: 'backdrop' },
  );
  const sizeStyle = width || height || maxWidth || maxHeight ? { width, height, maxWidth, maxHeight } : undefined;

  /**
   * Menu popper stacking
   * -------
   * MUI's Menu portals to <body> pinned to the static `theme.zIndex.modal`
   * (1300), so inside a stacked modal/drawer it paints *behind* the surface
   * that opened it. `open` is controlled by the caller, so we mirror it into
   * an effect: register a 'popover' slot while open, release it on close —
   * same pattern as the Select dropdown in InputBase.
   */
  const menuIdRef = useRef<string>(`menu-${uuidv4()}`);
  const [menuZIndex, setMenuZIndex] = useState(OVERLAY_BASE_Z_INDEX);

  useEffect(() => {
    if (rest.open) {
      setMenuZIndex(OverlayStackingService.register(menuIdRef.current, 'popover'));
    } else {
      OverlayStackingService.unregister(menuIdRef.current);
      setMenuZIndex(OVERLAY_BASE_Z_INDEX);
    }
    return () => OverlayStackingService.unregister(menuIdRef.current);
  }, [rest.open]);

  const paper = sizeStyle ? rest.slotProps?.paper : mapped.slotProps?.paper;
  const root = mapped.slotProps?.root;
  // Preserve the existing whole-style replacement when a caller supplies paper.style.
  const sizePaper = (resolved: Exclude<typeof paper, (...args: never[]) => unknown>) => ({
    style: sizeStyle,
    ...resolved,
  });
  const stackRoot = (resolved: Exclude<typeof root, (...args: never[]) => unknown>) => ({
    ...resolved,
    style: { ...resolved?.style, zIndex: menuZIndex },
  });
  const slotProps = {
    ...mapped.slotProps,
    ...(sizeStyle
      ? {
          paper:
            typeof paper === 'function'
              ? (state: Parameters<typeof paper>[0]) => sizePaper(paper(state))
              : sizePaper(paper),
        }
      : {}),
    root: typeof root === 'function' ? (state: Parameters<typeof root>[0]) => stackRoot(root(state)) : stackRoot(root),
  };

  const children_ = items
    ? items.map(({ key, ...itemProps }, index) => <MenuItem key={key ?? index} {...itemProps} />)
    : children;
  const onCloseGuarded = (event: object, reason: 'escapeKeyDown' | 'backdropClick' | 'tabKeyDown') => {
    if (disableEscapeKeyDown && reason === 'escapeKeyDown') return;
    rest.onClose?.(event as never, reason);
  };

  // Group B: the own core renders Menu (MenuPopup = ModalHost + Paper + Grow + MenuList) for the props it models,
  // which is every Menu call in rc-webapp (anchorEl/open/onClose/items/anchorOrigin/transformOrigin/PaperProps/size,
  // plan §31). Anything else (function slots, slots/components, transitions, keepMounted, anchorReference, refs, ...)
  // keeps MUI's Menu.
  const ownPaper = slotProps.paper;
  const ownList = mapped.slotProps?.list;
  const ownRoot = slotProps.root;
  const isRtl = useRtl();
  const usesOnlyModelled =
    !isRtl &&
    Object.keys(mapped).every((k) => OWN_MENU_PROPS.has(k)) &&
    // legacy-slot mapping always adds `slots`; only an empty one is modelled
    Object.values((mapped.slots ?? {}) as Record<string, unknown>).every((v) => v === undefined) &&
    typeof ownPaper !== 'function' &&
    typeof ownList !== 'function' &&
    typeof ownRoot !== 'function' &&
    Object.keys(mapped.slotProps ?? {}).every((k) => OWN_MENU_SLOTS.has(k)) &&
    // slot contents too: the caller's objects, before the size / stacking additions
    isModelledSlot(paper) &&
    isModelledSlot(ownList) &&
    isModelledSlot(root) &&
    (items ?? []).every((item) => isModelledItem(item as Record<string, unknown>)) &&
    React.Children.toArray(children).every(
      (child) => !React.isValidElement(child) || isModelledItem(child.props as Record<string, unknown>),
    );
  if (usesOnlyModelled && rest.open !== undefined) {
    const { className: rootClass, ...rootRest } = (ownRoot ?? {}) as { className?: string } & Record<string, unknown>;
    return (
      <MenuPopup
        open={Boolean(rest.open)}
        anchorEl={(typeof rest.anchorEl === 'function' ? rest.anchorEl() : rest.anchorEl) as HTMLElement | null}
        onClose={onCloseGuarded}
        id={rest.id}
        // MUI 9.5 Menu's own defaults (not Popover's): hang below the anchor, grow from the top-left corner.
        anchorOrigin={(rest.anchorOrigin ?? { vertical: 'bottom', horizontal: 'left' }) as never}
        transformOrigin={(rest.transformOrigin ?? { vertical: 'top', horizontal: 'left' }) as never}
        autoFocus={rest.autoFocus !== false}
        autoFocusItem={!rest.disableAutoFocusItem}
        rootProps={{
          'data-testid': testId,
          ...rootRest,
          className: [styles.menu, rootClass].filter(Boolean).join(' '),
        }}
        paperProps={ownPaper as never}
        listProps={ownList as never}
      >
        {children_}
      </MenuPopup>
    );
  }

  return (
    <MuiMenu
      data-testid={testId}
      disableAutoFocus={false}
      {...mapped}
      slotProps={slotProps}
      className={styles.menu}
      onClose={(event, reason) => {
        if (disableEscapeKeyDown && reason === 'escapeKeyDown') return;
        rest.onClose?.(event, reason);
      }}
    >
      {children_}
    </MuiMenu>
  );
};
