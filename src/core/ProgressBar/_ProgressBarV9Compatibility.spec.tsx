import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import React from 'react';
import { expect, test } from 'vitest';

import { ProgressBar } from './ProgressBar';

test('fractional progress rounds only its accessible value and preserves visual precision', () => {
  const { container } = render(<ProgressBar progressValue={33.6} />);
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '34');
  expect((container.querySelector('.MuiLinearProgress-bar') as HTMLElement).style.transform).toBe('translateX(-66.4%)');
});

test('indeterminate progress has no numeric accessible value', () => {
  render(<ProgressBar variant="indeterminate" progressValue={33.6} />);
  expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow');
});
