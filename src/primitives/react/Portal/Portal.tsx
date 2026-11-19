import React, { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export interface PortalProps {
  children?: React.ReactNode;
  /** An element, or a function returning one; default document.body. */
  container?: Element | (() => Element | null) | null;
  disablePortal?: boolean;
}

const resolve = (container: PortalProps['container']) =>
  (typeof container === 'function' ? container() : container) ?? null;

/**
 * MUI 9.5 Portal: the mount node is set in a layout effect, so children mount one commit after the Portal (and render
 * nothing on the server); `disablePortal` renders them in place.
 */
export const Portal = ({ children, container, disablePortal = false }: PortalProps) => {
  const [mountNode, setMountNode] = useState<Element | null>(null);
  useLayoutEffect(() => {
    if (!disablePortal) setMountNode(resolve(container) || document.body);
  }, [container, disablePortal]);
  if (disablePortal) return <>{children}</>;
  return mountNode ? createPortal(children, mountNode) : null;
};
