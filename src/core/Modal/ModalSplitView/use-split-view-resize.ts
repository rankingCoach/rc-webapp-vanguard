import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

import type { ModalSplitViewResize } from './ModalSplitView';

/** An arrow key's step */
const KEY_STEP = 24;
/** How near the edge the pointer brings the tab out (it grows in, one continuous move) */
const NEAR_PX = 40;
/** Past a limit, the tab follows the pointer this far at most, slowing as it goes (a rubber band) */
const RUBBER_MAX = 44;
const RUBBER_K = 70;
/** The pointer near the edge is a magnet: the tab is drawn towards it, at most this far each way… */
const MAGNET = 6;
/** …and while it's dragged, further: this far up or down, and this far to the side it's pulled towards */
const DRAG_TRAVEL = 12;
/** How strongly: px of pull per px between them (capped at MAGNET) */
const MAGNET_X = 0.4;
const MAGNET_Y = 0.12;

/** While the edge follows the pointer, the tab sits this far to the side it's pulled towards */
const LEAN = DRAG_TRAVEL;
/** Pulled this far past the narrowest… */
export const CLOSE_PULL = 64;
/** …and held there this long, the tab becomes a chevron: letting go closes the panel */
export const ARM_DELAY_MS = 350;
/** The lean eases back this long after the pointer stops */
const LEAN_REST_MS = 150;

/**
 * The tab, by what the pointer's doing: `idle` (hidden; `data-near` on the handle,
 * set straight from pointer moves, grows it in as the pointer comes near), `hover`
 * (on the edge: it settles, darker), `drag`, and `armed` (pulled past the
 * narrowest and held: a chevron, release closes).
 */
export type TabState = 'idle' | 'hover' | 'drag' | 'armed';

/** The right panel's width once dragged: whole px, between the narrowest and the widest. */
export const clampSplitWidth = (value: number, min: number, max: number): number =>
  Math.round(Math.min(max, Math.max(min, value)));

/** How far the tab follows the pointer past a limit, px: slows as it goes. Signed like `distance`. */
export const rubberBand = (distance: number): number =>
  Math.sign(distance) * RUBBER_MAX * (1 - Math.exp(-Math.abs(distance) / RUBBER_K));

/**
 * Where the tab sits relative to the edge while dragging, px (+ into the panel, − out of it). Within the limits
 * it holds its `lean` (12px to the side it's pulled towards). Past the narrowest (`beyond` > 0) the edge stops and the
 * tab stretches on after the pointer, towards the close, from the lean so it never jumps back first. Past the widest
 * (`beyond` < 0) there's nothing to pull towards: it just holds the lean away from the edge.
 */
export const tabOffsetFor = (beyond: number, lean: number): number =>
  beyond > 0 ? Math.max(LEAN, rubberBand(beyond)) : beyond < 0 ? -LEAN : lean;

/** At the narrowest and pulled `CLOSE_PULL` past it: held there, it arms. */
export const isPulledToClose = (width: number, min: number, beyond: number): boolean =>
  width === min && beyond >= CLOSE_PULL;

/** The split the panel sits in: its offsetParent (the panels share it; there is no root of our own). */
const splitOf = (panel: HTMLElement | null): HTMLElement | null => (panel?.offsetParent as HTMLElement | null) ?? null;

/** Narrowest and widest right panel, px: the widest leaves the left panel its `minOtherWidth`. */
const limitsOf = (config: ModalSplitViewResize, panel: HTMLElement | null): { min: number; max: number } => {
  const splitWidth = splitOf(panel)?.clientWidth ?? 0;
  return { min: config.minWidth, max: Math.max(config.minWidth, splitWidth - config.minOtherWidth) };
};

/** Draws the tab towards the pointer (the magnet), straight onto the handle; x only while not dragging */
const writeMagnet = (el: HTMLElement | null, clientX: number | null, clientY: number | null, reach = MAGNET): void => {
  if (!el) return;
  // Nothing to draw it towards: back to rest, with no layout read
  if (clientX === null && clientY === null) {
    el.style.setProperty('--mag-x', '0px');
    el.style.setProperty('--mag-y', '0px');
    return;
  }
  const r = el.getBoundingClientRect();
  const cap = (v: number): number => Math.max(-reach, Math.min(reach, v));
  const x = clientX === null ? 0 : cap((clientX - (r.left + r.width / 2)) * MAGNET_X);
  const y = clientY === null ? 0 : cap((clientY - (r.top + r.height / 2)) * MAGNET_Y);
  el.style.setProperty('--mag-x', `${x.toFixed(2)}px`);
  el.style.setProperty('--mag-y', `${y.toFixed(2)}px`);
};

/** The pointer near the edge, straight onto the handle (no render per move) */
const writeNear = (el: HTMLElement | null, near: boolean): void => {
  if (!el || (el.dataset.near === 'true') === near) return;
  el.dataset.near = String(near);
};

interface UseSplitViewResizeOptions {
  /**
   * The consumer's `resize`, as given (off without it). Kept while it isn't honoured, so its `resetKey` holds across
   * a trip to mobile and back.
   */
  resize: ModalSplitViewResize | undefined;
  /** `resize` is honoured here (the slide, on desktop). Elsewhere everything stays off, and a drag under way ends. */
  honoured: boolean;
  /** The right panel is open. Closed, there is nothing to drag (the handle stays, riding the slide out). */
  isOpen: boolean;
  /** The right panel: its width is what's set, and its offsetParent is the split the limits are read from. */
  panelRef: React.RefObject<HTMLElement | null>;
}

/** What the handle element takes: spread it on the `div`. */
export interface SplitViewResizeHandleDomProps {
  ref: React.RefObject<HTMLDivElement | null>;
  role: string;
  'aria-orientation': 'vertical';
  'aria-label': string | undefined;
  tabIndex: number;
  onPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  onPointerMove: (e: React.PointerEvent<HTMLElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
  onDoubleClick: () => void;
}

/** What each panel takes, to bring the tab out as the pointer comes near the edge: spread it on the panel `div`s. */
export interface SplitViewResizePanelDomProps {
  onPointerMove: (e: React.PointerEvent<HTMLElement>) => void;
  onPointerLeave: (e: React.PointerEvent<HTMLElement>) => void;
}

interface UseSplitViewResizeResult {
  /** The dragged width, px (null: the default layout). */
  width: number | null;
  /** The edge is being dragged. */
  resizing: boolean;
  tab: TabState;
  /** The tab's offset from the edge, px: + into the panel, − out of it. */
  tabX: number;
  panelProps: SplitViewResizePanelDomProps;
  handleProps: SplitViewResizeHandleDomProps;
}

/**
 * The right panel's width once the owner has dragged its left edge (null: the default layout), and its pull tab.
 * Clamped here as it's set, and again in CSS by the variant as the window resizes. Pulled past the narrowest and
 * held, it arms; released there, `onCloseByDrag` closes the panel.
 *
 * Ported from the mocks' `useCanvasResize`. The limits come from the split itself (the panel's offsetParent), and
 * the dragged width is kept while the panel slides out after a close by drag: it goes when the panel next opens.
 */
export const useSplitViewResize = (options: UseSplitViewResizeOptions): UseSplitViewResizeResult => {
  const { resize, honoured, isOpen, panelRef } = options;
  // Nothing to show while it can't be dragged (closed panel, or not honoured here)
  const config = honoured && isOpen ? resize : undefined;
  const enabled = config !== undefined;

  const [width, setWidth] = useState<number | null>(null);
  const [hover, setHover] = useState(false);
  const handleRef = useRef<HTMLDivElement>(null);
  const [dragging, setDraggingState] = useState(false);
  // Read by the panels' pointer moves, which can arrive before the re-render that dragging causes
  const draggingRef = useRef(false);
  const setDragging = (v: boolean): void => {
    draggingRef.current = v;
    setDraggingState(v);
  };
  const [armed, setArmed] = useState(false);
  /** The tab's offset from the edge, px: + into the panel, − out of it */
  const [tabX, setTabX] = useState(0);
  const timers = useRef({ arm: 0, lean: 0 });
  /** Ends the drag under way, without closing (null: none) */
  const cancelDragRef = useRef<(() => void) | null>(null);
  const onCloseRef = useRef(resize?.onCloseByDrag);
  onCloseRef.current = resize?.onCloseByDrag;
  /** A close by drag, or a new `resetKey`, while the panel is away: the dragged width goes as it next opens */
  const dropOnOpenRef = useRef(false);
  const previousRef = useRef({ isOpen, resetKey: resize?.resetKey });

  useEffect(() => {
    const pending = timers.current;
    return () => {
      window.clearTimeout(pending.arm);
      window.clearTimeout(pending.lean);
    };
  }, []);

  // Off mid-drag (the panel closed, the window down to mobile, `resize` or the slide turned off), the drag ends here:
  // the handle may be gone with its pointerup, and the body would keep the drag's cursor
  useEffect(() => {
    if (!enabled) {
      cancelDragRef.current?.();
      writeNear(handleRef.current, false);
      writeMagnet(handleRef.current, null, null);
      setHover(false);
    }
  }, [enabled]);

  // While dragging, the cursor and the selection stay as the drag wants them wherever the pointer is
  useEffect(() => {
    if (!dragging) return;
    const { style } = document.body;
    const before = { cursor: style.cursor, userSelect: style.userSelect, webkitUserSelect: style.webkitUserSelect };
    style.cursor = 'col-resize';
    style.userSelect = 'none';
    style.webkitUserSelect = 'none';
    return () => {
      style.cursor = before.cursor;
      style.userSelect = before.userSelect;
      style.webkitUserSelect = before.webkitUserSelect;
    };
  }, [dragging]);

  // The dragged width is kept while the panel slides out (a close by drag leaves from its narrowest, and mustn't
  // jump to the default on the way). It goes as the panel next opens, or at once if the panel is open and now holds
  // something else (`resetKey`).
  const resetKey = resize?.resetKey;
  useLayoutEffect(() => {
    const previous = previousRef.current;
    previousRef.current = { isOpen, resetKey };
    const rekeyed = resetKey !== previous.resetKey;
    if (rekeyed) dropOnOpenRef.current = true;
    if (isOpen && (!previous.isOpen || rekeyed) && dropOnOpenRef.current) {
      dropOnOpenRef.current = false;
      setWidth(null);
    }
  }, [isOpen, resetKey]);

  // aria-valuemin / -max / -now, in px, straight onto the handle after every commit: the limits and the default width
  // are the layout's, which only exists once rendered (and moves with the window). The dragged width is shown as the
  // CSS clamp holds it, after the window has shrunk.
  useLayoutEffect(() => {
    const el = handleRef.current;
    if (!el || !config) return;
    const { min, max } = limitsOf(config, panelRef.current);
    const now = width === null ? (panelRef.current?.offsetWidth ?? min) : clampSplitWidth(width, min, max);
    el.setAttribute('aria-valuemin', String(min));
    el.setAttribute('aria-valuemax', String(Math.round(max)));
    el.setAttribute('aria-valuenow', String(now));
  });

  /** On the panels (and the handle): the pointer coming near the edge brings the tab out */
  const onPanelPointerMove = (e: React.PointerEvent<HTMLElement>): void => {
    if (!config || draggingRef.current) return;
    const el = handleRef.current;
    const r = panelRef.current?.getBoundingClientRect();
    const edge = r ? r.left + (config.edgeOffset ?? 0) : 0;
    const near = !!r && e.clientY >= r.top && e.clientY <= r.bottom && Math.abs(e.clientX - edge) <= NEAR_PX;
    // Far, only the move that leaves puts the tab back to rest: the moves after it, all over the panels (a chat
    // streaming in the left one), write nothing. Reads before writes, so a move never forces a second layout.
    if (near) writeMagnet(el, e.clientX, e.clientY);
    else if (el?.dataset.near === 'true') writeMagnet(el, null, null);
    writeNear(el, near);
  };
  const onPanelPointerLeave = (e: React.PointerEvent<HTMLElement>): void => {
    if (draggingRef.current) return;
    // Onto the handle (it's on the rail, a sibling of the panels, not inside them): still near
    if (e.relatedTarget instanceof Node && handleRef.current?.contains(e.relatedTarget)) return;
    writeNear(handleRef.current, false);
    writeMagnet(handleRef.current, null, null);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLElement>): void => {
    if (!config || e.button !== 0) return;
    e.preventDefault();
    const el = e.currentTarget;
    try {
      // The iframe a panel may hold takes the pointer's moves from the page: captured, the handle keeps them
      el.setPointerCapture(e.pointerId);
    } catch {
      // A pointer the browser doesn't know (synthetic): the strip still gets its moves while over it
    }
    // The panel's right edge stays put; the pointer is its (visible) left
    const right = splitOf(panelRef.current)?.getBoundingClientRect().right ?? window.innerWidth;
    const edgeOffset = config.edgeOffset ?? 0;
    // Grabbed off the edge (the strip and the safe area round the tab reach past it), the edge keeps that distance from
    // the pointer instead of jumping under it on the first move. The handle is centred on the visible edge.
    const box = el.getBoundingClientRect();
    const grabOffset = e.clientX - (box.left + box.width / 2);
    let lastX = e.clientX;
    let lean = 0;
    let isArmed = false;
    setDragging(true);

    const disarm = (): void => {
      window.clearTimeout(timers.current.arm);
      timers.current.arm = 0;
      if (isArmed) {
        isArmed = false;
        setArmed(false);
      }
    };

    // Dragging, the lean (below) moves it sideways; the magnet keeps it following the pointer up and down
    writeMagnet(handleRef.current, null, e.clientY, DRAG_TRAVEL);
    const move = (ev: globalThis.PointerEvent): void => {
      writeMagnet(handleRef.current, null, ev.clientY, DRAG_TRAVEL);
      const desired = right - (ev.clientX - grabOffset) + edgeOffset;
      const { min: lo, max: hi } = limitsOf(config, panelRef.current);
      const next = clampSplitWidth(desired, lo, hi);
      setWidth(next);
      // How far past a limit, from the unrounded width (rounding alone mustn't read as a limit):
      // + past the narrowest, − past the widest
      const beyond = Math.min(hi, Math.max(lo, desired)) - desired;
      const moved = ev.clientX - lastX;
      if (moved !== 0) lean = Math.sign(moved) * LEAN;
      lastX = ev.clientX;
      setTabX(tabOffsetFor(beyond, lean));
      window.clearTimeout(timers.current.lean);
      timers.current.lean = window.setTimeout(() => {
        lean = 0;
        setTabX(tabOffsetFor(beyond, 0));
      }, LEAN_REST_MS);

      // Pulled well past the narrowest: after a beat it arms (the chevron)
      if (isPulledToClose(next, lo, beyond)) {
        if (!isArmed && !timers.current.arm)
          timers.current.arm = window.setTimeout(() => {
            timers.current.arm = 0;
            isArmed = true;
            setArmed(true);
          }, ARM_DELAY_MS);
      } else disarm();
    };

    const up = (): void => {
      cancelDragRef.current = null;
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', cancel);
      el.removeEventListener('lostpointercapture', cancel);
      window.clearTimeout(timers.current.lean);
      const close = isArmed;
      disarm();
      setDragging(false);
      setTabX(0);
      writeMagnet(handleRef.current, null, null);
      if (close) {
        // Closed by the pull: the width stays while it slides out, and goes as the panel next opens
        dropOnOpenRef.current = true;
        writeNear(handleRef.current, false);
        setHover(false);
        onCloseRef.current?.();
      }
    };
    const cancel = (): void => {
      disarm();
      up();
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', cancel);
    // The capture taken from the handle (by the browser) ends the drag as a cancel would. A handle taken out of the
    // page doesn't hear this (it's the document's then): going off (`enabled`) ends that drag
    el.addEventListener('lostpointercapture', cancel);
    cancelDragRef.current = cancel;
  };

  // Left makes the panel wider (its edge moves left), right narrower. Home / End go to the narrowest / widest: the
  // value is the panel's width, so they're aria-valuemin / -max, as on any separator or slider
  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>): void => {
    if (!config) return;
    const { min, max } = limitsOf(config, panelRef.current);
    const current = panelRef.current?.offsetWidth ?? min;
    const next =
      e.key === 'ArrowLeft'
        ? current + KEY_STEP
        : e.key === 'ArrowRight'
          ? current - KEY_STEP
          : e.key === 'Home'
            ? min
            : e.key === 'End'
              ? max
              : null;
    if (next === null) return;
    e.preventDefault();
    setWidth(clampSplitWidth(next, min, max));
  };

  const tab: TabState = armed ? 'armed' : dragging ? 'drag' : hover ? 'hover' : 'idle';
  const handleProps: SplitViewResizeHandleDomProps = {
    ref: handleRef,
    role: 'separator',
    'aria-orientation': 'vertical',
    'aria-label': resize?.ariaLabel,
    tabIndex: 0,
    onPointerDown,
    onPointerEnter: () => setHover(true),
    onPointerLeave: () => setHover(false),
    onPointerMove: onPanelPointerMove,
    onKeyDown,
    // Back to the default split
    onDoubleClick: () => setWidth(null),
  };

  return {
    width,
    resizing: dragging,
    tab,
    tabX,
    panelProps: { onPointerMove: onPanelPointerMove, onPointerLeave: onPanelPointerLeave },
    handleProps,
  };
};
