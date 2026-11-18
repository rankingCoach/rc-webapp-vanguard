import React, { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Placement } from '../../core/anchored-placement';
import { AnchorLike, computeAnchored } from './compute-anchored';
import { listScrollParents } from './dom-geometry';
import { PopperModifierLike, resolvePopperOptions } from './popper-options';
import { initialPopperStyles, mapToStyles } from './popper-styles';

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyProps = Record<string, any>;

type AnchorProp = AnchorLike | null | undefined | (() => AnchorLike | null | undefined);

export interface OwnPopperProps extends AnyProps {
  open: boolean;
  anchorEl?: AnchorProp;
  children?: React.ReactNode | ((props: { placement: Placement; TransitionProps?: AnyProps }) => React.ReactNode);
  placement?: Placement;
  modifiers?: PopperModifierLike[];
  popperOptions?: { placement?: Placement; strategy?: 'absolute' | 'fixed'; modifiers?: PopperModifierLike[] };
  disablePortal?: boolean;
  container?: Element | (() => Element | null) | null;
  keepMounted?: boolean;
  transition?: boolean;
  popperRef?: React.Ref<{ update: () => void; forceUpdate: () => void } | null>;
  ref?: React.Ref<HTMLDivElement | null>;
}

const resolve = <T,>(value: T | (() => T)): T => (typeof value === 'function' ? (value as () => T)() : value);

/** The positioned element (MUI BasePopper's PopperTooltip), placed by the own core instead of popper.js. */
const PopperTooltip = (props: OwnPopperProps & { TransitionProps?: AnyProps }) => {
  const {
    open,
    anchorEl,
    children,
    placement: placementProp = 'bottom',
    modifiers,
    popperOptions,
    disablePortal,
    popperRef,
    TransitionProps,
    ref,
    keepMounted: _k,
    transition: _t,
    container: _c,
    style,
    ...other
  } = props;
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [placement, setPlacement] = useState<Placement>(popperOptions?.placement ?? placementProp);
  const anchor = resolve(anchorEl ?? null);
  const options = resolvePopperOptions({ placement: placementProp, modifiers, popperOptions, disablePortal });

  const update = useCallback(() => {
    const node = nodeRef.current;
    if (!node || !anchor || !open) return;
    const result = computeAnchored(anchor, node, { ...options, altBoundary: Boolean(disablePortal) });
    const size = { width: node.offsetWidth, height: node.offsetHeight };
    Object.assign(
      node.style,
      mapToStyles({
        element: node,
        floatingSize: size,
        placement: result.placement,
        offsets: { x: result.offsetX, y: result.offsetY },
        position: options.strategy,
        isFixed: options.strategy === 'fixed',
        ...options.computeStyles,
      }),
    );
    node.setAttribute('data-popper-placement', result.placement);
    const arrowEl = options.input.arrow?.element as HTMLElement | undefined;
    if (arrowEl && result.arrow) {
      Object.assign(
        arrowEl.style,
        mapToStyles({
          element: node,
          floatingSize: size,
          placement: result.placement,
          offsets: result.arrow,
          position: 'absolute',
          isFixed: options.strategy === 'fixed',
          gpuAcceleration: options.computeStyles.gpuAcceleration,
          adaptive: false,
          roundOffsets: options.computeStyles.roundOffsets,
        }),
      );
    }
    setPlacement((prev) => (prev === result.placement ? prev : result.placement));
  }, [anchor, open, options, disablePortal]);

  const updateRef = useRef(update);
  updateRef.current = update;
  useImperativeHandle(
    popperRef,
    () => ({ update: () => updateRef.current(), forceUpdate: () => updateRef.current() }),
    [],
  );

  // Create: popper's applyStyles effect writes the initial styles, then positions. Re-run on what MUI recreates the
  // popper for (anchor, open, strategy, portal); every other change is picked up by the per-render update below.
  // biome-ignore lint/correctness/useExhaustiveDependencies: positioning reads the latest options through updateRef.
  useLayoutEffect(() => {
    const node = nodeRef.current;
    if (!node || !anchor || !open) return undefined;
    Object.assign(node.style, initialPopperStyles(options.strategy));
    updateRef.current();
    // popper's eventListeners modifier: scroll on every scroll parent of anchor and popper, resize on window.
    const targets = [...('nodeType' in anchor ? listScrollParents(anchor as Element) : []), ...listScrollParents(node)];
    const onEvent = () => updateRef.current();
    for (const t of targets) t.addEventListener('scroll', onEvent, { passive: true });
    const win = node.ownerDocument.defaultView ?? window;
    win.addEventListener('resize', onEvent, { passive: true });
    return () => {
      for (const t of targets) t.removeEventListener('scroll', onEvent);
      win.removeEventListener('resize', onEvent);
    };
  }, [anchor, open, options.strategy, disablePortal]);

  // MUI BasePopper calls forceUpdate after every render.
  useEffect(() => {
    updateRef.current();
  });

  const childProps: { placement: Placement; TransitionProps?: AnyProps } = { placement };
  if (TransitionProps !== null && TransitionProps !== undefined) childProps.TransitionProps = TransitionProps;
  return (
    <div
      role="tooltip"
      {...other}
      style={style}
      ref={(node) => {
        nodeRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
    >
      {typeof children === 'function' ? children(childProps) : children}
    </div>
  );
};

/**
 * MUI 9.5 Popper semantics (BasePopper) on Vanguard's own core: portal unless `disablePortal`, `keepMounted`,
 * `transition` with `TransitionProps.onEnter/onExited` driving the exited state, children as a function receiving
 * `{ placement, TransitionProps }`, hidden with `display: none` while closed and kept mounted.
 */
export const OwnPopper = (props: OwnPopperProps) => {
  const {
    open,
    anchorEl,
    container: containerProp,
    disablePortal = false,
    keepMounted = false,
    transition = false,
    style,
    className,
    ...rest
  } = props;
  const [exited, setExited] = useState(true);
  if (!keepMounted && !open && (!transition || exited)) return null;
  let container: Element | null | undefined;
  if (containerProp) container = resolve(containerProp);
  else if (anchorEl) {
    const resolved = resolve(anchorEl);
    container =
      resolved && 'nodeType' in (resolved as object) ? (resolved as Element).ownerDocument.body : document.body;
  }
  const display = !open && keepMounted && (!transition || exited) ? 'none' : undefined;
  const TransitionProps = transition
    ? { in: open, onEnter: () => setExited(false), onExited: () => setExited(true) }
    : undefined;
  const tooltip = (
    <PopperTooltip
      {...rest}
      anchorEl={anchorEl}
      open={transition ? !exited : open}
      disablePortal={disablePortal}
      className={['MuiPopper-root', className].filter(Boolean).join(' ')}
      data-slot="popper"
      TransitionProps={TransitionProps}
      style={{ position: 'fixed', top: 0, left: 0, display, ...style }}
    />
  );
  // MUI Portal: no container (no anchorEl, no container prop) renders into document.body.
  return disablePortal ? tooltip : createPortal(tooltip, container ?? document.body);
};
