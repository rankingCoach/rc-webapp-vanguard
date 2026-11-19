// Ported from @mui/material@9.5.0 ClickAwayListener/ClickAwayListener.js (MIT)
/**
 * Group B (watchdog MINOR 4): the order in which overlay layers opened. ModalHost and every click-away host register
 * their root; a click that starts inside a layer opened AFTER a click-away host (stacked above it, e.g. a Select menu
 * opened from inside a DropdownMenu) is not a click away from that host. Framework-free; one stack per document.
 */
export interface LayerToken {
  readonly id: number;
}

export interface LayerStack {
  /** `origin`: the element the layer was opened from (focused when it opened); decides which host it belongs to. */
  push: (element: () => Element | null, origin?: Element | null) => LayerToken;
  remove: (token: LayerToken) => void;
  /** Layers opened after `token` that are still open, nearest first. */
  above: (token: LayerToken) => { element: Element; origin: Element | null }[];
  /** Open layers (leak checks: 0 once everything is closed and unmounted). */
  size: () => number;
}

export const createLayerStack = (): LayerStack => {
  let next = 0;
  const layers: { token: LayerToken; element: () => Element | null; origin: Element | null }[] = [];
  return {
    push: (element, origin = null) => {
      const token = { id: next++ };
      layers.push({ token, element, origin });
      return token;
    },
    remove: (token) => {
      const i = layers.findIndex((l) => l.token === token);
      if (i !== -1) layers.splice(i, 1);
    },
    size: () => layers.length,
    above: (token) => {
      const i = layers.findIndex((l) => l.token === token);
      if (i === -1) return [];
      return layers
        .slice(i + 1)
        .map((l) => ({ element: l.element(), origin: l.origin }))
        .filter((l): l is { element: Element; origin: Element | null } => l.element !== null);
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
  /**
   * The event started inside a layer stacked above the host AND opened from inside the host (e.g. a Select menu
   * opened from a field in a PopoverModal). A layer opened from elsewhere (another independent dropdown) does not
   * shield the host: MUI calls the older host's onClickAway there too.
   */
  insideHigherLayer: boolean;
}

/** MUI ClickAwayListener's decision, plus the layer rule. */
export const isClickAway = (i: ClickAwayDecisionInput): boolean => {
  if (!i.activated || !i.hasNode || i.onRootScrollbar) return false;
  if (i.moved) return false;
  if (i.insideHigherLayer) return false;
  return !i.insideDOM && (i.disableReactTree || !i.insideReactTree);
};
