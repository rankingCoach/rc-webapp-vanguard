// Ported from @mui/material@9.5.0 ClickAwayListener/ClickAwayListener.js (MIT)
import React, { useCallback, useEffect, useRef } from 'react';
import { defaultLayerStack, isClickAway, LayerToken } from '../../core/layer-stack';

type MouseEventProp = 'onClick' | 'onMouseDown' | 'onMouseUp' | 'onPointerDown' | 'onPointerUp' | false;
type TouchEventProp = 'onTouchStart' | 'onTouchEnd' | false;

export interface ClickAwayProps {
  children: React.ReactElement<{ ref?: React.Ref<Element> } & Record<string, unknown>>;
  onClickAway: (event: MouseEvent | TouchEvent) => void;
  disableReactTree?: boolean;
  mouseEvent?: MouseEventProp;
  touchEvent?: TouchEventProp;
  /**
   * Own-core extension (watchdog MINOR 4): ignore events that start inside a layer opened above this one. Default on
   * (menus, popovers); `false` keeps MUI's plain ClickAwayListener behaviour (Snackbar: a click inside a modal opened
   * from the snackbar is a click-away, as with MUI).
   */
  ignoreHigherLayers?: boolean;
}

const domEventName = (prop: string) => prop.substring(2).toLowerCase();

const setRef = (ref: unknown, value: Element | null) => {
  if (typeof ref === 'function') ref(value);
  else if (ref && typeof ref === 'object') (ref as React.MutableRefObject<Element | null>).current = value;
};

/**
 * MUI 9.5 ClickAwayListener semantics on the own core (core/layer-stack.ts decides): activates one tick after mount,
 * ignores the root scrollbar and touch scrolls, treats events from the React subtree (portals) as inside, and, new
 * (watchdog MINOR 4), ignores events that start inside a layer opened above this one (ModalHost registers layers).
 */
export const ClickAway = (props: ClickAwayProps) => {
  const {
    children,
    onClickAway,
    disableReactTree = false,
    mouseEvent = 'onClick',
    touchEvent = 'onTouchEnd',
    ignoreHigherLayers = true,
  } = props;
  const nodeRef = useRef<Element | null>(null);
  const activated = useRef(false);
  const moved = useRef(false);
  const synthetic = useRef(false);
  const layer = useRef<LayerToken | null>(null);
  const onClickAwayRef = useRef(onClickAway);
  onClickAwayRef.current = onClickAway;

  useEffect(() => {
    const timer = setTimeout(() => {
      activated.current = true;
    }, 0);
    layer.current = defaultLayerStack.push(
      () => nodeRef.current,
      typeof document === 'undefined' ? null : document.activeElement,
    );
    return () => {
      clearTimeout(timer);
      activated.current = false;
      if (layer.current) defaultLayerStack.remove(layer.current);
    };
  }, []);

  const handle = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const insideReactTree = synthetic.current;
      synthetic.current = false;
      const node = nodeRef.current;
      const doc = node?.ownerDocument ?? document;
      const target = event.target as Node | null;
      const path = typeof event.composedPath === 'function' ? event.composedPath() : null;
      const insideDOM = node
        ? path
          ? path.includes(node)
          : !doc.documentElement.contains(target) || node.contains(target)
        : false;
      const above = layer.current ? defaultLayerStack.above(layer.current) : [];
      const insideHigherLayer =
        ignoreHigherLayers &&
        above.some(
          (l) =>
            l.origin !== null &&
            node !== null &&
            node.contains(l.origin) &&
            (path ? path.includes(l.element) : l.element.contains(target)),
        );
      const wasMoved = moved.current;
      moved.current = false;
      if (
        isClickAway({
          activated: activated.current,
          hasNode: Boolean(node),
          onRootScrollbar:
            'clientX' in event &&
            (doc.documentElement.clientWidth < event.clientX || doc.documentElement.clientHeight < event.clientY),
          moved: wasMoved,
          insideDOM,
          insideReactTree,
          disableReactTree,
          insideHigherLayer,
        })
      ) {
        onClickAwayRef.current(event);
      }
    },
    [disableReactTree, ignoreHigherLayers],
  );

  useEffect(() => {
    if (touchEvent === false) return undefined;
    const doc = nodeRef.current?.ownerDocument ?? document;
    const name = domEventName(touchEvent);
    const onMove = () => {
      moved.current = true;
    };
    doc.addEventListener(name, handle as EventListener);
    doc.addEventListener('touchmove', onMove);
    return () => {
      doc.removeEventListener(name, handle as EventListener);
      doc.removeEventListener('touchmove', onMove);
    };
  }, [handle, touchEvent]);

  useEffect(() => {
    if (mouseEvent === false) return undefined;
    const doc = nodeRef.current?.ownerDocument ?? document;
    const name = domEventName(mouseEvent);
    doc.addEventListener(name, handle as EventListener);
    return () => doc.removeEventListener(name, handle as EventListener);
  }, [handle, mouseEvent]);

  // MUI useForkRef: one stable callback per child ref; a React 19 cleanup returned by the child's callback ref is kept
  // and run on detach (instead of a null call), and a new callback each render no longer detaches/re-attaches.
  const childRef = (children.props as { ref?: unknown }).ref ?? (children as { ref?: unknown }).ref;
  const handleRef = useCallback(
    (node: Element | null) => {
      nodeRef.current = node;
      const cleanup = typeof childRef === 'function' ? childRef(node) : (setRef(childRef, node), undefined);
      return () => {
        nodeRef.current = null;
        if (typeof cleanup === 'function') cleanup();
        else setRef(childRef, null);
      };
    },
    [childRef],
  );
  const childProps: Record<string, unknown> = { ref: handleRef };
  const synth = (name: string) => (event: React.SyntheticEvent) => {
    synthetic.current = true;
    const own = (children.props as Record<string, unknown>)[name];
    if (typeof own === 'function') own(event);
  };
  if (touchEvent !== false) childProps[touchEvent] = synth(touchEvent);
  if (mouseEvent !== false) childProps[mouseEvent] = synth(mouseEvent);
  return React.cloneElement(children, childProps);
};
