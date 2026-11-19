/**
 * MUI upgrade contract (S0): PhoneNumberPrefix = InputBase with a FlagAdornment (MUI InputAdornment
 * position=start) and the dial code as value.
 */
import React from 'react';
import { describe, expect, test } from 'vitest';

import { render, screen, waitFor } from '../../../../test-utils/test-utils';
import { PhoneNumberPrefix } from './PhoneNumberPrefix';

const getInput = (container: HTMLElement) => container.querySelector('input') as HTMLInputElement;

describe('PhoneNumberPrefix', () => {
  test('renders nothing without a country code', () => {
    const { container } = render(<PhoneNumberPrefix label="Prefix" />);
    expect(container.innerHTML).toBe('');
  });

  test('shows the dial code as value and the flag as MUI start adornment', async () => {
    const { container } = render(<PhoneNumberPrefix id="pp" label="Prefix" countryCode="DE" />);
    const input = getInput(container);
    await waitFor(() => expect(input.value).toBe('+49'));
    const root = input.closest('.MuiOutlinedInput-root') as HTMLElement;
    const adornment = root.firstElementChild as HTMLElement;
    // `.MuiInputAdornment-positionStart` is styled by InputBase.scss
    expect(adornment.classList.contains('MuiInputAdornment-positionStart')).toBe(true);
    expect(screen.getByRole('img', { name: 'de flag' })).toBeTruthy();
    // the floating label is shrunk because there is a value + start adornment
    expect(document.getElementById('pp-label')?.getAttribute('data-shrink')).toBe('true');
  });

  test('value prop is overridden by the country dial code', async () => {
    const { container } = render(<PhoneNumberPrefix countryCode="US" value="ignored" />);
    await waitFor(() => expect(getInput(container).value).toBe('+1'));
  });

  test('changing the country updates the dial code and the flag', async () => {
    const { container, rerender } = render(<PhoneNumberPrefix countryCode="DE" />);
    await waitFor(() => expect(getInput(container).value).toBe('+49'));
    rerender(<PhoneNumberPrefix countryCode="FR" />);
    await waitFor(() => expect(getInput(container).value).toBe('+33'));
    expect(screen.getByRole('img', { name: 'fr flag' })).toBeTruthy();
  });

  test('unknown country keeps an empty value', () => {
    const { container } = render(<PhoneNumberPrefix countryCode={'XX' as any} />);
    expect(getInput(container).value).toBe('');
    expect(screen.getByRole('img', { name: 'xx flag' })).toBeTruthy();
  });

  test('className to container, testId to MUI root, disabled to input', () => {
    const { container } = render(<PhoneNumberPrefix countryCode="DE" className="pp-outer" testId="pp" disabled />);
    expect((container.firstElementChild as HTMLElement).className).toBe('pp-outer');
    const tidEl = screen.getByTestId('pp');
    // the MUI TextField root: wraps the label, the input and the helper text
    expect(tidEl.tagName).toBe('DIV');
    expect(tidEl.querySelector('input, textarea')).not.toBeNull();
    expect(tidEl.parentElement?.classList.contains('vanguard-input')).toBe(true);
    expect(getInput(container).disabled).toBe(true);
  });
});
