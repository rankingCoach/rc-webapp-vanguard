// Ported from @mui/material@9.5.0 ButtonBase/TouchRipple.js (MIT)
import { classNames } from '@helpers/classNames';
import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { mergeRippleOrder, rippleGeometry } from '../../core/ripple';

const DURATION = 550;
const DELAY_RIPPLE = 80;
const NOOP = () => undefined;

interface RippleItem {
  key: number;
  pulsate: boolean;
  x: number;
  y: number;
  size: number;
  exiting: boolean;
}

type PointerLike = { clientX?: number; clientY?: number; touches?: ArrayLike<{ clientX: number; clientY: number }> };
type RippleEvent = (React.SyntheticEvent | Event) & PointerLike;

export interface TouchRippleActions {
  start: (event?: React.SyntheticEvent, options?: { pulsate?: boolean; center?: boolean }, cb?: () => void) => void;
  pulsate: (event?: React.SyntheticEvent) => void;
  stop: (event?: React.SyntheticEvent, cb?: () => void) => void;
}

export type TouchRippleClasses = Partial<
  Record<'root' | 'ripple' | 'rippleVisible' | 'ripplePulsate' | 'child' | 'childLeaving' | 'childPulsate', string>
>;

export type TouchRippleProps = React.HTMLAttributes<HTMLElement> & { center?: boolean; classes?: TouchRippleClasses };

/**
 * Ripple = port of MUI 9.5 TouchRipple + useLazyRipple semantics, so timing and DOM match:
 * - every call waits for the lazily mounted root and runs in a microtask (LazyRipple `mount().then`);
 * - `stop`/`start` store a callback that runs from an effect once the ripple list changed, and a later call
 *   overwrites it (MUI `rippleCallback`);
 * - `stop` marks the oldest active ripple as exiting; exiting ripples unmount after 550 ms;
 * - DOM order follows MUI's mergeRippleOrder; touch starts are delayed 80 ms.
 * Geometry comes from the framework-free core, measured on the ripple root (the host's padding box).
 */
export const useRipple = (options: {
  center: boolean;
  touchRippleRef?: React.Ref<TouchRippleActions>;
  TouchRippleProps?: Partial<TouchRippleProps>;
}) => {
  const { touchRippleRef, TouchRippleProps: rippleProps } = options;
  const centerProp = options.center || Boolean(rippleProps?.center);
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const [state, setState] = useState<{ items: RippleItem[]; order: number[] }>({ items: [], order: [] });
  const nextKey = useRef(0);
  const rippleCallback = useRef<(() => void) | null>(null);
  const ignoringMouseDown = useRef(false);
  const startTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const startTimerCommit = useRef<(() => void) | null>(null);
  const exitTimers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const timers = exitTimers.current;
    return () => {
      mountedRef.current = false;
      clearTimeout(startTimer.current);
      for (const t of timers.values()) clearTimeout(t);
      timers.clear();
    };
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: runs the stored callback after every ripple-list change (MUI TouchRipple `useEffect(..., [ripples])`)
  useEffect(() => {
    if (rippleCallback.current) {
      const cb = rippleCallback.current;
      rippleCallback.current = null;
      cb();
    }
  }, [state.items]);

  // Exiting ripples leave the DOM after their exit animation (MUI Transition timeout = DURATION).
  useEffect(() => {
    for (const r of state.items) {
      if (r.exiting && !exitTimers.current.has(r.key)) {
        exitTimers.current.set(
          r.key,
          setTimeout(() => {
            exitTimers.current.delete(r.key);
            if (!mountedRef.current) return;
            setState((prev) => {
              const items = prev.items.filter((i) => i.key !== r.key);
              return {
                items,
                order: mergeRippleOrder(
                  prev.order.filter((k) => k !== r.key),
                  items.filter((i) => !i.exiting).map((i) => i.key),
                ),
              };
            });
          }, DURATION),
        );
      }
    }
  }, [state.items]);

  const startCommit = useCallback((item: Omit<RippleItem, 'key' | 'exiting'>, cb: () => void) => {
    const key = nextKey.current++;
    setState((prev) => {
      const items = [...prev.items, { ...item, key, exiting: false }];
      return {
        items,
        order: mergeRippleOrder(
          prev.order,
          items.filter((i) => !i.exiting).map((i) => i.key),
        ),
      };
    });
    rippleCallback.current = cb;
  }, []);

  const startNow = useCallback(
    (
      event: RippleEvent = {} as RippleEvent,
      opts: { pulsate?: boolean; center?: boolean } = {},
      cb: () => void = NOOP,
    ) => {
      const pulsate = opts.pulsate ?? false;
      const center = opts.center ?? (centerProp || pulsate);
      if (event.type === 'mousedown' && ignoringMouseDown.current) {
        ignoringMouseDown.current = false;
        return;
      }
      if (event.type === 'touchstart') ignoringMouseDown.current = true;
      const root = rootRef.current;
      const rect = root ? root.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 };
      const point = event.touches?.[0] ?? event;
      const g = rippleGeometry({
        rect,
        center,
        clientX: point.clientX,
        clientY: point.clientY,
        clientWidth: root?.clientWidth ?? 0,
        clientHeight: root?.clientHeight ?? 0,
      });
      const item = { pulsate, x: g.x, y: g.y, size: g.size };
      if (event.touches) {
        if (startTimerCommit.current === null) {
          startTimerCommit.current = () => startCommit(item, cb);
          startTimer.current = setTimeout(() => {
            startTimerCommit.current?.();
            startTimerCommit.current = null;
          }, DELAY_RIPPLE);
        }
      } else {
        startCommit(item, cb);
      }
    },
    [centerProp, startCommit],
  );

  const stopNow = useCallback((event?: RippleEvent, cb?: () => void) => {
    clearTimeout(startTimer.current);
    if (event?.type === 'touchend' && startTimerCommit.current) {
      startTimerCommit.current();
      startTimerCommit.current = null;
      startTimer.current = setTimeout(() => stopNow(event, cb), 0);
      return;
    }
    startTimerCommit.current = null;
    setState((prev) => {
      const idx = prev.items.findIndex((i) => !i.exiting);
      if (idx === -1) return prev;
      const items = prev.items.slice();
      items[idx] = { ...items[idx], exiting: true };
      return {
        items,
        order: mergeRippleOrder(
          prev.order,
          items.filter((i) => !i.exiting).map((i) => i.key),
        ),
      };
    });
    rippleCallback.current = cb ?? null;
  }, []);

  // ---- lazy mount (MUI LazyRipple): every call waits for the root, always asynchronously.
  const [shouldMount, setShouldMount] = useState(false);
  const mountPromise = useRef<{ promise: Promise<void>; resolve: () => void } | null>(null);
  const mount = useCallback(() => {
    if (!mountPromise.current) {
      let resolve: () => void = NOOP;
      const promise = new Promise<void>((r) => {
        resolve = r;
      });
      mountPromise.current = { promise, resolve };
      setShouldMount(true);
    }
    return mountPromise.current.promise;
  }, []);
  useEffect(() => {
    if (shouldMount) mountPromise.current?.resolve();
  }, [shouldMount]);

  const start = useCallback<TouchRippleActions['start']>(
    (event, opts, cb) => {
      void mount().then(() => startNow(event as RippleEvent, opts, cb));
    },
    [mount, startNow],
  );
  const stop = useCallback<TouchRippleActions['stop']>(
    (event, cb) => {
      void mount().then(() => stopNow(event as RippleEvent, cb));
    },
    [mount, stopNow],
  );
  const pulsate = useCallback<TouchRippleActions['pulsate']>(() => {
    void mount().then(() => startNow({} as RippleEvent, { pulsate: true }));
  }, [mount, startNow]);

  useImperativeHandle(
    touchRippleRef,
    () => ({
      start: startNow as TouchRippleActions['start'],
      stop: stopNow,
      pulsate: () => startNow({} as RippleEvent, { pulsate: true }),
    }),
    [startNow, stopNow],
  );

  const byKey = new Map(state.items.map((r) => [r.key, r]));
  const ordered = state.order.map((k) => byKey.get(k)).filter((r): r is RippleItem => Boolean(r));
  const { center: _center, classes: rc, className: rootClassName, ...rootRest } = rippleProps ?? {};
  const element = (
    <span
      {...rootRest}
      className={classNames('MuiTouchRipple-root', rc?.root ?? '', rootClassName ?? '')}
      ref={rootRef}
    >
      {ordered.map((r) => (
        <span
          key={r.key}
          className={classNames(
            'MuiTouchRipple-ripple',
            rc?.ripple ?? '',
            'MuiTouchRipple-rippleVisible',
            rc?.rippleVisible ?? '',
            r.pulsate ? classNames('MuiTouchRipple-ripplePulsate', rc?.ripplePulsate ?? '') : '',
          )}
          style={{ width: r.size, height: r.size, top: -(r.size / 2) + r.y, left: -(r.size / 2) + r.x }}
        >
          <span
            className={classNames(
              'MuiTouchRipple-child',
              rc?.child ?? '',
              r.exiting ? classNames('MuiTouchRipple-childLeaving', rc?.childLeaving ?? '') : '',
              r.pulsate ? classNames('MuiTouchRipple-childPulsate', rc?.childPulsate ?? '') : '',
            )}
          />
        </span>
      ))}
    </span>
  );

  return { mounted: shouldMount, start, stop, pulsate, element };
};
