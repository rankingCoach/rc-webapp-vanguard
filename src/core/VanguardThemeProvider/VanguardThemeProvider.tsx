import { createTheme, ThemeProvider } from '@mui/material';
import React from 'react';

/**
 * MUI theme of Vanguard's internal (bundled) MUI: 16px base font, 1rem = 16px, no uppercase buttons.
 * A consumer's own @mui ThemeProvider cannot reach Vanguard's bundled MUI copy, so the theme lives here.
 */
const vanguardMuiTheme = createTheme({
  typography: {
    fontSize: 16,
    htmlFontSize: 16,
    button: { textTransform: 'none' },
  },
});

export interface VanguardThemeProviderProps {
  children?: React.ReactNode;
}

/** Wrap the app root (and every separately mounted React root) once so Vanguard components get their theme. */
export const VanguardThemeProvider = (props: VanguardThemeProviderProps) => (
  <ThemeProvider theme={vanguardMuiTheme}>{props.children}</ThemeProvider>
);
