// Ported from @mui/material@9.5.0 Unstable_TrapFocus/FocusTrap.js (MIT).
import * as React from 'react';

export interface FocusTrapProps {
  open: boolean;
  isEnabled?: () => boolean;
  disableAutoFocus?: boolean;
  disableEnforceFocus?: boolean;
  disableRestoreFocus?: boolean;
  /** Accepted for compatibility; the trap does not create a portal. */
  disablePortal?: boolean;
  getTabbable?: (root: HTMLElement) => ReadonlyArray<HTMLElement>;
  children: React.ReactElement;
}

type ChildProps = {
  ref?: React.Ref<HTMLElement>;
  onFocus?: React.FocusEventHandler<HTMLElement>;
  tabIndex?: number;
};

// Inspired by https://github.com/focus-trap/tabbable.
const candidatesSelector = [
  'input',
  'select',
  'textarea',
  'a[href]',
  'button',
  '[tabindex]',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
].join(',');

function getTabIndex(node: HTMLElement): number {
  const tabIndexAttr = Number.parseInt(node.getAttribute('tabindex') || '', 10);
  if (!Number.isNaN(tabIndexAttr)) return tabIndexAttr;

  // Normalize browser defaults for editable and media elements.
  if (
    node.contentEditable === 'true' ||
    ((node.nodeName === 'AUDIO' || node.nodeName === 'VIDEO' || node.nodeName === 'DETAILS') &&
      node.getAttribute('tabindex') === null)
  ) {
    return 0;
  }
  return node.tabIndex;
}

function isNonTabbableRadio(node: HTMLElement): boolean {
  if (node.tagName !== 'INPUT') return false;
  const input = node as HTMLInputElement;
  if (input.type !== 'radio' || !input.name) return false;

  const getRadio = (selector: string) => input.ownerDocument.querySelector(`input[type="radio"]${selector}`);
  const roving = getRadio(`[name="${input.name}"]:checked`) || getRadio(`[name="${input.name}"]`);
  return roving !== input;
}

function defaultGetTabbable(root: HTMLElement): HTMLElement[] {
  const regularTabNodes: HTMLElement[] = [];
  const orderedTabNodes: { documentOrder: number; tabIndex: number; node: HTMLElement }[] = [];
  Array.from(root.querySelectorAll<HTMLElement>(candidatesSelector)).forEach((node, i) => {
    const nodeTabIndex = getTabIndex(node);
    if (
      nodeTabIndex === -1 ||
      (node as HTMLInputElement).disabled ||
      (node.tagName === 'INPUT' && (node as HTMLInputElement).type === 'hidden') ||
      isNonTabbableRadio(node)
    ) {
      return;
    }
    if (nodeTabIndex === 0) regularTabNodes.push(node);
    else orderedTabNodes.push({ documentOrder: i, tabIndex: nodeTabIndex, node });
  });
  return orderedTabNodes
    .sort((a, b) => (a.tabIndex === b.tabIndex ? a.documentOrder - b.documentOrder : a.tabIndex - b.tabIndex))
    .map(({ node }) => node)
    .concat(regularTabNodes);
}

function defaultIsEnabled(): boolean {
  return true;
}

// MUI 9.5's focus utilities traverse shadow roots and honor marked initial targets.
function getActiveElement(doc: Document): Element | null {
  let element = doc.activeElement;
  while (element?.shadowRoot?.activeElement != null) element = element.shadowRoot.activeElement;
  return element;
}

function contains(parent: HTMLElement, child: Element | null): boolean {
  if (!child) return false;
  if (parent.contains(child)) return true;
  if (child.getRootNode() instanceof ShadowRoot) {
    let next: Node | null = child;
    while (next) {
      if (parent === next) return true;
      next = next.parentNode ?? (next as ShadowRoot).host ?? null;
    }
  }
  return false;
}

function getFocusTarget(root: HTMLElement): HTMLElement | null {
  return root.hasAttribute('data-mui-focusable') ? root : root.querySelector<HTMLElement>('[data-mui-focusable]');
}

export function FocusTrap(props: FocusTrapProps) {
  const {
    children,
    disableAutoFocus = false,
    disableEnforceFocus = false,
    disableRestoreFocus = false,
    getTabbable = defaultGetTabbable,
    isEnabled = defaultIsEnabled,
    open,
  } = props;
  const ignoreNextEnforceFocus = React.useRef(false);
  const sentinelStart = React.useRef<HTMLDivElement>(null);
  const sentinelEnd = React.useRef<HTMLDivElement>(null);
  const nodeToRestore = React.useRef<HTMLElement | null>(null);
  const reactFocusEventTarget = React.useRef<EventTarget | null>(null);
  // With disableAutoFocus, enforcement starts only after focus enters the React tree.
  const activated = React.useRef(false);
  const rootRef = React.useRef<HTMLElement | null>(null);
  const lastKeydown = React.useRef<KeyboardEvent | null>(null);
  const child = children as React.ReactElement<ChildProps>;
  const childRef = child.props.ref;
  // Keep the merged ref stable and preserve React 19 callback-ref cleanup returns.
  const handleRef = React.useCallback(
    (node: HTMLElement | null) => {
      const cleanup = typeof childRef === 'function' ? childRef(node) : undefined;
      if (childRef && typeof childRef !== 'function') childRef.current = node;
      rootRef.current = node;
      return () => {
        if (typeof cleanup === 'function') cleanup();
        else if (typeof childRef === 'function') childRef(null);
        else if (childRef) childRef.current = null;
        rootRef.current = null;
      };
    },
    [childRef],
  );

  React.useEffect(() => {
    if (!open || !rootRef.current) return;
    activated.current = !disableAutoFocus;
  }, [disableAutoFocus, open]);

  React.useEffect(() => {
    // Strict Mode replays this effect after its cleanup has set this flag.
    ignoreNextEnforceFocus.current = false;
    if (!open || !rootRef.current) return;

    const doc = rootRef.current.ownerDocument;
    const activeElement = getActiveElement(doc);
    const focusTarget = getFocusTarget(rootRef.current) ?? rootRef.current;
    if (!contains(rootRef.current, activeElement)) {
      if (!focusTarget.hasAttribute('tabIndex')) focusTarget.setAttribute('tabIndex', '-1');
      if (activated.current) focusTarget.focus();
    }
    return () => {
      if (!disableRestoreFocus && nodeToRestore.current) {
        ignoreNextEnforceFocus.current = true;
        nodeToRestore.current.focus();
        nodeToRestore.current = null;
      }
    };
    // Like MUI, changing disableRestoreFocus on an open trap is unsupported.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  React.useEffect(() => {
    if (!open || !rootRef.current) return;
    const doc = rootRef.current.ownerDocument;
    const loopFocus = (nativeEvent: KeyboardEvent) => {
      lastKeydown.current = nativeEvent;
      if (disableEnforceFocus || !isEnabled() || nativeEvent.key !== 'Tab') return;

      const rootElement = rootRef.current;
      const activeElement = getActiveElement(doc);
      if (rootElement === null) return;
      const focusTarget = getFocusTarget(rootElement);
      const isFocusStart = activeElement === rootElement || activeElement === focusTarget;

      if (isFocusStart) {
        const tabbable = getTabbable(rootElement);
        if (tabbable.length === 0) return;
        nativeEvent.preventDefault();
        if (nativeEvent.shiftKey) tabbable[tabbable.length - 1].focus();
        else tabbable[0].focus();
        return;
      }
      if (contains(rootElement, activeElement)) {
        const tabbable = getTabbable(rootElement);
        const currentIndex = tabbable.indexOf(activeElement as HTMLElement);
        // Shadow-root descendants use native tab handling.
        if (currentIndex === -1) return;
        const hasPositiveTabIndex = tabbable.some((node) => getTabIndex(node) > 0);
        if (!hasPositiveTabIndex) return;

        nativeEvent.preventDefault();
        let nextIndex = 0;
        if (nativeEvent.shiftKey) nextIndex = currentIndex <= 0 ? tabbable.length - 1 : currentIndex - 1;
        else nextIndex = currentIndex === tabbable.length - 1 ? 0 : currentIndex + 1;
        tabbable[nextIndex].focus();
      }
    };

    const contain = () => {
      const rootElement = rootRef.current;
      if (rootElement === null) return;
      const activeEl = getActiveElement(doc);
      if (!doc.hasFocus() || !isEnabled() || ignoreNextEnforceFocus.current) {
        ignoreNextEnforceFocus.current = false;
        return;
      }
      if (contains(rootElement, activeEl)) return;
      if (disableEnforceFocus && activeEl !== sentinelStart.current && activeEl !== sentinelEnd.current) return;

      // React descendants can live outside the DOM subtree through a portal.
      if (activeEl !== reactFocusEventTarget.current) reactFocusEventTarget.current = null;
      else if (reactFocusEventTarget.current !== null) return;
      if (!activated.current) return;

      let tabbable: ReadonlyArray<HTMLElement> = [];
      if (activeEl === sentinelStart.current || activeEl === sentinelEnd.current) tabbable = getTabbable(rootElement);
      if (tabbable.length > 0) {
        const isShiftTab = Boolean(lastKeydown.current?.shiftKey && lastKeydown.current?.key === 'Tab');
        const focusNext = tabbable[0];
        const focusPrevious = tabbable[tabbable.length - 1];
        if (typeof focusNext !== 'string' && typeof focusPrevious !== 'string') {
          if (isShiftTab) focusPrevious.focus();
          else focusNext.focus();
        }
      } else {
        rootElement.focus();
      }
    };

    doc.addEventListener('focusin', contain);
    doc.addEventListener('keydown', loopFocus, true);
    // Some browsers emit no focus event when a focused node disappears.
    const interval = setInterval(() => {
      const activeEl = getActiveElement(doc);
      if (activeEl && activeEl.tagName === 'BODY') contain();
    }, 50);
    return () => {
      clearInterval(interval);
      doc.removeEventListener('focusin', contain);
      doc.removeEventListener('keydown', loopFocus, true);
    };
  }, [disableAutoFocus, disableEnforceFocus, disableRestoreFocus, isEnabled, open, getTabbable]);

  const onFocus: React.FocusEventHandler<HTMLElement> = (event) => {
    if (nodeToRestore.current === null) nodeToRestore.current = event.relatedTarget as HTMLElement | null;
    activated.current = true;
    reactFocusEventTarget.current = event.target;
    child.props.onFocus?.(event);
  };
  const handleFocusSentinel: React.FocusEventHandler<HTMLDivElement> = (event) => {
    if (nodeToRestore.current === null) nodeToRestore.current = event.relatedTarget as HTMLElement | null;
    activated.current = true;
  };

  return (
    <>
      <div tabIndex={open ? 0 : -1} onFocus={handleFocusSentinel} ref={sentinelStart} data-testid="sentinelStart" />
      {React.cloneElement(child, { ref: handleRef, onFocus, tabIndex: child.props.tabIndex ?? -1 })}
      <div tabIndex={open ? 0 : -1} onFocus={handleFocusSentinel} ref={sentinelEnd} data-testid="sentinelEnd" />
    </>
  );
}
