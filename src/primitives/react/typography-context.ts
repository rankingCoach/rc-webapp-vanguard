import { createContext, useContext } from 'react';

/**
 * Which typography scale Vanguard's own-core components paint with: MUI's defaults (14px base, uppercase buttons)
 * or the Vanguard theme set by VanguardThemeProvider (16px base, no uppercase). Mirrors the bundled MUI theme so
 * migrated components look the same with or without the provider.
 */
export type VanguardTypography = 'default' | 'vanguard';
export const VanguardTypographyContext = createContext<VanguardTypography>('default');
export const useVanguardTypography = () => useContext(VanguardTypographyContext);
