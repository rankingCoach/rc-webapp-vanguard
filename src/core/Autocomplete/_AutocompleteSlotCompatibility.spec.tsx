import '@testing-library/jest-dom/vitest';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { expect, test, vi } from 'vitest';

import { render, screen } from '../../../test-utils/test-utils';
import { Autocomplete } from './Autocomplete';
import type { ComponentsProps } from '@mui/material/styles';


test('custom tags override consumer renderTags and slotProps, retaining wrapper and chip classes', async () => {
  const renderTags = vi.fn();
  const user = userEvent.setup();
  render(
    <Autocomplete
      options={['apple']}
      multiple
      {...{ renderTags, slotProps: { chip: { className: 'ignored-chip' } } }}
    />,
  );
  await user.click(screen.getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: 'apple' }));
  const chip = document.querySelector('.vanguard-input-tags .MuiChip-root');
  expect(chip).toHaveClass('MuiAutocomplete-tag');
  expect(chip).not.toHaveClass('ignored-chip');
  expect(chip).toHaveAttribute('tabindex', '-1');
  expect(renderTags).not.toHaveBeenCalled();
});

test('multiple tags retain Vanguard rendering over explicit renderValue and themed renderTags', async () => {
  const consumer = vi.fn(() => <span>consumer value</span>);
  const legacy = vi.fn(() => <span>legacy tags</span>);
  const user = userEvent.setup();
  const legacyThemeDefaults1: ComponentsProps['MuiAutocomplete'] & { renderTags: typeof legacy } = { renderTags: legacy };
  render(
    <ThemeProvider theme={createTheme({ components: { MuiAutocomplete: { defaultProps: legacyThemeDefaults1 } } })}>
      <Autocomplete options={['apple']} multiple {...{ renderValue: consumer }} />
    </ThemeProvider>,
  );
  await user.click(screen.getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: 'apple' }));
  const chip = document.querySelector('.vanguard-input-tags .MuiChip-root');
  expect(chip).toHaveAttribute('data-item-index', '0');
  expect(chip).toHaveAttribute('data-tag-index', '0');
  expect(consumer).not.toHaveBeenCalled();
  expect(legacy).not.toHaveBeenCalled();
});
