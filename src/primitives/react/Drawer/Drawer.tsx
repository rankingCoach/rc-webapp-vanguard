// Ported from @mui/material@9.5.0 Drawer/Drawer.js (MIT)
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cx } from '../class-names';
import { ModalHost, ModalHostProps } from '../Modal/ModalHost';
import { Slide } from '../Transitions/Slide';
import { TransitionTimeout } from '../Transitions/Transition';
import { zIndexClass } from '../z-index-class';

type Anchor = 'left' | 'right' | 'top' | 'bottom';
type BackdropSlotProps = { invisible?: boolean; className?: string; style?: React.CSSProperties };

export interface DrawerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClose'> {
  anchor?: Anchor;
  hideBackdrop?: boolean;
  open?: boolean;
  variant?: 'temporary' | 'persistent' | 'permanent';
  transitionDuration?: TransitionTimeout;
  sx?: { zIndex?: number };
  ModalProps?: Partial<Omit<ModalHostProps, 'children' | 'onClose'>> & {
    hideBackdrop?: boolean;
    slotProps?: { backdrop?: BackdropSlotProps };
  };
  onClose?: (event: React.SyntheticEvent | Event, reason: 'escapeKeyDown' | 'backdropClick') => void;
  slotProps?: {
    paper?: React.HTMLAttributes<HTMLDivElement> & {
      /**
       * Vanguard's only paper sx; Drawer.compat.scss paints exactly these values at the emotion rule's specificity.
       * Narrowed to the literals so another value cannot be passed and silently ignored (Codex review, handoff 16).
       */
      sx?: { backgroundColor?: 'var(--fn-bg-surface)'; backgroundImage?: 'none' };
    };
  };
  ref?: React.Ref<HTMLDivElement>;
}

const DEFAULT_DURATION = { enter: 225, exit: 195 };
const OPPOSITE_DIRECTION = { left: 'right', right: 'left', top: 'down', bottom: 'up' } as const;
const PAPER_SHADOW_16 =
  '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)';

/** MUI Drawer for Vanguard's prop surface. Structural styles live in the consumer's MUI compatibility CSS. */
export const Drawer = (props: DrawerProps) => {
  const {
    anchor = 'left',
    children,
    className,
    hideBackdrop = false,
    ModalProps = {},
    onClose,
    open = false,
    transitionDuration = DEFAULT_DURATION,
    variant = 'temporary',
    slotProps = {},
    sx,
    ref,
    ...other
  } = props;
  const mounted = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [exited, setExited] = useState(!open);
  if (open && exited) setExited(false);
  // A Slide mounted already closed (e.g. variant switched while closed) never calls onExited: nothing to exit.
  const lastVariant = useRef(variant);
  if (lastVariant.current !== variant) {
    lastVariant.current = variant;
    if (!open && !exited) setExited(true);
  }
  useEffect(() => {
    mounted.current = true;
  }, []);
  const resolveSlideContainer = useCallback(() => rootRef.current, []);
  // React 19 callback refs: forward the root node, keep the consumer's cleanup, detach with null (like useForkRef).
  const attachRoot = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      const cleanup = typeof ref === 'function' ? ref(node) : undefined;
      if (ref && typeof ref === 'object') ref.current = node;
      return () => {
        rootRef.current = null;
        if (typeof cleanup === 'function') cleanup();
        else if (typeof ref === 'function') ref(null);
        else if (ref) ref.current = null;
      };
    },
    [ref],
  );
  const setRoot = useCallback((node: HTMLDivElement | null) => (node ? attachRoot(node) : undefined), [attachRoot]);
  // Temporary: ModalHost renders the root; the paper is its direct child.
  const setPaper = useCallback(
    (node: HTMLDivElement | null) =>
      variant === 'temporary' && node ? attachRoot(node.parentElement as HTMLDivElement) : undefined,
    [variant, attachRoot],
  );
  const { sx: _paperSx, className: paperClass, style: paperStyle, ...paperProps } = slotProps.paper ?? {};
  // MUI Drawer: elevation 16 when temporary, 0 when docked; Vanguard never passes another elevation (prop not ported).
  const paperElevation = variant === 'temporary' ? 16 : 0;
  const paper = (
    <div
      data-vg-core=""
      data-anchor={anchor}
      data-docked={variant === 'temporary' ? undefined : ''}
      className={cx(
        'MuiPaper-root MuiPaper-elevation',
        `MuiPaper-elevation${paperElevation}`,
        'MuiDrawer-paper',
        paperClass,
      )}
      {...(variant === 'temporary'
        ? { role: 'dialog', 'aria-modal': true, 'data-mui-focusable': '', tabIndex: -1 }
        : {})}
      {...paperProps}
      ref={setPaper}
      style={{ ['--Paper-shadow' as string]: paperElevation === 0 ? 'none' : PAPER_SHADOW_16, ...paperStyle }}
    >
      {children}
    </div>
  );
  const slidingPaper =
    variant === 'permanent' ? (
      paper
    ) : (
      <Slide
        in={open}
        direction={OPPOSITE_DIRECTION[anchor]}
        timeout={transitionDuration}
        appear={mounted.current}
        container={variant === 'temporary' ? resolveSlideContainer : undefined}
        onEnter={() => setExited(false)}
        onExited={() => setExited(true)}
      >
        {paper}
      </Slide>
    );
  const rootClass = cx(
    'MuiDrawer-root',
    `MuiDrawer-anchor${anchor[0].toUpperCase()}${anchor.slice(1)}`,
    className,
    zIndexClass(sx?.zIndex),
  );
  if (variant !== 'temporary') {
    return (
      <div {...other} data-vg-core="" className={cx(rootClass, 'MuiDrawer-docked')} ref={setRoot}>
        {slidingPaper}
      </div>
    );
  }
  const {
    hideBackdrop: modalHideBackdrop = hideBackdrop,
    slotProps: modalSlotProps,
    className: modalClass,
    ...modalProps
  } = ModalProps;
  const backdrop = modalSlotProps?.backdrop;
  return (
    <ModalHost
      {...other}
      open={open}
      exiting={!exited}
      closeAfterTransition
      onClose={(event, reason) => {
        if (reason === 'escapeKeyDown' || reason === 'backdropClick') onClose?.(event, reason);
      }}
      {...modalProps}
      className={cx(rootClass, 'MuiDrawer-modal', modalClass)}
      backdropClassName={backdrop?.className}
      backdropStyle={backdrop?.style}
      hideBackdrop={modalHideBackdrop}
      backdropInvisible={backdrop?.invisible ?? false}
      backdropTransition={transitionDuration}
      data-vg-core=""
    >
      {slidingPaper}
    </ModalHost>
  );
};
