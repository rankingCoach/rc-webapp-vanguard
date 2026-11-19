import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { expect, test, vi, beforeAll } from 'vitest';

import { Snackbar } from './Snackbar';
import type { VanguardSnackbarProps } from '../_internal/mui-legacy-props';
import { preloadMuiFallbacks } from '../_internal/lazy-fallback';

// Renders MUI fallback routes on purpose (plan §36.5 allow-list): load them before the cases run.
beforeAll(() => preloadMuiFallbacks());


test('themed legacy transition enter callback runs once after mapping', async () => {
  const onEnter = vi.fn();
  const legacyThemeDefaults1: Partial<VanguardSnackbarProps> = { TransitionProps: { onEnter } };
  const theme = createTheme({ components: { MuiSnackbar: { defaultProps: legacyThemeDefaults1 } } });
  render(
    <ThemeProvider theme={theme}>
      <Snackbar open message="Theme transition" transitionDuration={0} />
    </ThemeProvider>,
  );
  await waitFor(() => expect(onEnter).toHaveBeenCalledTimes(1));
});
