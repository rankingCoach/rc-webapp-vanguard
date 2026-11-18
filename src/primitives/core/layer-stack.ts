/**
 * Group B (watchdog MINOR 4): the order in which overlay layers opened. ModalHost and every click-away host register
 * their root; a click that starts inside a layer opened AFTER a click-away host (stacked above it, e.g. a Select menu
 * opened from inside a DropdownMenu) is not a click away from that host. Framework-free; one stack per document.
 */
export interface LayerToken {
  readonly id: number;
}

export interface LayerStack {
  push: (element: () => Element | null) => LayerToken;
  remove: (token: LayerToken) => void;
  /** Elements of the layers opened after `token` that are still open, nearest first. */
  above: (token: LayerToken) => Element[];
}

export const createLayerStack = (): LayerStack => {
  let next = 0;
  const layers: { token: LayerToken; element: () => Element | null }[] = [];
  return {
    push: (element) => {
      const token = { id: next++ };
      layers.push({ token, element });
      return token;
    },
    remove: (token) => {
      const i = layers.findIndex((l) => l.token === token);
      if (i !== -1) layers.splice(i, 1);
    },
    above: (token) => {
      const i = layers.findIndex((l) => l.token === token);
      if (i === -1) return [];
      return layers
        .slice(i + 1)
        .map((l) => l.element())
        .filter((e): e is Element => e !== null);
    },
  };
};

export const defaultLayerStack = createLayerStack();

export interface ClickAwayDecisionInput {
  /** The host finished mounting (MUI activates one tick after mount so the opening click is ignored). */
  activated: boolean;
  hasNode: boolean;
  /** The pointer is on the root scrollbar (clientX/Y beyond documentElement's client box). */
  onRootScrollbar: boolean;
  /** A touchmove happened since the touch started (a scroll gesture, not a tap). */
  moved: boolean;
  /** The event path passes through the host's DOM node (composedPath / contains). */
  insideDOM: boolean;
  /** The host's React subtree saw the event (React portals bubble through the React tree). */
  insideReactTree: boolean;
  disableReactTree: boolean;
  /** The event started inside a layer stacked above the host. */
  insideHigherLayer: boolean;
}

/** MUI ClickAwayListener's decision, plus the layer rule. */
export const isClickAway = (i: ClickAwayDecisionInput): boolean => {
  if (!i.activated || !i.hasNode || i.onRootScrollbar) return false;
  if (i.moved) return false;
  if (i.insideHigherLayer) return false;
  return !i.insideDOM && (i.disableReactTree || !i.insideReactTree);
};
