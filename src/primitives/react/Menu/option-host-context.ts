import { createContext, useContext } from 'react';

/**
 * True inside an own-core menu popup (e.g. the Select menu). Vanguard's public MenuItem reads it to render the
 * own-core option instead of MUI's MenuItem (which needs MUI's MenuListContext), until Menu itself is rebuilt.
 */
export const OptionHostContext = createContext(false);
export const useInOwnOptionHost = () => useContext(OptionHostContext);
