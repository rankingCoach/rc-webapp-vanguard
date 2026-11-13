/**
 * MUI upgrade contract (S0): FormControl is a thin pass-through of MUI FormControl in a container.
 * Every prop is MUI's own FormControlProps, so the MUI context (disabled/error/required/size/focused
 * propagation to InputLabel / InputBase / FormHelperText) is the public behaviour.
 */
import { FormHelperText, InputLabel, OutlinedInput, useFormControl } from '@mui/material';
import React, { createRef } from 'react';
import { describe, expect, test } from 'vitest';

import { render, screen } from '../../../test-utils/test-utils';
import { FormControl } from './FormControl';

const ProbeHarness63 = ({ seen }: { seen: Array<Record<string, unknown> | undefined> }) => {
      const ctx = useFormControl();
      seen.push(ctx && { fullWidth: ctx.fullWidth, size: ctx.size, variant: ctx.variant });
      return null;
    };

const ProbeHarness82 = ({ seen }: { seen: Array<Record<string, unknown> | undefined> }) => {
      const ctx = useFormControl();
      seen.push(ctx && { fullWidth: ctx.fullWidth, size: ctx.size, variant: ctx.variant });
      return null;
    };


describe('FormControl', () => {
  test('wraps MUI FormControl in a FormControl-container div', () => {
    const { container } = render(
      <FormControl data-testid="fc" className="custom">
        <span>child</span>
      </FormControl>,
    );
    const outer = container.firstElementChild as HTMLElement;
    expect(outer.className).toBe('FormControl-container');
    const root = screen.getByTestId('fc');
    expect(root.parentElement).toBe(outer);
    expect(root.tagName).toBe('DIV');
    expect(root.classList.contains('MuiFormControl-root')).toBe(true);
    expect(root.classList.contains('custom')).toBe(true);
  });

  test('component prop changes the root element (fieldset)', () => {
    render(<FormControl data-testid="fc" component="fieldset" />);
    expect(screen.getByTestId('fc').tagName).toBe('FIELDSET');
  });

  test('ref is forwarded to the MUI root element', () => {
    const ref = createRef<HTMLDivElement>();
    render(<FormControl ref={ref} data-testid="fc" />);
    expect(ref.current).toBe(screen.getByTestId('fc'));
  });

  test('disabled / error / required propagate through MUI context to label, input and helper', () => {
    render(
      <FormControl disabled error required>
        <InputLabel htmlFor="fc-in">Name</InputLabel>
        <OutlinedInput id="fc-in" label="Name" />
        <FormHelperText data-testid="helper">Help</FormHelperText>
      </FormControl>,
    );
    const input = screen.getByLabelText(/Name/) as HTMLInputElement;
    expect(input.disabled).toBe(true);
    expect(input.required).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const label = document.querySelector('label') as HTMLElement;
    expect(label.classList.contains('Mui-disabled')).toBe(true);
    expect(label.classList.contains('Mui-error')).toBe(true);
    expect(label.querySelector('.MuiInputLabel-asterisk')).not.toBeNull();
    const helper = screen.getByTestId('helper');
    expect(helper.classList.contains('Mui-error')).toBe(true);
    expect(helper.classList.contains('Mui-disabled')).toBe(true);
  });

  test('fullWidth / size / variant reach children through the MUI form-control context', () => {
    const seen: Array<Record<string, unknown> | undefined> = [];
    const Probe = ProbeHarness63;
    render(
      <FormControl fullWidth size="small" variant="filled" margin="dense" data-testid="fc">
        <Probe seen={seen} />
      </FormControl>,
    );
    expect(seen.at(-1)).toEqual({ fullWidth: true, size: 'small', variant: 'filled' });
    // fullWidth / margin are root geometry
    const root = screen.getByTestId('fc');
    expect(getComputedStyle(root).width).toBe('100%');
    expect(getComputedStyle(root).marginTop).toBe('8px');
  });

  test('defaults: medium, outlined, not fullWidth, no margin', () => {
    const seen: Array<Record<string, unknown> | undefined> = [];
    const Probe = ProbeHarness82;
    render(
      <FormControl data-testid="fc">
        <Probe seen={seen} />
      </FormControl>,
    );
    expect(seen.at(-1)).toEqual({ fullWidth: false, size: 'medium', variant: 'outlined' });
    expect(getComputedStyle(screen.getByTestId('fc')).marginTop).toBe('0px');
  });

  test('focused forces the label into the focused + shrunk state', () => {
    render(
      <FormControl focused>
        <InputLabel>Lbl</InputLabel>
        <OutlinedInput />
      </FormControl>,
    );
    const label = document.querySelector('label') as HTMLElement;
    expect(label.classList.contains('Mui-focused')).toBe(true);
    expect(label.getAttribute('data-shrink')).toBe('true');
  });

  test('without props renders an empty MUI FormControl', () => {
    const { container } = render(<FormControl />);
    const root = container.querySelector('.MuiFormControl-root') as HTMLElement;
    expect(root.children).toHaveLength(0);
  });
});
