import { classNames } from '@helpers/classNames';
import React, { useRef } from 'react';

import { Transition } from '../../../primitives/react/Transitions/Transition';

/** MUI theme `transitions.duration.standard`: MUI Collapse's default timeout (Vanguard never passes one). */
const STANDARD_MS = 300;

export interface OwnCollapseProps {
  in: boolean;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
  children: React.ReactNode;
}

/**
 * MUI 9.5 Collapse for the props Vanguard's Collapse passes (`in`, `orientation`, `className`; collapsedSize '0px',
 * timeout 300 ms, appear false, no unmountOnExit) on the own Transition. Same DOM (root > wrapper > wrapperInner, the
 * same Mui* classes, inline min-size and the inline size/transition writes at each step); emotion's hashed classes
 * are replaced by `data-vg-core` and the static rules in _Collapse.compat.scss (D15 last block). Component-local:
 * offered to A for src/primitives.
 */
export const OwnCollapse = ({ in: inProp, orientation = 'vertical', className, children }: OwnCollapseProps) => {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const isHorizontal = orientation === 'horizontal';
  const size = isHorizontal ? 'width' : 'height';
  const collapsedSize = '0px';
  const getWrapperSize = () => (wrapperRef.current ? wrapperRef.current[isHorizontal ? 'clientWidth' : 'clientHeight'] : 0);
  const node = () => nodeRef.current as HTMLDivElement;
  // MUI writes transitionDuration, then the size, then transitionTimingFunction = easing (undefined when no easing is
  // passed: browsers ignore it, jsdom stores the string) — same writes, same order.
  const setDuration = (n: HTMLDivElement) => {
    n.style.transitionDuration = `${STANDARD_MS}ms`;
  };
  const setEasing = (n: HTMLDivElement) => {
    (n.style as unknown as Record<string, unknown>).transitionTimingFunction = undefined;
  };
  return (
    <Transition
      in={inProp}
      timeout={STANDARD_MS}
      nodeRef={nodeRef}
      onEnter={() => {
        if (wrapperRef.current && isHorizontal) wrapperRef.current.style.position = 'absolute';
        node().style[size] = collapsedSize;
      }}
      onEntering={() => {
        const n = node();
        const wrapperSize = getWrapperSize();
        if (wrapperRef.current && isHorizontal) wrapperRef.current.style.position = '';
        setDuration(n);
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
        getWrapperSize();
        setDuration(n);
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
          className={classNames(
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
            className={classNames('MuiCollapse-wrapper', `MuiCollapse-${orientation}`)}
          >
            <div data-vg-core="" data-slot={'collapse-content'} className={classNames('MuiCollapse-wrapperInner', `MuiCollapse-${orientation}`)}>
              {children}
            </div>
          </div>
        </div>
      )}
    </Transition>
  );
};
