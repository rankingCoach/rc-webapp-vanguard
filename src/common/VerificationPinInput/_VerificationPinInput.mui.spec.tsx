/**
 * MUI upgrade contract (S0): VerificationPinInput passes legacy `textFieldProps.InputProps.inputComponent`
 * (react-imask) and `textFieldProps.inputProps.pinMask` through InputBase to MUI TextField (removed in v9 ->
 * slotProps.input / slotProps.htmlInput). Note: src/common stories are not collected by Storybook, so this
 * jsdom spec is the only contract for it.
 */
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, test, vi } from 'vitest';

import { render, screen, waitFor } from '../../../test-utils/test-utils';
import { VerificationPinInput } from './VerificationPinInput';

const getInput = (container: HTMLElement) => container.querySelector('input') as HTMLInputElement;

describe('VerificationPinInput', () => {
  test('renders one IMask input inside the MUI outlined root, with the adornment at the start', () => {
    const { container } = render(
      <VerificationPinInput pinMask="00000" adornment={<span data-testid="pin-adorn">#</span>} />,
    );
    expect(container.querySelectorAll('input')).toHaveLength(1);
    const input = getInput(container);
    const root = input.closest('.MuiOutlinedInput-root') as HTMLElement;
    expect(root.firstElementChild).toBe(screen.getByTestId('pin-adorn'));
    expect(screen.getByTestId('pin-adorn').nextElementSibling).toBe(input);
  });

  test('[bug-lock] the IMask input does not get the MUI input class, so InputBase.scss input padding skips it', () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR (suspected bug): VerificationPinInputIMask sets its own className and drops the one
    // MUI passes; `.MuiOutlinedInput-input` is what InputBase.scss:118 styles.
    const { container } = render(<VerificationPinInput pinMask="00000" adornment={null} />);
    expect(getInput(container).classList.contains('MuiOutlinedInput-input')).toBe(false);
  });

  test('[v5-quirk] inputProps.pinMask reaches the inputComponent: lazy mask shows N placeholders', async () => {
    // Baseline characterization: not a promised contract.
    const { container } = render(<VerificationPinInput pinMask="00000" adornment={null} />);
    const input = getInput(container);
    // CURRENT BEHAVIOUR: the fixed placeholder "12345" passed to InputBase is dropped by the IMask component
    expect(input.placeholder).toBe('NNNNN');
    await waitFor(() => expect(input.value).toBe('_____'));
  });

  test('typing fills the mask and pinInputEvents.onChange receives {currentTarget:{value}}', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <VerificationPinInput pinMask="00000" adornment={null} pinInputEvents={{ onChange }} />,
    );
    const input = getInput(container);
    await user.click(input);
    await user.keyboard('123');
    // lazy=false keeps the placeholder chars in the accepted value
    expect(onChange.mock.calls.at(-1)?.[0]).toEqual({ currentTarget: { value: '123__' } });
  });

  test('pinInputEvents focus/blur/keydown/keyup are forwarded', async () => {
    const user = userEvent.setup();
    const events = { onFocus: vi.fn(), onBlur: vi.fn(), onKeyDown: vi.fn(), onKeyUp: vi.fn(), onInput: vi.fn() };
    const { container } = render(<VerificationPinInput pinMask="00000" adornment={null} pinInputEvents={events} />);
    await user.click(getInput(container));
    await user.keyboard('1');
    await user.tab();
    expect(events.onFocus).toHaveBeenCalled();
    expect(events.onKeyDown).toHaveBeenCalled();
    expect(events.onKeyUp).toHaveBeenCalled();
    expect(events.onBlur).toHaveBeenCalled();
  });

  test('pinIsIncorrect adds the error class to the InputBase wrapper', () => {
    const { container, rerender } = render(<VerificationPinInput pinMask="00000" adornment={null} />);
    const wrapper = container.querySelector('.vanguard-input') as HTMLElement;
    const before = wrapper.className.split(/\s+/).filter(Boolean).length;
    rerender(<VerificationPinInput pinMask="00000" adornment={null} pinIsIncorrect />);
    expect(wrapper.className.split(/\s+/).filter(Boolean).length).toBe(before + 1);
    expect(wrapper.className).toMatch(/error/);
  });

  test('formConfig ref receives the IMask native input', () => {
    const formConfig = { _inputRef: { current: null } };
    const { container } = render(<VerificationPinInput pinMask="00000" adornment={null} formConfig={formConfig} />);
    expect(formConfig._inputRef.current).toBe(getInput(container));
  });
});
