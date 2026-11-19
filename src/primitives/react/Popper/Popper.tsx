// Ported from @mui/material@9.5.0 Popper/BasePopper.js (MIT)
import React, { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import type { Placement } from '../../core/anchored-placement';
import { Portal } from '../Portal/Portal';
import { AnchorLike, computeAnchored } from './compute-anchored';
import { layoutSize, listScrollParents } from './dom-geometry';
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

  // The anchor size the last position was computed from (the anchor observer / font triggers compare against it).
  const anchorSize = useRef<{ width: number; height: number } | null>(null);
  const update = useCallback(() => {
    const node = nodeRef.current;
    if (!node || !anchor || !open) return;
    const ar = anchor.getBoundingClientRect();
    anchorSize.current = { width: ar.width, height: ar.height };
    const result = computeAnchored(anchor, node, options);
    const size = layoutSize(node);
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
    // popper applyStyles, in its attribute order (hide's main-phase attributes, then computeStyles' placement):
    // true → present (""), false / disabled → absent.
    for (const [name, on] of [
      ['data-popper-reference-hidden', result.hide?.isReferenceHidden],
      ['data-popper-escaped', result.hide?.hasPopperEscaped],
    ] as const) {
      if (on) node.setAttribute(name, '');
      else node.removeAttribute(name);
    }
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
  }, [anchor, open, options]);

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
    // popper.js `update` is debounced into a microtask: handlers later in the same event (or other listeners that
    // move the anchor) run first, and several events in one task cost one measurement.
    let pending = false;
    let cancelled = false;
    const onEvent = () => {
      if (pending) return;
      pending = true;
      queueMicrotask(() => {
        pending = false;
        if (!cancelled) updateRef.current();
      });
    };
    // Anchor observer / font triggers: re-position only when the anchor's own size changed. A ResizeObserver delivers an
    // initial callback after observe(); if the popper's content grew by then (lazy item icons), re-positioning would
    // move popper and arrow where MUI's popper.js never goes (verifier handoff 14, DropdownMenu arrow 29 → 37).
    const onAnchorChange = () => {
      const last = anchorSize.current;
      const r = anchor.getBoundingClientRect();
      if (last && last.width === r.width && last.height === r.height) return;
      onEvent();
    };
    for (const t of targets) t.addEventListener('scroll', onEvent, { passive: true });
    const win = node.ownerDocument.defaultView ?? window;
    win.addEventListener('resize', onEvent, { passive: true });
    // Beyond popper.js: an anchor that changes size without a render reaching the popper (a lazily loaded Icon inside
    // the trigger, verifier handoff 10) re-positions it. MUI's result in that case was the settled position.
    const RO = (win as typeof window).ResizeObserver;
    const observer = RO && 'nodeType' in anchor ? new RO(onAnchorChange) : null;
    observer?.observe(anchor as Element);
    // ResizeObserver never reports non-replaced inline boxes (an inline text anchor); a web font swapping in after
    // open changes their width (verifier handoff 12, describe-child-chip 63 vs 66). Re-position when fonts load.
    const fonts = (node.ownerDocument as Document).fonts as (EventTarget & FontFaceSet) | undefined;
    fonts?.addEventListener?.('loadingdone', onAnchorChange);
    return () => {
      cancelled = true;
      for (const t of targets) t.removeEventListener('scroll', onEvent);
      win.removeEventListener('resize', onEvent);
      observer?.disconnect();
      fonts?.removeEventListener?.('loadingdone', onAnchorChange);
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
  // Server render: MUI's Portal renders nothing until mounted; there is no document to portal into.
  if (typeof document === 'undefined') return null;
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
  // MUI Popper renders PopperTooltip through Portal: portaled content mounts one commit later (nested overlays register
  // outer first); no container (no anchorEl, no container prop) renders into document.body.
  return (
    <Portal disablePortal={disablePortal} container={container ?? document.body}>
      {tooltip}
    </Portal>
  );
};
