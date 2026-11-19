// Ported from @mui/material@9.5.0 internal/Transition.js (MIT)
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';

export type TransitionStatus = 'unmounted' | 'exited' | 'entering' | 'entered' | 'exiting';
export type TransitionTimeout = number | { appear?: number; enter?: number; exit?: number };

export interface TransitionProps {
  in?: boolean;
  appear?: boolean;
  enter?: boolean;
  exit?: boolean;
  mountOnEnter?: boolean;
  unmountOnExit?: boolean;
  timeout?: TransitionTimeout;
  addEndListener?: ((done: () => void) => void) | ((node: HTMLElement, done: () => void) => void);
  nodeRef: React.RefObject<HTMLElement | null>;
  /** MUI `getAutoTimeout` (Grow/Collapse timeout 'auto'): wins over `timeout` when it returns a value. */
  getAutoTimeout?: () => number | null;
  onEnter?: (isAppearing: boolean) => void;
  onEntering?: (isAppearing: boolean) => void;
  onEntered?: (isAppearing: boolean) => void;
  onExit?: () => void;
  onExiting?: () => void;
  onExited?: () => void;
  children: (status: TransitionStatus) => React.ReactNode;
}

const resolveTimeouts = (timeout: TransitionTimeout | undefined) => {
  if (timeout == null) return { appear: undefined, enter: undefined, exit: undefined };
  if (typeof timeout === 'number') return { appear: timeout, enter: timeout, exit: timeout };
  return {
    appear: timeout.appear !== undefined ? timeout.appear : timeout.enter,
    enter: timeout.enter,
    exit: timeout.exit,
  };
};

const completionTimeout = (
  status: TransitionStatus,
  isAppearing: boolean,
  timeout: TransitionTimeout | undefined,
  autoTimeout?: number | null,
) => {
  if (autoTimeout != null) return autoTimeout;
  const r = resolveTimeouts(timeout);
  if (status === 'entering') return isAppearing ? (r.appear ?? r.enter ?? null) : (r.enter ?? null);
  return r.exit ?? null;
};

export const reflow = (node: HTMLElement) => node.scrollTop;

/**
 * Port of MUI 9.5's internal Transition (react-transition-group semantics without TransitionGroup, reducedMotion
 * 'never', MUI's default): status machine exited → entering → entered → exiting → exited, callbacks fired from layout
 * effects in the same order, completion after the authored timeout (or `addEndListener`).
 */
export const Transition = (props: TransitionProps) => {
  const {
    in: inProp = false,
    appear = false,
    enter = true,
    exit = true,
    mountOnEnter = false,
    unmountOnExit = false,
    children,
  } = props;
  const [status, setStatus] = useState<TransitionStatus>(() => {
    if (inProp) return appear ? 'exited' : 'entered';
    if (mountOnEnter || unmountOnExit) return 'unmounted';
    return 'exited';
  });
  const statusRef = useRef(status);
  statusRef.current = status;
  if (inProp && status === 'unmounted') {
    statusRef.current = 'exited';
    setStatus('exited');
  }
  const shouldAppearOnMount = useRef(inProp && appear);
  const mounted = useRef(false);
  const nextCallback = useRef<(((...a: never[]) => void) & { cancel: () => void }) | null>(null);
  const lastFired = useRef<TransitionStatus>(status);
  const isAppearing = useRef(false);
  const propsRef = useRef(props);
  propsRef.current = props;

  const cancelPending = useCallback(() => {
    if (nextCallback.current !== null) {
      nextCallback.current.cancel();
      nextCallback.current = null;
    }
  }, []);

  const makeCallback = useCallback((handler: () => void) => {
    let active = true;
    const wrapped = Object.assign(
      () => {
        if (active) {
          active = false;
          nextCallback.current = null;
          handler();
        }
      },
      {
        cancel: () => {
          active = false;
        },
      },
    );
    nextCallback.current = wrapped;
    return wrapped;
  }, []);

  const scheduleEnd = useCallback(
    (next: TransitionStatus, current: TransitionStatus) => {
      let timer: ReturnType<typeof setTimeout> | undefined;
      const clear = () => {
        if (timer !== undefined) {
          clearTimeout(timer);
          timer = undefined;
        }
      };
      const done = makeCallback(() => {
        clear();
        statusRef.current = next;
        setStatus(next);
      });
      const cancelDone = done.cancel;
      done.cancel = () => {
        clear();
        cancelDone();
      };
      const p = propsRef.current;
      const node = p.nodeRef.current;
      const authored = completionTimeout(current, isAppearing.current, p.timeout, p.getAutoTimeout?.());
      const schedule = (value: number) => {
        timer = setTimeout(done, value);
      };
      if (!node) {
        schedule(0);
        return;
      }
      if (p.addEndListener) {
        if (authored != null) schedule(authored);
        if (p.addEndListener.length >= 2) (p.addEndListener as (n: HTMLElement, d: () => void) => void)(node, done);
        else (p.addEndListener as (d: () => void) => void)(done);
        return;
      }
      schedule(authored ?? 0);
    },
    [makeCallback],
  );

  const performEnter = useCallback((mounting: boolean) => {
    const p = propsRef.current;
    isAppearing.current = mounting;
    if (!mounting && !(p.enter ?? true)) {
      statusRef.current = 'entered';
      setStatus('entered');
      return;
    }
    p.onEnter?.(mounting);
    statusRef.current = 'entering';
    setStatus('entering');
  }, []);

  const performExit = useCallback(() => {
    const p = propsRef.current;
    if (!(p.exit ?? true)) {
      statusRef.current = 'exited';
      setStatus('exited');
      return;
    }
    p.onExit?.();
    statusRef.current = 'exiting';
    setStatus('exiting');
  }, []);

  const updateStatus = useCallback(
    (mounting: boolean, next: 'entering' | 'exiting') => {
      cancelPending();
      if (next === 'entering') {
        const p = propsRef.current;
        if (p.mountOnEnter || p.unmountOnExit) {
          const node = p.nodeRef.current;
          if (node) reflow(node);
        }
        performEnter(mounting);
      } else {
        performExit();
      }
    },
    [cancelPending, performEnter, performExit],
  );

  useLayoutEffect(() => {
    mounted.current = true;
    if (shouldAppearOnMount.current) {
      shouldAppearOnMount.current = false;
      updateStatus(true, 'entering');
    }
    return () => {
      mounted.current = false;
      cancelPending();
    };
  }, [cancelPending, updateStatus]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: MUI re-evaluates on every status change too.
  useLayoutEffect(() => {
    if (!mounted.current) return;
    const current = statusRef.current;
    if (inProp) {
      if (current !== 'entering' && current !== 'entered') updateStatus(false, 'entering');
    } else if (current === 'entering' || current === 'entered') {
      updateStatus(false, 'exiting');
    } else if (current === 'exited' && unmountOnExit) {
      statusRef.current = 'unmounted';
      setStatus('unmounted');
    }
  }, [inProp, status, unmountOnExit, updateStatus]);

  useLayoutEffect(() => {
    if (status === 'unmounted' || lastFired.current === 'unmounted') {
      lastFired.current = status;
      return;
    }
    const changed = lastFired.current !== status;
    if (changed) lastFired.current = status;
    const p = propsRef.current;
    if (status === 'entering') {
      if (changed) p.onEntering?.(isAppearing.current);
      if (nextCallback.current === null && statusRef.current === status) scheduleEnd('entered', 'entering');
    } else if (status === 'exiting') {
      if (changed) p.onExiting?.();
      if (nextCallback.current === null && statusRef.current === status) scheduleEnd('exited', 'exiting');
    } else if (status === 'entered' && changed) {
      p.onEntered?.(isAppearing.current);
    } else if (status === 'exited' && changed) {
      p.onExited?.();
    }
  }, [scheduleEnd, status]);

  if (status === 'unmounted') return null;
  return <>{children(status)}</>;
};
