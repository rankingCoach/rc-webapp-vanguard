import { createContext } from 'react';

/** Service operations are injected so Modal remains independent of ModalService at runtime.
 * Unlike presentation, lifecycle ownership is shared with nested inline modals.
 */
export const ModalLifecycleContext = createContext<{
  registerFullscreen: (id: string, fullscreen: boolean) => void;
  isManagedEscape: () => boolean;
}>({
  registerFullscreen: () => {},
  isManagedEscape: () => false,
});
