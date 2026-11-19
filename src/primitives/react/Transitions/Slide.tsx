// Ported from @mui/material@9.5.0 Slide/Slide.js (MIT)
import React, { useCallback, useEffect, useRef } from 'react';
import { EASE_IN_OUT } from '../../core/transition';
import { reflow, Transition, TransitionTimeout } from './Transition';

type Direction = 'left' | 'right' | 'up' | 'down';
type Container = HTMLElement | null | (() => HTMLElement | null);
type NodeCallback = (node: HTMLElement) => void;
type EnterCallback = (node: HTMLElement, isAppearing: boolean) => void;

export interface SlideProps {
  in?: boolean;
  appear?: boolean;
  direction?: Direction;
  container?: Container;
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
  disablePrefersReducedMotion?: boolean;
  /** Anything else lands on the child, like MUI (Transition's `childProps`). */
  [extra: string]: unknown;
}

const DEFAULT_TIMEOUT = { enter: 225, exit: 195 };
const DEFAULT_EASING = { enter: 'cubic-bezier(0.0, 0, 0.2, 1)', exit: 'cubic-bezier(0.4, 0, 0.6, 1)' };
const OFFSET_INDEXES = {
  matrix: [4, 5],
  matrix3d: [12, 13],
  translate: [0, 1],
  translate3d: [0, 1],
  translateX: [0, null],
  translateY: [null, 0],
} as const;

/** Read natural layout, preserving SwipeableDrawer's active gesture when requested. */
export const setTranslateValue = (
  direction: Direction,
  node: HTMLElement,
  container?: Container,
  { resetInlineTransform = true } = {},
) => {
  const resolvedContainer = typeof container === 'function' ? container() : container;
  const containerRect = resolvedContainer?.getBoundingClientRect();
  const win = node.ownerDocument.defaultView ?? window;
  const previousTransform = node.style.transform;
  const previousTransition = node.style.transition;
  if (resetInlineTransform) {
    node.style.transition = '';
    node.style.transform = '';
  }
  const rect = node.getBoundingClientRect();
  const transform = win.getComputedStyle(node).getPropertyValue('transform');
  if (resetInlineTransform) {
    node.style.transform = previousTransform;
    node.style.transition = previousTransition;
  }
  const match = transform.match(/^(matrix|matrix3d|translate|translate3d|translateX|translateY)\((.+)\)$/);
  const values = match?.[2].split(',').map((value) => parseFloat(value) || 0);
  const indexes = match ? OFFSET_INDEXES[match[1] as keyof typeof OFFSET_INDEXES] : undefined;
  const offsetX = indexes && indexes[0] !== null ? values?.[indexes[0]] || 0 : 0;
  const offsetY = indexes && indexes[1] !== null ? values?.[indexes[1]] || 0 : 0;
  if (direction === 'left')
    node.style.transform = `translateX(${(containerRect?.right ?? win.innerWidth) + offsetX - rect.left}px)`;
  else if (direction === 'right') {
    node.style.transform = `translateX(-${containerRect ? rect.right - containerRect.left - offsetX : rect.left + rect.width - offsetX}px)`;
  } else if (direction === 'up') {
    node.style.transform = `translateY(${(containerRect?.bottom ?? win.innerHeight) + offsetY - rect.top}px)`;
  } else node.style.transform = `translateY(-${rect.top - (containerRect?.top ?? 0) + rect.height - offsetY}px)`;
};

const asTime = (value: number | string) => (typeof value === 'string' ? value : `${Math.round(value)}ms`);

/** MUI 9.5 Slide on the own Transition, with the default reducedMotion 'never'. */
export const Slide = (props: SlideProps) => {
  const {
    in: inProp,
    appear = true,
    direction = 'down',
    container,
    children,
    style,
    timeout = DEFAULT_TIMEOUT,
    easing = DEFAULT_EASING,
    ref,
    mountOnEnter,
    unmountOnExit,
    enter,
    exit,
    addEndListener,
    onEnter,
    onEntering,
    onEntered,
    onExit,
    onExiting,
    onExited,
    disablePrefersReducedMotion: _disablePrefersReducedMotion,
    ownerState: _ownerState,
    ...childExtra
  } = props;
  const nodeRef = useRef<HTMLElement | null>(null);
  const preserveInlineTransform = useRef(false);
  const childRef = children.props.ref;
  const handleRef = useCallback(
    (node: HTMLElement | null) => {
      nodeRef.current = node;
      const cleanups = [childRef, ref].map((r) => {
        if (typeof r === 'function') {
          const cleanup = r(node);
          return typeof cleanup === 'function' ? cleanup : () => r(null);
        }
        if (r && typeof r === 'object') {
          r.current = node;
          return () => {
            r.current = null;
          };
        }
        return () => undefined;
      });
      return () => {
        nodeRef.current = null;
        for (const cleanup of cleanups) cleanup();
      };
    },
    [childRef, ref],
  );
  const node = () => nodeRef.current as HTMLElement;
  const transition = (mode: 'enter' | 'exit') => {
    const duration = style?.transitionDuration ?? (typeof timeout === 'number' ? timeout : timeout[mode] || 0);
    const timing = style?.transitionTimingFunction ?? (typeof easing === 'object' ? easing[mode] : easing);
    return `transform ${asTime(duration)} ${timing ?? EASE_IN_OUT} ${asTime(style?.transitionDelay ?? 0)}`;
  };
  const updatePosition = useCallback(() => {
    if (nodeRef.current) setTranslateValue(direction, nodeRef.current, container);
  }, [direction, container]);
  useEffect(() => {
    if (inProp || direction === 'down' || direction === 'right') return undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const handleResize = () => {
      clearTimeout(timer);
      timer = setTimeout(updatePosition, 166);
    };
    const win = nodeRef.current?.ownerDocument.defaultView ?? window;
    win.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      win.removeEventListener('resize', handleResize);
    };
  }, [direction, inProp, updatePosition]);
  useEffect(() => {
    if (!inProp && !preserveInlineTransform.current) updatePosition();
  }, [inProp, updatePosition]);

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
      addEndListener={addEndListener ? (done: () => void) => addEndListener(node(), done) : undefined}
      onEnter={(isAppearing) => {
        setTranslateValue(direction, node(), container);
        reflow(node());
        onEnter?.(node(), isAppearing);
      }}
      onEntering={(isAppearing) => {
        node().style.transition = transition('enter');
        node().style.transform = 'none';
        onEntering?.(node(), isAppearing);
      }}
      onEntered={(isAppearing) => onEntered?.(node(), isAppearing)}
      onExit={() => {
        const n = node();
        n.style.transition = transition('exit');
        preserveInlineTransform.current = /^translate\(.+,\s*.+\)$/.test(n.style.transform);
        setTranslateValue(direction, n, container, { resetInlineTransform: !preserveInlineTransform.current });
        onExit?.(n);
      }}
      onExiting={() => onExiting?.(node())}
      onExited={() => {
        preserveInlineTransform.current = false;
        node().style.transition = '';
        onExited?.(node());
      }}
    >
      {(status) =>
        React.cloneElement(children, {
          ref: handleRef,
          style:
            status === 'exited' && !inProp
              ? { visibility: 'hidden', ...style, ...children.props.style }
              : style && children.props.style
                ? { ...style, ...children.props.style }
                : style || children.props.style,
          ...childExtra,
        } as never)
      }
    </Transition>
  );
};
