import React, { useCallback, useRef } from 'react';
import { EASE_IN_OUT } from '../../core/transition';
import { reflow, Transition, TransitionStatus, TransitionTimeout } from './Transition';

type NodeCallback = (node: HTMLElement) => void;
type EnterCallback = (node: HTMLElement, isAppearing: boolean) => void;

export interface FadeProps {
  in?: boolean;
  appear?: boolean;
  timeout?: TransitionTimeout;
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

/** MUI theme defaults: enteringScreen 225ms, leavingScreen 195ms. */
const DEFAULT_TIMEOUT = { enter: 225, exit: 195 };
const STYLES: Record<Exclude<TransitionStatus, 'unmounted'>, React.CSSProperties> = {
  entering: { opacity: 1 },
  entered: { opacity: 1 },
  exiting: { opacity: 0 },
  exited: { opacity: 0 },
};
const HIDDEN: React.CSSProperties = { opacity: 0, visibility: 'hidden' };

const formatMs = (ms: number) => `${Math.round(ms)}ms`;

/** MUI `theme.transitions.create('opacity', { duration, easing, delay })`. */
const opacityTransition = (duration: number | string, easing: string | undefined, delay: number | string | undefined) =>
  `opacity ${typeof duration === 'string' ? duration : formatMs(duration)} ${easing ?? EASE_IN_OUT} ${
    typeof delay === 'string' ? delay : formatMs(delay ?? 0)
  }`;

/** MUI `getTransitionProps`. */
const transitionProps = (props: FadeProps, mode: 'enter' | 'exit') => {
  const style = (props.style ?? {}) as Record<string, unknown>;
  const timeout = props.timeout ?? DEFAULT_TIMEOUT;
  return {
    duration:
      (style.transitionDuration as number | string | undefined) ??
      (typeof timeout === 'number' ? timeout : timeout[mode] || 0),
    easing:
      (style.transitionTimingFunction as string | undefined) ??
      (typeof props.easing === 'object' ? props.easing[mode] : props.easing),
    delay: style.transitionDelay as number | string | undefined,
  };
};

/** MUI 9.5 Fade on the own Transition: same styles, transition strings, callback order and timings. */
export const Fade = (props: FadeProps) => {
  const {
    in: inProp,
    appear = true,
    children,
    style,
    timeout = DEFAULT_TIMEOUT,
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
  const childRef = (children.props as { ref?: unknown }).ref;
  // MUI useForkRef: one stable callback per (Fade ref, child ref), passing React 19 ref cleanups through.
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
  const childStyleProp = children.props.style;
  return (
    <Transition
      in={inProp}
      appear={appear}
      enter={enter}
      exit={exit}
      timeout={timeout}
      mountOnEnter={mountOnEnter}
      unmountOnExit={unmountOnExit}
      nodeRef={nodeRef}
      addEndListener={props.addEndListener ? (done: () => void) => props.addEndListener?.(node(), done) : undefined}
      onEnter={(isAppearing) => {
        const n = node();
        reflow(n);
        const t = transitionProps(props, 'enter');
        n.style.transition = opacityTransition(t.duration, t.easing, t.delay);
        props.onEnter?.(n, isAppearing);
      }}
      onEntering={(isAppearing) => props.onEntering?.(node(), isAppearing)}
      onEntered={(isAppearing) => props.onEntered?.(node(), isAppearing)}
      onExit={() => {
        const n = node();
        const t = transitionProps(props, 'exit');
        n.style.transition = opacityTransition(t.duration, t.easing, t.delay);
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
