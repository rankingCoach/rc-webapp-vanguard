import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { OwnPopper } from '../Popper/Popper';
import { Grow } from '../Transitions/Grow';
import { useVanguardTypography } from '../typography-context';

type Placement =
  | 'auto'
  | 'auto-end'
  | 'auto-start'
  | 'bottom'
  | 'bottom-end'
  | 'bottom-start'
  | 'left'
  | 'left-end'
  | 'left-start'
  | 'right'
  | 'right-end'
  | 'right-start'
  | 'top'
  | 'top-end'
  | 'top-start';

type AnyProps = Record<string, unknown>;

export interface TooltipClassesOverride {
  popper?: string;
  popperInteractive?: string;
  popperArrow?: string;
  popperClose?: string;
  tooltip?: string;
  tooltipArrow?: string;
  arrow?: string;
  touch?: string;
  tooltipPlacementLeft?: string;
  tooltipPlacementRight?: string;
  tooltipPlacementTop?: string;
  tooltipPlacementBottom?: string;
}

export interface TooltipProps {
  /** Controlled open (Vanguard's only mode: Popover). */
  open?: boolean;
  title: React.ReactNode;
  children: React.ReactElement<AnyProps>;
  arrow?: boolean;
  placement?: Placement;
  classes?: TooltipClassesOverride;
  disableInteractive?: boolean;
  describeChild?: boolean;
  id?: string;
  className?: string;
  slotProps?: {
    popper?: AnyProps & {
      className?: string;
      style?: React.CSSProperties;
      placement?: Placement;
      popperOptions?: AnyProps & { modifiers?: AnyProps[] };
    };
    tooltip?: AnyProps & { className?: string; style?: React.CSSProperties };
    arrow?: AnyProps & { className?: string; style?: React.CSSProperties };
    transition?: AnyProps;
  };
  /** Anything else lands on the trigger, like MUI (`other`). */
  [extra: string]: unknown;
}

const ENTER_TOUCH_DELAY = 700;
const LEAVE_TOUCH_DELAY = 1500;
/** theme.transitions.duration.shortest / shorter */
const SHORTEST = 150;
const SHORTER = 200;

/** MUI composeEventHandler: the consumer's handler first, then Tooltip's. */
const compose =
  (own: (event: React.SyntheticEvent) => void, theirs: unknown) =>
  (event: React.SyntheticEvent, ...rest: unknown[]) => {
    if (typeof theirs === 'function') theirs(event, ...rest);
    own(event);
  };

/** MUI utils isFocusVisible. */
const isFocusVisible = (element: Element) => {
  try {
    return element.matches(':focus-visible');
  } catch {
    return false;
  }
};

/** MUI writes the capitalised vendor property (an alias of webkitUserSelect in browsers). */
const bodyStyle = () => document.body.style as unknown as { WebkitUserSelect: string | undefined };

/** clsx: truthy strings joined by one space. */
const cx = (...parts: unknown[]) => parts.filter((p) => typeof p === 'string' && p !== '').join(' ');

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** One timer, MUI useTimeout semantics (start replaces, clear on unmount). */
const useTimer = () => {
  const ref = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const timer = useMemo(
    () => ({
      start: (ms: number, fn: () => void) => {
        if (ref.current !== undefined) clearTimeout(ref.current);
        ref.current = setTimeout(() => {
          ref.current = undefined;
          fn();
        }, ms);
      },
      clear: () => {
        if (ref.current !== undefined) clearTimeout(ref.current);
        ref.current = undefined;
      },
    }),
    [],
  );
  useEffect(() => timer.clear, [timer]);
  return timer;
};

/**
 * MUI 9.5 Tooltip, controlled mode, on the own core: trigger cloned with MUI's aria wiring and listeners, a portaled
 * OwnPopper (`MuiTooltip-popper…`, arrow modifier padding 4) with a 200 ms Grow, the `MuiTooltip-tooltip…` surface and
 * the arrow. Open is the `open` prop; MUI's delay timers only drive onOpen/onClose, which controlled callers
 * (Popover) do not pass, so they are not modelled. Touch still blocks text selection for the long-press window and
 * marks the tooltip `touch`, like MUI.
 */
export const Tooltip = (props: TooltipProps) => {
  const {
    open: openProp = false,
    title,
    children,
    arrow = false,
    placement = 'bottom',
    classes,
    disableInteractive = false,
    describeChild = false,
    id: idProp,
    slotProps = {},
    ...other
  } = props;
  const [childNode, setChildNode] = useState<HTMLElement | null>(null);
  const [arrowRef, setArrowRef] = useState<HTMLElement | null>(null);
  const [, setChildIsFocusVisible] = useState(false);
  const ignoreNonTouchEvents = useRef(false);
  const prevUserSelect = useRef<string | undefined>(undefined);
  const closeTimer = useTimer();
  const leaveTimer = useTimer();
  const touchTimer = useTimer();
  const reactId = useId();
  const vgType = useVanguardTypography() === 'vanguard' ? 'vg-typography-vanguard' : '';
  const id = idProp ?? `mui-${reactId}`;

  const stopTouchInteraction = () => {
    if (prevUserSelect.current !== undefined) {
      bodyStyle().WebkitUserSelect = prevUserSelect.current;
      prevUserSelect.current = undefined;
    }
    touchTimer.clear();
  };
  const stopRef = useRef(stopTouchInteraction);
  stopRef.current = stopTouchInteraction;
  useEffect(() => () => stopRef.current(), []);

  // Controlled: closing only re-arms the touch flag reset (onClose is not modelled).
  const handleClose = () => {
    closeTimer.start(SHORTEST, () => {
      ignoreNonTouchEvents.current = false;
    });
  };
  const handleMouseLeave = () => {
    leaveTimer.start(0, handleClose);
  };
  const handleBlur = (event: React.FocusEvent) => {
    const target = (event?.target ?? childNode) as HTMLElement | null;
    if (!target || (target as HTMLButtonElement).disabled || !isFocusVisible(target)) {
      setChildIsFocusVisible(false);
      handleMouseLeave();
    }
  };
  // MUI handleMouseOver (controlled: the enter timer only drives onOpen): ignored after a touch until the flag
  // resets, removes the native title, cancels a pending leave.
  const handleMouseOver = (event: { type: string }) => {
    if (ignoreNonTouchEvents.current && event.type !== 'touchstart') return;
    if (childNode) childNode.removeAttribute('title');
    leaveTimer.clear();
  };
  const handleFocus = (event: React.FocusEvent) => {
    if (!childNode) setChildNode(event.currentTarget as HTMLElement);
    const target = event.target as HTMLElement;
    if (isFocusVisible(target)) {
      // React does not fire blur when a focused element becomes disabled (MUI's native blur workaround).
      const handleNativeBlur = (blurEvent: FocusEvent) => {
        if ((blurEvent.target as HTMLButtonElement).disabled) handleBlur(blurEvent as never);
        blurEvent.target?.removeEventListener('blur', handleNativeBlur as EventListener);
      };
      target.addEventListener('blur', handleNativeBlur);
      setChildIsFocusVisible(true);
      handleMouseOver(event);
    }
  };

  const childProps = children.props;
  const detectTouchStart = (event: React.TouchEvent) => {
    ignoreNonTouchEvents.current = true;
    if (typeof childProps.onTouchStart === 'function') childProps.onTouchStart(event);
  };
  const handleTouchStart = (event: React.TouchEvent) => {
    detectTouchStart(event);
    leaveTimer.clear();
    closeTimer.clear();
    stopTouchInteraction();
    prevUserSelect.current = bodyStyle().WebkitUserSelect;
    bodyStyle().WebkitUserSelect = 'none';
    touchTimer.start(ENTER_TOUCH_DELAY, () => {
      bodyStyle().WebkitUserSelect = prevUserSelect.current;
      // MUI handleTriggerMouseOver (controlled) → handleMouseOver with the touchstart event.
      handleMouseOver({ type: 'touchstart' });
    });
  };
  const handleTouchEnd = (event: React.TouchEvent) => {
    if (typeof childProps.onTouchEnd === 'function') childProps.onTouchEnd(event);
    stopTouchInteraction();
    leaveTimer.start(LEAVE_TOUCH_DELAY, handleClose);
  };

  // MUI: Escape while open closes (controlled: re-arms the touch flag reset).
  const handleCloseRef = useRef(handleClose);
  handleCloseRef.current = handleClose;
  useEffect(() => {
    if (!openProp) return undefined;
    const onKeyDown = (nativeEvent: KeyboardEvent) => {
      if (nativeEvent.key === 'Escape') handleCloseRef.current();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [openProp]);

  // There is no point in displaying an empty tooltip (MUI: all falsy titles except 0).
  const open = !title && title !== 0 ? false : openProp;

  const titleIsString = typeof title === 'string';
  const nameOrDesc: AnyProps = describeChild
    ? { title: !open && titleIsString ? title : null, 'aria-describedby': open ? id : null }
    : { 'aria-label': titleIsString ? title : null, 'aria-labelledby': open && !titleIsString ? id : null };

  const childRef = (childProps as { ref?: unknown }).ref ?? (children as { ref?: unknown }).ref;
  const forkRef = useCallback(
    (node: HTMLElement | null) => {
      setChildNode(node);
      let cleanup: (() => void) | undefined;
      if (typeof childRef === 'function') {
        const returned = childRef(node);
        cleanup =
          typeof returned === 'function' ? (returned as () => void) : () => (childRef as (v: null) => void)(null);
      } else if (childRef && typeof childRef === 'object') {
        (childRef as React.MutableRefObject<unknown>).current = node;
        cleanup = () => {
          (childRef as React.MutableRefObject<unknown>).current = null;
        };
      }
      return () => {
        setChildNode(null);
        cleanup?.();
      };
    },
    [childRef],
  );
  const triggerProps: AnyProps = {
    ...nameOrDesc,
    ...other,
    ...childProps,
    className: cx(other.className, childProps.className),
    ref: forkRef,
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
  triggerProps.onMouseOver = compose(handleMouseOver, triggerProps.onMouseOver);
  triggerProps.onMouseLeave = compose(handleMouseLeave, triggerProps.onMouseLeave);
  triggerProps.onFocus = compose(handleFocus as never, triggerProps.onFocus);
  triggerProps.onBlur = compose(handleBlur as never, triggerProps.onBlur);
  const interactive: AnyProps = disableInteractive
    ? {}
    : { onMouseOver: handleMouseOver, onMouseLeave: handleMouseLeave, onFocus: handleFocus, onBlur: handleBlur };

  // MUI composeClasses: per slot key, the utility class then the caller's override.
  const c = (key: keyof TooltipClassesOverride, on = true) =>
    on ? [`MuiTooltip-${key}`, classes?.[key]].filter(Boolean).join(' ') : '';
  const touch = ignoreNonTouchEvents.current;
  const popperClass = [
    c('popper'),
    c('popperInteractive', !disableInteractive),
    c('popperArrow', arrow),
    c('popperClose', !open),
  ]
    .filter(Boolean)
    .join(' ');
  const side = capitalize(placement.split('-')[0]) as 'Top' | 'Bottom' | 'Left' | 'Right';
  const tooltipClass = [c('tooltip'), c('touch', touch), c('tooltipArrow', arrow), c(`tooltipPlacement${side}`)]
    .filter(Boolean)
    .join(' ');

  const { className: popperSlotClass, popperOptions: popperSlotOptions, ...popperSlotRest } = slotProps.popper ?? {};
  const popperOptions = useMemo(
    () => ({
      ...popperSlotOptions,
      modifiers: [
        { name: 'arrow', enabled: Boolean(arrowRef), options: { element: arrowRef, padding: 4 } },
        ...(popperSlotOptions?.modifiers ?? []),
      ],
    }),
    [arrowRef, popperSlotOptions],
  );
  const { className: tooltipSlotClass, ...tooltipSlotRest } = slotProps.tooltip ?? {};
  const { className: arrowSlotClass, ...arrowSlotRest } = slotProps.arrow ?? {};

  return (
    <>
      {React.cloneElement(children, triggerProps)}
      <OwnPopper
        placement={placement}
        anchorEl={childNode}
        open={childNode ? open : false}
        id={id}
        transition
        {...interactive}
        {...(popperSlotRest as AnyProps)}
        className={cx(popperClass, popperSlotClass)}
        data-slot="tooltip-popper"
        data-vg-core=""
        popperOptions={popperOptions as never}
      >
        {({ TransitionProps }: { TransitionProps?: AnyProps }) => (
          <Grow timeout={SHORTER} {...TransitionProps} {...(slotProps.transition ?? {})}>
            <div
              {...(tooltipSlotRest as AnyProps)}
              className={cx(tooltipClass, vgType, tooltipSlotClass)}
              data-slot="tooltip"
              data-vg-core=""
            >
              {title}
              {arrow ? (
                <span
                  className={cx(c('arrow'), arrowSlotClass)}
                  {...(arrowSlotRest as AnyProps)}
                  ref={setArrowRef}
                  data-slot="tooltip-arrow"
                  data-vg-core=""
                />
              ) : null}
            </div>
          </Grow>
        )}
      </OwnPopper>
    </>
  );
};
