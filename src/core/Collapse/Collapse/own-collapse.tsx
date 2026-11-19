// Ported from @mui/material@9.5.0 Collapse/Collapse.js (MIT)
// Own-core MUI markup: internal `cx` (clsx semantics, as MUI emits), not the public classNames helper (track h).

import React, { useRef } from 'react';
import { cx } from '../../../primitives/react/class-names';
import { Transition } from '../../../primitives/react/Transitions/Transition';

/** MUI theme `transitions.duration.standard`: MUI Collapse's default timeout. */
const STANDARD_MS = 300;

/** MUI 9.5 `theme.transitions.getAutoHeightDuration` (createTransitions.js). */
export const getAutoHeightDuration = (height: number) => {
  if (!height) return 0;
  const constant = height / 36;
  return Math.min(Math.round((4 + 15 * constant ** 0.25 + constant / 5) * 10), 3000);
};

export interface OwnCollapseProps {
  in: boolean;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
  /** Default 300 (Vanguard's Collapse). `'auto'` (MUI Accordion): duration from the content size. */
  timeout?: number | 'auto';
  children: React.ReactNode;
}

/**
 * MUI 9.5 Collapse for the props Vanguard's Collapse and Accordion pass (`in`, `orientation`, `className`, `timeout`
 * 300 ms or 'auto'; collapsedSize '0px', appear false, no unmountOnExit, theme reducedMotion 'never') on the own Transition. Same DOM (root > wrapper > wrapperInner, the
 * same Mui* classes, inline min-size and the inline size/transition writes at each step); emotion's hashed classes
 * are replaced by `data-vg-core` and the static rules in _Collapse.compat.scss (D15 last block). Component-local:
 * offered to A for src/primitives.
 */
export const OwnCollapse = ({
  in: inProp,
  orientation = 'vertical',
  className,
  timeout = STANDARD_MS,
  children,
}: OwnCollapseProps) => {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const autoTransitionDuration = useRef<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const isHorizontal = orientation === 'horizontal';
  const size = isHorizontal ? 'width' : 'height';
  const collapsedSize = '0px';
  const getWrapperSize = () =>
    wrapperRef.current ? wrapperRef.current[isHorizontal ? 'clientWidth' : 'clientHeight'] : 0;
  const node = () => nodeRef.current as HTMLDivElement;
  // MUI writes transitionDuration, then the size, then transitionTimingFunction = easing (undefined when no easing is
  // passed: browsers ignore it, jsdom stores the string) — same writes, same order.
  // timeout 'auto': MUI stores the size-derived duration, writes it, and Transition completes after it (getAutoTimeout).
  const setDuration = (n: HTMLDivElement, wrapperSize: number) => {
    autoTransitionDuration.current = timeout === 'auto' ? getAutoHeightDuration(wrapperSize) : null;
    n.style.transitionDuration = `${autoTransitionDuration.current ?? (timeout === 'auto' ? 0 : timeout)}ms`;
  };
  const setEasing = (n: HTMLDivElement) => {
    (n.style as unknown as Record<string, unknown>).transitionTimingFunction = undefined;
  };
  return (
    <Transition
      in={inProp}
      timeout={timeout === 'auto' ? undefined : timeout}
      getAutoTimeout={timeout === 'auto' ? () => autoTransitionDuration.current : undefined}
      nodeRef={nodeRef}
      onEnter={() => {
        if (wrapperRef.current && isHorizontal) wrapperRef.current.style.position = 'absolute';
        node().style[size] = collapsedSize;
      }}
      onEntering={() => {
        const n = node();
        const wrapperSize = getWrapperSize();
        if (wrapperRef.current && isHorizontal) wrapperRef.current.style.position = '';
        setDuration(n, wrapperSize);
        n.style[size] = `${wrapperSize}px`;
        setEasing(n);
      }}
      onEntered={() => {
        node().style[size] = 'auto';
      }}
      onExit={() => {
        node().style[size] = `${getWrapperSize()}px`;
      }}
      onExiting={() => {
        const n = node();
        setDuration(n, getWrapperSize());
        n.style[size] = collapsedSize;
        setEasing(n);
      }}
    >
      {(state) => (
        <div
          ref={nodeRef}
          data-vg-core=""
          data-slot={'collapse'}
          data-orientation={orientation}
          data-open={inProp ? '' : undefined}
          className={cx(
            'MuiCollapse-root',
            `MuiCollapse-${orientation}`,
            className,
            state === 'entered' ? 'MuiCollapse-entered' : undefined,
            state === 'exited' && !inProp ? 'MuiCollapse-hidden' : undefined,
          )}
          style={isHorizontal ? { minWidth: collapsedSize } : { minHeight: collapsedSize }}
        >
          <div
            ref={wrapperRef}
            data-vg-core=""
            data-slot={'collapse-wrapper'}
            className={cx('MuiCollapse-wrapper', `MuiCollapse-${orientation}`)}
          >
            <div
              data-vg-core=""
              data-slot={'collapse-content'}
              className={cx('MuiCollapse-wrapperInner', `MuiCollapse-${orientation}`)}
            >
              {children}
            </div>
          </div>
        </div>
      )}
    </Transition>
  );
};
