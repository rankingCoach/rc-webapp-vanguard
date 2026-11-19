// Ported from @mui/material@9.5.0 Grow/Grow.js (MIT)
import React, { useCallback, useRef } from 'react';
import { EASE_IN_OUT } from '../../core/transition';
import { reflow, Transition, TransitionStatus, TransitionTimeout } from './Transition';

type NodeCallback = (node: HTMLElement) => void;
type EnterCallback = (node: HTMLElement, isAppearing: boolean) => void;

export interface GrowProps {
  in?: boolean;
  appear?: boolean;
  timeout?: TransitionTimeout | 'auto';
  easing?: string | { enter?: string; exit?: string };
  style?: React.CSSProperties;
  children: React.ReactElement<{ style?: React.CSSProperties; ref?: React.Ref<HTMLElement> }>;
  mountOnEnter?: boolean;
  unmountOnExit?: boolean;
  addEndListener?: (node: HTMLElement, done: () => void) => void;
  onEnter?: EnterCallback;
  onEntering?: EnterCallback;
  onEntered?: EnterCallback;
  onExit?: NodeCallback;
  onExiting?: NodeCallback;
  onExited?: NodeCallback;
  enter?: boolean;
  exit?: boolean;
  ref?: React.Ref<HTMLElement | null>;
  /** Anything else lands on the child, like MUI (Transition's `childProps`). */
  [extra: string]: unknown;
}

const scale = (value: number) => `scale(${value}, ${value ** 2})`;
const STYLES: Record<Exclude<TransitionStatus, 'unmounted'>, React.CSSProperties> = {
  entering: { opacity: 1, transform: scale(1) },
  entered: { opacity: 1, transform: 'none' },
  exiting: { opacity: 0, transform: scale(0.75) },
  exited: { opacity: 0, transform: scale(0.75) },
};
const HIDDEN: React.CSSProperties = { opacity: 0, transform: scale(0.75), visibility: 'hidden' };

/** MUI theme.transitions.getAutoHeightDuration. */
export const autoHeightDuration = (height: number) => {
  if (!height) return 0;
  const constant = height / 36;
  return Math.min(Math.round((4 + 15 * constant ** 0.25 + constant / 5) * 10), 3000);
};

const formatMs = (ms: number) => `${Math.round(ms)}ms`;
const asTime = (v: number | string) => (typeof v === 'string' ? v : formatMs(v));

/** MUI `theme.transitions.create(prop, { duration, easing, delay })`. */
const create = (prop: string, duration: number | string, easing: string | undefined, delay: number | string) =>
  `${prop} ${asTime(duration)} ${easing ?? EASE_IN_OUT} ${asTime(delay)}`;

/** MUI `getTransitionProps`. */
const transitionProps = (props: GrowProps, mode: 'enter' | 'exit') => {
  const style = (props.style ?? {}) as Record<string, unknown>;
  const timeout = props.timeout;
  return {
    duration:
      (style.transitionDuration as number | string | undefined) ??
      (typeof timeout === 'number' ? timeout : typeof timeout === 'object' ? timeout[mode] || 0 : 0),
    easing:
      (style.transitionTimingFunction as string | undefined) ??
      (typeof props.easing === 'object' ? props.easing[mode] : props.easing),
    delay: style.transitionDelay as number | string | undefined,
  };
};

/** MUI 9.5 Grow on the own Transition (reducedMotion 'never'): same styles, transition strings, callbacks, timings. */
export const Grow = (props: GrowProps) => {
  const {
    in: inProp,
    appear = true,
    children,
    style,
    timeout = 'auto',
    ref,
    mountOnEnter,
    unmountOnExit,
    enter,
    exit,
    easing: _easing,
    addEndListener: _ael,
    onEnter: _oe,
    onEntering: _oeg,
    onEntered: _oed,
    onExit: _ox,
    onExiting: _oxg,
    onExited: _oxd,
    ...childExtra
  } = props;
  const nodeRef = useRef<HTMLElement | null>(null);
  const autoTimeout = useRef<number | null>(null);
  const childRef = (children.props as { ref?: unknown }).ref;
  // MUI useForkRef: one stable callback per (Grow ref, child ref), passing React 19 ref cleanups through.
  const handleRef = useCallback(
    (n: HTMLElement | null) => {
      nodeRef.current = n;
      const cleanups = [ref, childRef].map((r) => {
        if (typeof r === 'function') {
          const cleanup = (r as (v: HTMLElement | null) => unknown)(n);
          return typeof cleanup === 'function' ? (cleanup as () => void) : () => (r as (v: null) => void)(null);
        }
        if (r && typeof r === 'object') {
          (r as React.MutableRefObject<HTMLElement | null>).current = n;
          return () => {
            (r as React.MutableRefObject<HTMLElement | null>).current = null;
          };
        }
        return () => undefined;
      });
      return () => {
        nodeRef.current = null;
        for (const c of cleanups) c();
      };
    },
    [ref, childRef],
  );
  const node = () => nodeRef.current as HTMLElement;
  const resolvedProps = { ...props, timeout };

  const durationFor = (n: HTMLElement, mode: 'enter' | 'exit') => {
    const t = transitionProps(resolvedProps, mode);
    if (timeout === 'auto') {
      const d = autoHeightDuration(n.clientHeight);
      autoTimeout.current = d;
      return { ...t, duration: d as number | string };
    }
    autoTimeout.current = null;
    return t;
  };

  const childStyleProp = children.props.style;
  return (
    <Transition
      in={inProp}
      appear={appear}
      enter={enter}
      exit={exit}
      timeout={timeout === 'auto' ? undefined : timeout}
      getAutoTimeout={timeout === 'auto' ? () => autoTimeout.current : undefined}
      mountOnEnter={mountOnEnter}
      unmountOnExit={unmountOnExit}
      nodeRef={nodeRef}
      addEndListener={props.addEndListener ? (done: () => void) => props.addEndListener?.(node(), done) : undefined}
      onEnter={(isAppearing) => {
        const n = node();
        reflow(n);
        const t = durationFor(n, 'enter');
        n.style.transition = [
          create('opacity', t.duration, undefined, t.delay ?? 0),
          create('transform', typeof t.duration === 'string' ? t.duration : t.duration * 0.666, t.easing, t.delay ?? 0),
        ].join(',');
        props.onEnter?.(n, isAppearing);
      }}
      onEntering={(isAppearing) => props.onEntering?.(node(), isAppearing)}
      onEntered={(isAppearing) => props.onEntered?.(node(), isAppearing)}
      onExit={() => {
        const n = node();
        const t = durationFor(n, 'exit');
        n.style.transition = [
          create('opacity', t.duration, undefined, t.delay ?? 0),
          create(
            'transform',
            typeof t.duration === 'string' ? t.duration : t.duration * 0.666,
            t.easing,
            t.delay || (typeof t.duration === 'string' ? t.duration : t.duration * 0.333),
          ),
        ].join(',');
        n.style.opacity = '0';
        n.style.transform = scale(0.75);
        props.onExit?.(n);
      }}
      onExiting={() => props.onExiting?.(node())}
      onExited={() => {
        const n = node();
        n.style.transition = '';
        props.onExited?.(n);
      }}
    >
      {(status) => {
        const base =
          status === 'exited' && !inProp
            ? HIDDEN
            : STYLES[status as Exclude<TransitionStatus, 'unmounted'>] || STYLES.exited;
        const childStyle = style || childStyleProp ? { ...base, ...style, ...childStyleProp } : base;
        return React.cloneElement(children, {
          ...(childExtra as Record<string, unknown>),
          style: childStyle,
          ref: handleRef,
        } as never);
      }}
    </Transition>
  );
};
