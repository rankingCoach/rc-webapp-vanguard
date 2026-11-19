import '@testing-library/jest-dom/vitest';

import React from 'react';
import { expect, test, beforeAll } from 'vitest';

import { render, screen } from '../../../test-utils/test-utils';
import { AppBar } from './AppBar';
import { preloadMuiFallbacks } from '../_internal/lazy-fallback';

// Renders MUI fallback routes on purpose (plan §36.5 allow-list): load them before the cases run.
beforeAll(() => preloadMuiFallbacks());

test('consumer sx arrays preserve their order after the inherited foreground default', () => {
  render(
    <AppBar color="inherit" sx={[{ color: 'rgb(11, 22, 33)' }, () => ({ color: 'rgb(44, 55, 66)' })]}>
      Title
    </AppBar>,
  );
  expect(getComputedStyle(screen.getByRole('banner')).color).toBe('rgb(44, 55, 66)');
});
