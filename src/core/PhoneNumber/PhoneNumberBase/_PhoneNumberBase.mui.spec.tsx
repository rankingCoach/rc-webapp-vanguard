/**
 * MUI upgrade contract (S0): PhoneNumberBase passes the legacy `textFieldProps.InputProps.inputComponent`
 * (react-imask) and `textFieldProps.inputProps.phoneMask` through InputBase to MUI TextField. Both keys are
 * removed in MUI v9 (-> slotProps.input / slotProps.htmlInput), so the mask reaching the DOM is the contract.
 */
import userEvent from '@testing-library/user-event';
import React, { createRef, MutableRefObject } from 'react';
import { describe, expect, test, vi } from 'vitest';

import { render, screen, waitFor } from '../../../../test-utils/test-utils';
import { PhoneNumberBase } from './PhoneNumberBase';

const getInput = (container: HTMLElement) => container.querySelector('input') as HTMLInputElement;

describe('PhoneNumberBase', () => {
  test('renders the IMask input inside the MUI input root, labelled by the MUI label', () => {
    const { container } = render(<PhoneNumberBase id="ph" label="Phone" countryCode="US" />);
    const input = getInput(container);
    expect(container.querySelectorAll('input')).toHaveLength(1);
    expect(input.closest('.MuiOutlinedInput-root')).not.toBeNull();
    // MUI passes id + className to the custom inputComponent; react-imask forwards className only
    expect(input.classList.contains('MuiOutlinedInput-input')).toBe(true);
    expect(document.getElementById('ph-label')?.tagName).toBe('LABEL');
  });

  test('[v5-quirk] inputProps.phoneMask reaches the inputComponent: placeholder is the country mask', async () => {
    // Baseline characterization: not a promised contract.
    const { container } = render(<PhoneNumberBase countryCode="US" placeholder="ignored" />);
    // CURRENT BEHAVIOUR: the vanguard placeholder is dropped; the IMask component derives it from phoneMask
    await waitFor(() => expect(getInput(container).placeholder).toBe('(###)###-####'));
  });

  test('typing digits is masked for the country and onChange receives {currentTarget:{value}}', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<PhoneNumberBase countryCode="US" onChange={onChange} />);
    const input = getInput(container);
    await waitFor(() => expect(input.placeholder).toBe('(###)###-####'));
    await user.type(input, '2125551234');
    expect(input.value).toBe('(212)555-1234');
    const last = onChange.mock.calls.at(-1)?.[0];
    expect(last).toEqual({ currentTarget: { value: '(212)555-1234' } });
  });

  test('unknown country renders an unmasked input with no placeholder', () => {
    const { container } = render(<PhoneNumberBase countryCode={'XX' as any} />);
    expect(getInput(container).getAttribute('placeholder')).toBeNull();
  });

  test('className goes to the container, not to InputBase; testId to the MUI root', () => {
    const { container } = render(<PhoneNumberBase countryCode="US" className="ph-outer" testId="ph-tid" />);
    const outer = container.firstElementChild as HTMLElement;
    expect(outer.className).toBe('ph-outer');
    expect((outer.firstElementChild as HTMLElement).classList.contains('ph-outer')).toBe(false);
    const tidEl = screen.getByTestId('ph-tid');
    // the MUI TextField root: wraps the label, the input and the helper text
    expect(tidEl.tagName).toBe('DIV');
    expect(tidEl.querySelector('input, textarea')).not.toBeNull();
    expect(tidEl.parentElement?.classList.contains('vanguard-input')).toBe(true);
  });

  test('inputRef receives the IMask native input through MUI', () => {
    const inputRef = createRef<HTMLInputElement>() as MutableRefObject<HTMLInputElement | null>;
    const { container } = render(<PhoneNumberBase countryCode="US" inputRef={inputRef} />);
    expect(inputRef.current).toBe(getInput(container));
  });

  test('onFocus / onBlur reach the consumer', async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const { container } = render(<PhoneNumberBase countryCode="US" onFocus={onFocus} onBlur={onBlur} />);
    await user.click(getInput(container));
    await user.tab();
    expect(onFocus).toHaveBeenCalled();
    expect(onBlur).toHaveBeenCalled();
  });

  test('formConfig maps to InputBase formconfig (ref + dispatch)', async () => {
    const user = userEvent.setup();
    const formConfig = {
      _inputRef: { current: null },
      setStateValue: vi.fn((p: unknown) => ({ type: 'mui-contract/noop', payload: p })),
    };
    const { container } = render(<PhoneNumberBase countryCode="DE" formConfig={formConfig} />);
    expect(formConfig._inputRef.current).toBe(getInput(container));
    await user.type(getInput(container), '12');
    expect(formConfig.setStateValue).toHaveBeenLastCalledWith('12');
  });
});
