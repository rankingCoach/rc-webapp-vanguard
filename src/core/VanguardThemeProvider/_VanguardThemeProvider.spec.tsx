import '@testing-library/jest-dom/vitest';

import { useTheme } from '@mui/material';
import { render, screen } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, test } from 'vitest';

import { Button } from '../Button/Button';
import { VanguardThemeProvider } from './VanguardThemeProvider';

const ThemeProbe = () => {
  const theme = useTheme();
  return (
    <span data-testid="probe">
      {`${theme.typography.fontSize}|${theme.typography.htmlFontSize}|${String(theme.typography.button.textTransform)}`}
    </span>
  );
};

describe('VanguardThemeProvider', () => {
  test('provides the Vanguard MUI theme (16px, no uppercase buttons) to the bundled MUI', () => {
    render(
      <VanguardThemeProvider>
        <ThemeProbe />
      </VanguardThemeProvider>,
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('16|16|none');
  });

  test('renders Vanguard components inside it', () => {
    render(
      <VanguardThemeProvider>
        <Button testId="themed-button">Save</Button>
      </VanguardThemeProvider>,
    );
    expect(screen.getByTestId('themed-button')).toBeInTheDocument();
  });
});
