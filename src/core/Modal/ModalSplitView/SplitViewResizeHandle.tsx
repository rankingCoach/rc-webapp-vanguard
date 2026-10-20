import './SplitViewResizeHandle.scss';

import React from 'react';

import type { SplitViewResizeHandleDomProps, TabState } from './use-split-view-resize';

interface SplitViewResizeHandleProps {
  tab: TabState;
  /** The tab's offset from the edge, px: + into the panel, − out of it. */
  tabX: number;
  /** Where the visible edge sits inside the right panel, px: the handle sits on it. */
  edgeOffset: number;
  /** The panel is closed: the handle rides the slide out, but can't be reached or focused. */
  inert: boolean;
  handleProps: SplitViewResizeHandleDomProps;
}

/**
 * The pull tab on the right panel's left edge (resize / close by drag). Presentational: `useSplitViewResize` owns the
 * state, the pointer and the keys; the variant puts this on the edge rail so it rides the slide and isn't clipped.
 */
export const SplitViewResizeHandle = (props: SplitViewResizeHandleProps) => {
  const { tab, tabX, edgeOffset, inert, handleProps } = props;

  return (
    <div
      className="SplitView-resize-handle"
      data-tab={tab}
      inert={inert}
      style={{ '--edge-offset': `${edgeOffset}px` } as React.CSSProperties}
      {...handleProps}
    >
      <span
        className="SplitView-resize-handle__tab"
        style={{ '--tab-x': `${tabX}px` } as React.CSSProperties}
        aria-hidden="true"
      >
        <span className="SplitView-resize-handle__circle" />
        <span className="SplitView-resize-handle__top" />
        <span className="SplitView-resize-handle__bottom" />
      </span>
    </div>
  );
};
