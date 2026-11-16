import '@testing-library/jest-dom/vitest';

import { MenuItem } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { expect, test, vi } from 'vitest';

import { MuiTextField } from './MuiTextField';
import type { VanguardTextFieldProps } from '../mui-legacy-props';


test('legacy native SelectProps preserves the public id and label association', () => {
  render(
    <MuiTextField id="native-id" label="Native" select SelectProps={{ native: true }}>
      <option value="one">One</option>
    </MuiTextField>,
  );
  expect(screen.getByRole('combobox').id).toBe('native-id');
  expect(screen.getByLabelText('Native')).toBe(screen.getByRole('combobox'));
});

test('themed legacy defaults, explicit htmlInput callback slots and events retain precedence', () => {
  const onChange = vi.fn();
  const legacyThemeDefaults1: Partial<VanguardTextFieldProps> = { inputProps: { 'aria-label': 'themed' }, InputProps: { readOnly: true } };
  const theme = createTheme({
    components: {
      MuiTextField: { defaultProps: legacyThemeDefaults1 },
    },
  });
  render(
    <ThemeProvider theme={theme}>
      <MuiTextField
        onChange={onChange}
        slotProps={{ input: { readOnly: false }, htmlInput: () => ({ 'aria-label': 'explicit' }) }}
      />
    </ThemeProvider>,
  );
  const input = screen.getByRole('textbox', { name: 'explicit' });
  expect(input).not.toHaveAttribute('readonly');
  fireEvent.change(input, { target: { value: 'edited' } });
  expect(onChange).toHaveBeenCalledTimes(1);
});

test('nested legacy Select MenuProps and explicit paper slots keep whole-slot precedence', async () => {
  render(
    <MuiTextField
      select
      defaultValue="one"
      SelectProps={{
        MenuProps: {
          PaperProps: { title: 'legacy paper' },
          slotProps: { paper: { title: 'explicit paper' } },
          MenuListProps: { 'aria-label': 'consumer list' },
        },
      }}
    >
      <MenuItem value="one">One</MenuItem>
    </MuiTextField>,
  );
  fireEvent.mouseDown(screen.getByRole('combobox'));
  expect(await screen.findByRole('listbox', { name: 'consumer list' })).toBeInTheDocument();
  expect(screen.getByTitle('explicit paper')).toBeInTheDocument();
  expect(screen.queryByTitle('legacy paper')).toBeNull();
});
