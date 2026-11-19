import '@testing-library/jest-dom/vitest';

import { MenuItem } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { expect, test, vi } from 'vitest';

import type { rcInputBaseProps } from './InputBase';
import { MuiTextField } from './MuiTextField';

type PublicTextFieldProps = NonNullable<rcInputBaseProps['textFieldProps']>;

test('legacy public InputProps still reaches the input component', () => {
  const props: PublicTextFieldProps = { InputProps: { readOnly: true } };
  render(<MuiTextField {...props} />);
  expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
});

test('legacy public inputProps still reaches the HTML input', () => {
  const props: PublicTextFieldProps = { inputProps: { title: 'legacy input' } };
  render(<MuiTextField {...props} />);
  expect(screen.getByRole('textbox')).toHaveAttribute('title', 'legacy input');
});

test('legacy public InputLabelProps still reaches the label', () => {
  const props: PublicTextFieldProps = { InputLabelProps: { title: 'legacy label' } };
  render(<MuiTextField {...props} label="Label" />);
  expect(screen.getByTitle('legacy label').tagName).toBe('LABEL');
});

test('legacy public SelectProps still selects the native input path', () => {
  const props: PublicTextFieldProps = { SelectProps: { native: true } };
  render(
    <MuiTextField {...props} select defaultValue="one">
      <option value="one">One</option>
    </MuiTextField>,
  );
  expect(screen.getByRole('combobox').tagName).toBe('SELECT');
});

test('legacy public FormHelperTextProps still reaches the helper', () => {
  const props: PublicTextFieldProps = { FormHelperTextProps: { title: 'legacy helper' } };
  render(<MuiTextField {...props} helperText="Help" />);
  expect(screen.getByTitle('legacy helper')).toHaveTextContent('Help');
});

test('legacy input and htmlInput mappings preserve events and explicit callback slot precedence', () => {
  const onChange = vi.fn();
  render(
    <MuiTextField
      InputProps={{ readOnly: true }}
      inputProps={{ title: 'legacy' }}
      onChange={onChange}
      slotProps={{ input: () => ({ readOnly: false }), htmlInput: () => ({ title: 'explicit' }) }}
    />,
  );
  const input = screen.getByRole('textbox');
  expect(input).not.toHaveAttribute('readonly');
  expect(input).toHaveAttribute('title', 'explicit');
  fireEvent.change(input, { target: { value: 'edit' } });
  expect(onChange).toHaveBeenCalledTimes(1);
});

test('non-native Select keeps the label element and combined label/display association', () => {
  render(<MuiTextField id="compat-select" select label="Choice" defaultValue="" />);
  const field = screen.getByRole('combobox', { name: 'Choice' });
  const label = document.getElementById('compat-select-label');
  expect(label?.tagName).toBe('LABEL');
  expect(label).toHaveAttribute('for', 'compat-select');
  expect(field).toHaveAttribute('aria-labelledby', 'compat-select-label compat-select');
});

test('explicit inputLabel and Select display slot props win over compatibility defaults', () => {
  render(
    <>
      <span id="consumer-name">Consumer label</span>
      <MuiTextField
        id="compat-select"
        select
        label="Choice"
        slotProps={{
          inputLabel: () => ({ component: 'div', htmlFor: undefined }),
          select: () => ({ SelectDisplayProps: { 'aria-labelledby': 'consumer-name' } }),
        }}
      />
    </>,
  );
  expect(document.getElementById('compat-select-label')?.tagName).toBe('DIV');
  expect(screen.getByRole('combobox')).toHaveAttribute('aria-labelledby', 'consumer-name');
});

const LegacyHtmlInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => {
    const domProps = { ...props } as React.InputHTMLAttributes<HTMLInputElement> & { ownerState?: unknown };
    delete domProps.ownerState;
    return <input {...domProps} ref={ref} data-testid="legacy-html-input" />;
  },
);

test('legacy InputProps.components.Input still selects the custom input without replacing the styled root', () => {
  render(<MuiTextField InputProps={{ components: { Input: LegacyHtmlInput } }} />);
  expect(screen.getByTestId('legacy-html-input')).toBe(screen.getByRole('textbox'));
  expect(screen.getByRole('textbox').closest('.MuiOutlinedInput-root')).not.toBeNull();
});

test('legacy InputProps.componentsProps.input still reaches the input', () => {
  render(<MuiTextField InputProps={{ componentsProps: { input: { title: 'legacy nested input props' } } }} />);
  expect(screen.getByRole('textbox')).toHaveAttribute('title', 'legacy nested input props');
});

test('nested legacy MenuProps.disableEscapeKeyDown blocks only Escape and preserves the Select close handler', () => {
  const onClose = vi.fn();
  render(
    <MuiTextField
      select
      label="Nested choice"
      defaultValue="one"
      SelectProps={{ onClose, MenuProps: { disableEscapeKeyDown: true } }}
    >
      <MenuItem value="one">One</MenuItem>
    </MuiTextField>,
  );
  fireEvent.mouseDown(screen.getByRole('combobox'));
  const option = screen.getByRole('option', { name: 'One' });
  fireEvent.keyDown(option, { key: 'Escape' });
  expect(onClose).not.toHaveBeenCalled();
  expect(screen.getByRole('listbox')).toBeInTheDocument();
  fireEvent.keyDown(option, { key: 'Tab' });
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('select required label retains the styled InputLabel asterisk', () => {
  render(
    <MuiTextField id="required-select" select required label="Required choice" defaultValue="one">
      <MenuItem value="one">One</MenuItem>
    </MuiTextField>,
  );
  expect(document.getElementById('required-select-label')).toHaveTextContent('Required choice *');
});

test('select label component theme default remains effective through legacy DOM mapping', () => {
  const theme = createTheme({ components: { MuiInputLabel: { defaultProps: { component: 'span' } } } });
  render(
    <ThemeProvider theme={theme}>
      <MuiTextField id="themed-select" select required label="Themed choice" defaultValue="one">
        <MenuItem value="one">One</MenuItem>
      </MuiTextField>
    </ThemeProvider>,
  );
  expect(document.getElementById('themed-select-label')?.tagName).toBe('SPAN');
  expect(document.getElementById('themed-select-label')).toHaveTextContent('Themed choice *');
});
