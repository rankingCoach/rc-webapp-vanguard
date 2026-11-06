import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { expect, test, vi } from 'vitest';

import { Snackbar } from './Snackbar';
import type { VanguardSnackbarProps } from '../_internal/mui-legacy-props';


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
