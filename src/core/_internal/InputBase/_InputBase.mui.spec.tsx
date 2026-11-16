/**
 * MUI upgrade contract (S0): characterizes InputBase on MUI v5 as installed.
 * InputBase is the only place Vanguard renders MUI `TextField`; `textFieldProps` is public API that
 * consumers use to pass the legacy (deprecated in v6, removed in v9) `InputProps`, `inputProps`,
 * `InputLabelProps`, `SelectProps` and `FormHelperTextProps` keys. These tests must stay unchanged
 * across the bump and go red where MUI changes behaviour.
 *
 * MUI class names are queried only where Vanguard SCSS/TS depends on them (see
 * agentic-plans/mui-upgrade-breaking-changes.md, "MUI class names Vanguard depends on").
 */
import { FormConfigElement } from '@custom-hooks/useFormConfig';
import { MenuItem } from '@mui/material';
import userEvent from '@testing-library/user-event';
import { OVERLAY_BASE_Z_INDEX, OverlayStackingService } from '@vanguard/OverlayStacking/OverlayStackingService';
import React, { createRef, MutableRefObject } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { act, fireEvent, render, screen, waitFor, within } from '../../../../test-utils/test-utils';
import { InputBase, rcInputBaseProps } from './InputBase';

const ReceivedInputContext = React.createContext<Record<string, unknown>[]>([]);


const CustomHarness794 = React.forwardRef<HTMLInputElement, any> (({ customFlag, ...rest }, ref) => {
  const received = React.useContext(ReceivedInputContext);

        received.push({ customFlag, ...rest });
        return <input ref={ref} data-testid="custom-input" {...rest} />;
      
});


const LintCustom541 = React.forwardRef<HTMLInputElement, any>(({ customFlag, ...rest }, ref) => (
      <input ref={ref} data-testid="custom-input" data-flag={customFlag} {...rest} />
    ));


/** jsdom has no ResizeObserver; InputBase needs one whenever a highlight backdrop is active. */
class ResizeObserverStub {
  private readonly cb: ResizeObserverCallback;
  constructor(cb: ResizeObserverCallback) {
    this.cb = cb;
  }
  observe() {
    this.cb([], this as unknown as ResizeObserver);
  }
  unobserve() {}
  disconnect() {}
}

/** vanguard Icon renders after its SVG asset resolves (slow under coverage instrumentation). */
const ICON_LOAD = { timeout: 5000 };

const highlights = (container: HTMLElement) => container.querySelector('.vanguard-input-highlights') as HTMLElement;

/** jsdom does not scroll; pin the scroll offset the backdrop sync reads. */
const setScroll = (el: HTMLElement, top: number) => {
  Object.defineProperty(el, 'scrollTop', { configurable: true, value: top });
  Object.defineProperty(el, 'scrollLeft', { configurable: true, value: 0 });
};

const getInput = (container: HTMLElement) => container.querySelector('input, textarea') as HTMLInputElement;

/** Probe: z-index the next overlay would get. Equals BASE+1 when the ledger is empty. */
const nextOverlayZ = () => {
  const z = OverlayStackingService.register('probe', 'modal');
  OverlayStackingService.unregister('probe');
  return z;
};

const makeFormConfig = (overrides: Partial<FormConfigElement> = {}): FormConfigElement => ({
  _inputRef: { current: null },
  setStateValue: vi.fn((payload: unknown) => ({ type: 'mui-contract/noop', payload })),
  ...overrides,
});

const renderBase = (props: rcInputBaseProps = {}) => render(<InputBase id="field" {...props} />);

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
});

afterEach(() => {
  vi.unstubAllGlobals();
  OverlayStackingService.__resetForTests();
});

describe('InputBase: render, role and accessible name', () => {
  test('renders a native text input labelled by its label plus the "Optional" hint', () => {
    renderBase({ label: 'Name' });

    const input = screen.getByLabelText(/Name/) as HTMLInputElement;
    expect(input.tagName).toBe('INPUT');
    expect(input.id).toBe('field');
    // MUI renders the label as a <label for=id>; the optional hint is part of the accessible name
    const label = document.getElementById('field-label') as HTMLElement;
    expect(label.tagName).toBe('LABEL');
    expect(label.getAttribute('for')).toBe('field');
    expect(label.textContent).toBe('NameOptional');
  });

  test('[bug-lock] puts role="textbox" and data-testid on the MUI FormControl wrapper, not on the input', () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR (suspected bug): `role="textbox"` is forwarded to the TextField root, so every
    // InputBase exposes TWO textboxes (the wrapper div and the real <input>).
    const { container } = renderBase({ label: 'Name', testId: 'tid' });

    const wrapper = screen.getByTestId('tid');
    expect(wrapper.tagName).toBe('DIV');
    expect(wrapper.getAttribute('role')).toBe('textbox');
    expect(screen.getAllByRole('textbox')).toHaveLength(2);
    expect(wrapper.contains(getInput(container))).toBe(true);
  });

  test('forwards className to the vanguard wrapper and keeps the base class', () => {
    const { container } = renderBase({ className: 'my-class' });
    const root = container.firstElementChild as HTMLElement;
    expect(root.classList.contains('vanguard-input')).toBe(true);
    expect(root.classList.contains('my-class')).toBe(true);
  });

  test('[v5-quirk] passes the type prop verbatim; default type is the capitalised string "Text"', () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR: InputBase defaults `type = 'Text'`; browsers treat the unknown value as text.
    const { container, rerender } = renderBase();
    expect(getInput(container).getAttribute('type')).toBe('Text');
    rerender(<InputBase id="field" type="password" />);
    expect(getInput(container).getAttribute('type')).toBe('password');
  });

  test('translates and forwards the placeholder', () => {
    renderBase({ placeholder: 'Type %thing%', replacements: { thing: 'here' } });
    expect(screen.getByPlaceholderText('Type here')).toBeTruthy();
  });

  test('omits the placeholder attribute when none is given', () => {
    const { container } = renderBase();
    expect(getInput(container).hasAttribute('placeholder')).toBe(false);
  });

  test('autoFocus focuses the input on mount', () => {
    const { container } = renderBase({ autoFocus: true });
    expect(document.activeElement).toBe(getInput(container));
  });
});

describe('InputBase: label variants (MUI InputLabel shrink)', () => {
  test('floating label is not shrunk while empty and shrinks on focus', async () => {
    const user = userEvent.setup();
    const { container } = renderBase({ label: 'Name' });
    const label = document.getElementById('field-label') as HTMLElement;

    expect(label.getAttribute('data-shrink')).toBe('false');
    // class used by InputBase.scss (`.MuiInputLabel-shrink`)
    expect(label.classList.contains('MuiInputLabel-shrink')).toBe(false);

    await user.click(getInput(container));
    expect(label.getAttribute('data-shrink')).toBe('true');
    expect(label.classList.contains('MuiInputLabel-shrink')).toBe(true);
  });

  test('floating label is shrunk when a value is present', () => {
    renderBase({ label: 'Name', value: 'abc' });
    expect(document.getElementById('field-label')?.getAttribute('data-shrink')).toBe('true');
  });

  test.each(['static', 'outer'] as const)('labelType=%s keeps the label permanently shrunk', (labelType) => {
    const { container } = renderBase({ label: 'Name', labelType, labelStyle: { color: 'rgb(1, 2, 3)' } });
    const label = document.getElementById('field-label') as HTMLElement;
    expect(label.getAttribute('data-shrink')).toBe('true');
    expect(label.style.color).toBe('rgb(1, 2, 3)');
    const root = container.firstElementChild as HTMLElement;
    expect(root.classList.contains('vanguard-label-outer')).toBe(labelType === 'outer');
  });

  test('labelType=hidden renders no label and adds the hidden class', () => {
    const { container } = renderBase({ label: 'Name', labelType: 'hidden' });
    expect(container.querySelector('label')).toBeNull();
    expect((container.firstElementChild as HTMLElement).classList.contains('vanguard-label-hidden')).toBe(true);
  });

  test('no label renders no <label> and adds the hidden class', () => {
    const { container } = renderBase();
    expect(container.querySelector('label')).toBeNull();
    expect((container.firstElementChild as HTMLElement).classList.contains('vanguard-label-hidden')).toBe(true);
  });

  test('required field drops the Optional hint and gets the MUI asterisk (hidden by SCSS)', () => {
    const { container } = renderBase({ label: 'Name', required: true });
    const input = getInput(container);
    expect(input.required).toBe(true);
    const label = document.getElementById('field-label') as HTMLElement;
    expect(label.querySelector('.vanguard-input-label-optional')).toBeNull();
    // `.MuiInputLabel-asterisk` is hidden by InputBase.scss
    expect(label.querySelector('.MuiInputLabel-asterisk')?.textContent?.trim()).toBe('*');
  });

  test('hideOptionalLabel removes the Optional hint on non-required fields', () => {
    renderBase({ label: 'Name', hideOptionalLabel: true });
    expect(document.getElementById('field-label')?.textContent).toBe('Name');
  });

  test('labelStyle.color tints the Optional hint at 70% via relative color syntax', () => {
    renderBase({ label: 'Name', labelType: 'static', labelStyle: { color: 'red' } });
    const hint = document.querySelector('.vanguard-input-label-optional') as HTMLElement;
    expect(hint.getAttribute('style')).toContain('rgb(from red r g b / 0.7)');
  });

  test('the outlined notch legend mirrors the label text', () => {
    const { container } = renderBase({ label: 'Name' });
    // `legend` is hidden by InputBase.scss
    expect(container.querySelector('fieldset legend')?.textContent).toBe('NameOptional');
  });
});

describe('InputBase: value', () => {
  test('controlled value is rendered and follows prop changes', () => {
    const { container, rerender } = renderBase({ value: 'one' });
    expect(getInput(container).value).toBe('one');
    rerender(<InputBase id="field" value="two" />);
    expect(getInput(container).value).toBe('two');
  });

  test('defaultValue seeds an uncontrolled input that keeps typed text', async () => {
    const user = userEvent.setup();
    const { container } = renderBase({ defaultValue: 'seed' });
    const input = getInput(container);
    expect(input.value).toBe('seed');
    await user.type(input, '!');
    expect(input.value).toBe('seed!');
  });

  test('valueAsDefaultValue turns value into defaultValue (uncontrolled)', async () => {
    const user = userEvent.setup();
    const { container, rerender } = renderBase({ value: 'start', valueAsDefaultValue: true });
    const input = getInput(container);
    await user.type(input, 'X');
    expect(input.value).toBe('startX');
    rerender(<InputBase id="field" value="ignored" valueAsDefaultValue={true} />);
    expect(input.value).toBe('startX');
  });

  test('a numeric value is rendered as text', () => {
    const { container } = renderBase({ value: 42 });
    expect(getInput(container).value).toBe('42');
  });
});

describe('InputBase: disabled / error / helper text', () => {
  test('disabled disables the input and marks the MUI root', () => {
    const { container } = renderBase({ disabled: true, label: 'Name' });
    const input = getInput(container);
    expect(input.disabled).toBe(true);
    // `.Mui-disabled` on `.MuiOutlinedInput-root` drives opacity in InputBase.scss
    expect(input.closest('.MuiOutlinedInput-root')?.classList.contains('Mui-disabled')).toBe(true);
  });

  test('infoText renders inside the MUI helper text, linked via aria-describedby', () => {
    const { container } = renderBase({ infoText: 'Some info' });
    const input = getInput(container);
    const helper = document.getElementById('field-helper-text') as HTMLElement;
    expect(helper.tagName).toBe('P');
    expect(input.getAttribute('aria-describedby')).toBe('field-helper-text');
    // `.MuiFormHelperText-root` is reset by InputBase.scss
    expect(helper.classList.contains('MuiFormHelperText-root')).toBe(true);
    expect(within(helper).getByText('Some info').classList.contains('vanguard-input-info-text')).toBe(true);
  });

  test('an empty helper <p> is always rendered (helperText is always an element)', () => {
    const { container } = renderBase();
    const helper = document.getElementById('field-helper-text') as HTMLElement;
    expect(helper).not.toBeNull();
    expect(helper.textContent).toBe('');
    expect(getInput(container).getAttribute('aria-describedby')).toBe('field-helper-text');
  });

  test('formconfig error shows the first error, aria-invalid and Mui-error', () => {
    const formconfig = makeFormConfig({ hasError: true, errors: ['Too short'] as any });
    const { container } = renderBase({ formconfig, label: 'Name' });
    const input = getInput(container);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.closest('.MuiOutlinedInput-root')?.classList.contains('Mui-error')).toBe(true);
    const error = screen.getByTestId('vanguard-input-error-text');
    expect(error.textContent).toBe('Too short');
    expect(error.getAttribute('aria-live')).toBe('polite');
    expect(document.getElementById('field-label')?.classList.contains('Mui-error')).toBe(true);
  });

  test('error with no messages renders an empty error text node', () => {
    renderBase({ formconfig: makeFormConfig({ hasError: true, errors: null }) });
    expect(screen.getByTestId('vanguard-input-error-text').textContent).toBe('');
  });

  test('error wins over infoText', () => {
    renderBase({ infoText: 'info', formconfig: makeFormConfig({ hasError: true, errors: ['bad'] as any }) });
    expect(screen.queryByText('info')).toBeNull();
    expect(screen.getByText('bad')).toBeTruthy();
  });
});

describe('InputBase: counter and helper link', () => {
  test('counter shows length/maxLength and follows typing', async () => {
    const user = userEvent.setup();
    const { container } = renderBase({ counter: true, maxLength: 10 });
    const counter = () => container.querySelector('.vanguard-input-counter')?.textContent;
    expect(counter()).toBe('0/10');
    await user.type(getInput(container), 'abc');
    expect(counter()).toBe('3/10');
    await user.clear(getInput(container));
    expect(counter()).toBe('0/10');
  });

  test('counter without maxLength shows only the length of a controlled string value', () => {
    const { container, rerender } = renderBase({ counter: true, value: 'hey' });
    expect(container.querySelector('.vanguard-input-counter')?.textContent).toBe('3');
    rerender(<InputBase id="field" counter={true} value="four" />);
    expect(container.querySelector('.vanguard-input-counter')?.textContent).toBe('4');
  });

  test('[v5-quirk] counter shows 0 for a numeric controlled value', () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR: length is only tracked for string values, so value={12345} counts as 0.
    const { container, getByDisplayValue } = renderBase({ counter: true, value: 12345 });
    expect(getByDisplayValue('12345')).toBe(getInput(container));
    expect(container.querySelector('.vanguard-input-counter')?.textContent).toBe('0');
  });

  test('counter takes maxLength from formconfig validation', () => {
    const { container } = renderBase({ counter: true, formconfig: makeFormConfig({ validation: { maxLength: 7 } }) });
    expect(container.querySelector('.vanguard-input-counter')?.textContent).toBe('0/7');
  });

  test('helper link calls back with the current value', async () => {
    const user = userEvent.setup();
    const onHelperLinkClick = vi.fn();
    renderBase({ value: 'v1', helperLinkText: 'Help me', onHelperLinkClick });
    await user.click(screen.getByText('Help me'));
    expect(onHelperLinkClick).toHaveBeenCalledWith('v1');
  });

  test('helper link with no value calls back with an empty string', async () => {
    const user = userEvent.setup();
    const onHelperLinkClick = vi.fn();
    renderBase({ helperLinkText: 'Help me', onHelperLinkClick });
    await user.click(screen.getByText('Help me'));
    expect(onHelperLinkClick).toHaveBeenCalledWith('');
  });

  test('helper link text without a click handler renders nothing', () => {
    renderBase({ helperLinkText: 'Help me' });
    expect(screen.queryByText('Help me')).toBeNull();
  });
});

describe('InputBase: event callbacks', () => {
  test('onFocus / onBlur receive React focus events targeting the input', async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const { container } = renderBase({ onFocus, onBlur });
    const input = getInput(container);
    await user.click(input);
    await user.tab();
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onFocus.mock.calls[0][0].target).toBe(input);
    expect(onFocus.mock.calls[0][0].type).toBe('focus');
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(onBlur.mock.calls[0][0].type).toBe('blur');
  });

  test('onChange receives the change event with target.value for every keystroke', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = renderBase({ onChange });
    await user.type(getInput(container), 'ab');
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange.mock.calls[1][0].type).toBe('change');
    expect(onChange.mock.calls[1][0].target.value).toBe('ab');
  });

  test('onKeyDown / onKeyUp / onInput / onClick are forwarded', async () => {
    const user = userEvent.setup();
    const onKeyDown = vi.fn();
    const onKeyUp = vi.fn();
    const onInput = vi.fn();
    const onClick = vi.fn();
    const { container } = renderBase({ onKeyDown, onKeyUp, onInput, onClick });
    await user.click(getInput(container));
    await user.keyboard('a');
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onKeyDown.mock.calls[0][0].key).toBe('a');
    expect(onKeyUp.mock.calls[0][0].key).toBe('a');
    expect(onInput).toHaveBeenCalledTimes(1);
  });

  test('Enter keydown is prevented unless allowBreakLines', () => {
    const { container, rerender } = renderBase();
    expect(fireEvent.keyDown(getInput(container), { key: 'Enter', code: 'Enter' })).toBe(false);
    rerender(<InputBase id="field" allowBreakLines={true} />);
    expect(fireEvent.keyDown(getInput(container), { key: 'Enter', code: 'Enter' })).toBe(true);
  });

  test('InputNumber blocks "e" unless a modifier is held', () => {
    const { container } = renderBase({ formFieldType: 'InputNumber', type: 'number' });
    const input = getInput(container);
    expect(fireEvent.keyDown(input, { key: 'e' })).toBe(false);
    expect(fireEvent.keyDown(input, { key: 'e', ctrlKey: true })).toBe(true);
    expect(fireEvent.keyDown(input, { key: '1' })).toBe(true);
  });

  test('formconfig prevention blocks "!" keydown', () => {
    const formconfig = makeFormConfig({ prevention: { exclamationMarksNotAllowed: true } as any });
    const { container } = renderBase({ formconfig });
    expect(fireEvent.keyDown(getInput(container), { key: '!' })).toBe(false);
  });

  test('InputNumber onInput tracks badInput without breaking the label', () => {
    const onInput = vi.fn();
    const { container } = renderBase({ formFieldType: 'InputNumber', type: 'number', label: 'N', onInput });
    fireEvent.input(getInput(container), { target: { value: '5' } });
    expect(onInput).toHaveBeenCalledTimes(1);
    expect(document.getElementById('field-label')?.getAttribute('data-shrink')).toBe('true');
  });

  test('scrolling the input moves the highlight backdrop by the input scroll offset', () => {
    const { container } = renderBase({ highlightUrl: true, value: 'x' });
    const input = getInput(container);
    setScroll(input, 7);
    fireEvent.scroll(input);
    expect(highlights(container).style.transform).toBe('translate(0px, -7px)');
  });

  test('pasting resyncs the highlight backdrop on the next tick', async () => {
    const { container } = renderBase({ highlightUrl: true, value: 'x' });
    const input = getInput(container);
    setScroll(input, 5);
    fireEvent.paste(input);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(highlights(container).style.transform).toBe('translate(0px, -5px)');
  });
});

describe('InputBase: inputRef', () => {
  test('inputRef prop receives the native input element', () => {
    const inputRef = createRef<HTMLInputElement>() as MutableRefObject<HTMLInputElement | null>;
    const { container } = renderBase({ inputRef });
    expect(inputRef.current).toBe(getInput(container));
  });

  test('formconfig._inputRef wins over inputRef and gets the native input', () => {
    const inputRef = createRef<HTMLInputElement>() as MutableRefObject<HTMLInputElement | null>;
    const formconfig = makeFormConfig();
    const { container } = renderBase({ inputRef, formconfig });
    expect(formconfig._inputRef?.current).toBe(getInput(container));
    expect(inputRef.current).toBeNull();
  });

  test('multiline inputRef receives the visible <textarea>', () => {
    const inputRef = createRef<HTMLTextAreaElement>() as MutableRefObject<HTMLTextAreaElement | null>;
    renderBase({ inputRef, multiline: true });
    expect(inputRef.current?.tagName).toBe('TEXTAREA');
    expect(inputRef.current?.getAttribute('aria-hidden')).toBeNull();
  });
});

describe('InputBase: multiline (MUI TextareaAutosize)', () => {
  test('renders a visible textarea plus the hidden MUI autosize shadow textarea', () => {
    const { container } = renderBase({ multiline: true, label: 'Bio' });
    const textareas = container.querySelectorAll('textarea');
    expect(textareas).toHaveLength(2);
    const [visible, shadow] = Array.from(textareas);
    expect(screen.getByLabelText(/Bio/)).toBe(visible);
    expect(container.querySelector('input')).toBeNull();
    expect(shadow.getAttribute('aria-hidden')).toBe('true');
    expect(shadow.readOnly).toBe(true);
    expect(shadow.tabIndex).toBe(-1);
  });

  test('rows pins MUI autosize to that many rows and is rendered as the rows attribute', () => {
    const { container } = renderBase({ multiline: true, rows: 4 });
    const textareas = container.querySelectorAll('textarea');
    expect(textareas).toHaveLength(2);
    expect(textareas[0].getAttribute('rows')).toBe('4');
  });

  test('multiline=false renders a single-line input', () => {
    const { container } = renderBase({ multiline: false });
    expect(container.querySelector('textarea')).toBeNull();
  });
});

describe('InputBase: adornments', () => {
  test('adornment becomes MUI startAdornment before the input', () => {
    const { container } = renderBase({ adornment: <span data-testid="start">S</span> });
    const root = getInput(container).closest('.MuiOutlinedInput-root') as HTMLElement;
    expect(root.firstElementChild).toBe(screen.getByTestId('start'));
    expect(screen.getByTestId('start').nextElementSibling).toBe(getInput(container));
  });

  test('endAdornment becomes MUI endAdornment after the input', () => {
    const { container } = renderBase({ endAdornment: <span data-testid="end">E</span> });
    const input = getInput(container);
    expect(input.nextElementSibling).toBe(screen.getByTestId('end'));
  });

  test('roundedNumericCTAType on InputNumber renders step buttons that call back', async () => {
    const user = userEvent.setup();
    const onStepUpNumericClick = vi.fn();
    const onStepDownNumericClick = vi.fn();
    const { container } = renderBase({
      formFieldType: 'InputNumber',
      type: 'number',
      roundedNumericCTAType: true,
      endAdornment: <span data-testid="end">E</span>,
      onStepUpNumericClick,
      onStepDownNumericClick,
    });
    expect((container.firstElementChild as HTMLElement).classList.contains('vanguard-input-type-number-rounded')).toBe(
      true,
    );
    // the CTA replaces any endAdornment
    expect(screen.queryByTestId('end')).toBeNull();
    await user.click(await screen.findByTestId('button-step-up', {}, ICON_LOAD));
    await user.click(await screen.findByTestId('button-step-down', {}, ICON_LOAD));
    expect(onStepUpNumericClick).toHaveBeenCalledTimes(1);
    expect(onStepDownNumericClick).toHaveBeenCalledTimes(1);
  });

  test('roundedNumericCTAType step buttons without callbacks do not throw', async () => {
    const user = userEvent.setup();
    renderBase({ formFieldType: 'InputNumber', type: 'number', roundedNumericCTAType: true });
    await user.click(await screen.findByTestId('button-step-up', {}, ICON_LOAD));
    await user.click(await screen.findByTestId('button-step-down', {}, ICON_LOAD));
    expect(screen.getByTestId('button-step-up').getAttribute('role')).toBe('button');
  });
});

describe('InputBase: textFieldProps legacy keys reach the DOM', () => {
  test('InputProps.startAdornment / endAdornment / readOnly', () => {
    const { container } = renderBase({
      textFieldProps: {
        InputProps: {
          startAdornment: <span data-testid="tfp-start">S</span>,
          endAdornment: <span data-testid="tfp-end">E</span>,
          readOnly: true,
        },
      },
    });
    const input = getInput(container);
    expect(input.readOnly).toBe(true);
    expect(screen.getByTestId('tfp-start').nextElementSibling).toBe(input);
    expect(input.nextElementSibling).toBe(screen.getByTestId('tfp-end'));
  });

  test('InputProps.inputComponent replaces the native input and receives inputProps', () => {
    const Custom = LintCustom541;
    renderBase({
      textFieldProps: { InputProps: { inputComponent: Custom as any }, inputProps: { customFlag: 'yes' } as any },
    });
    expect(screen.getByTestId('custom-input').getAttribute('data-flag')).toBe('yes');
  });

  test('inputProps maxLength / inputMode / data-* / aria-* land on the input', () => {
    const { container } = renderBase({
      textFieldProps: {
        inputProps: { maxLength: 5, inputMode: 'numeric', 'data-qa': 'qa-id', 'aria-label': 'Custom name' } as any,
      },
    });
    const input = getInput(container);
    expect(input.getAttribute('maxlength')).toBe('5');
    expect(input.getAttribute('inputmode')).toBe('numeric');
    expect(input.getAttribute('data-qa')).toBe('qa-id');
    expect(screen.getByRole('textbox', { name: 'Custom name' })).toBe(input);
  });

  test('[bug-lock] inputProps.onScroll from the consumer is replaced by InputBase', () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR (suspected bug): InputBase always overwrites inputProps.onScroll.
    const onScroll = vi.fn();
    const { container } = renderBase({ highlightUrl: true, textFieldProps: { inputProps: { onScroll } } });
    const input = getInput(container);
    setScroll(input, 3);
    fireEvent.scroll(input);
    expect(onScroll).not.toHaveBeenCalled();
    // InputBase's own scroll sync ran instead
    expect(highlights(container).style.transform).toBe('translate(0px, -3px)');
  });

  test('InputLabelProps.shrink forces the floating label to shrink', () => {
    renderBase({ label: 'Name', textFieldProps: { InputLabelProps: { shrink: true } } });
    const label = document.getElementById('field-label') as HTMLElement;
    expect(label.getAttribute('data-shrink')).toBe('true');
  });

  test('[bug-lock] InputLabelProps from textFieldProps replaces InputBase label props (labelStyle and static shrink are lost)', () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR (suspected bug): `{...textFieldProps}` is spread after InputLabelProps={getLabelProps()}.
    renderBase({
      label: 'Name',
      labelType: 'static',
      labelStyle: { color: 'rgb(1, 2, 3)' },
      textFieldProps: { InputLabelProps: { 'data-qa': 'label-qa' } as any },
    });
    const label = document.getElementById('field-label') as HTMLElement;
    expect(label.getAttribute('data-qa')).toBe('label-qa');
    expect(label.style.color).toBe('');
    // MUI's own shrink logic is back in charge (empty, unfocused)
    expect(label.getAttribute('data-shrink')).toBe('false');
  });

  test('FormHelperTextProps reaches the helper <p>', () => {
    renderBase({ infoText: 'i', textFieldProps: { FormHelperTextProps: { 'data-qa': 'helper-qa' } as any } });
    expect(document.getElementById('field-helper-text')?.getAttribute('data-qa')).toBe('helper-qa');
  });

  test('top-level TextField props (name, size) are forwarded', () => {
    const { container } = renderBase({ label: 'L', textFieldProps: { name: 'nm' } });
    expect(getInput(container).getAttribute('name')).toBe('nm');
  });

  // textFieldProps.size: geometry is asserted in _InputBaseMuiContract.stories.tsx (TextFieldSizeSmall);
  // jsdom does not resolve the MUI/Vanguard cascade reliably.

  test('[bug-lock] adornment props are merged into the caller-owned textFieldProps.InputProps object', () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR (suspected bug): InputBase MUTATES the textFieldProps object it was given.
    const textFieldProps: any = { InputProps: { readOnly: true } };
    renderBase({ adornment: <span>S</span>, endAdornment: <span>E</span>, textFieldProps });
    expect(textFieldProps.InputProps.readOnly).toBe(true);
    expect(textFieldProps.InputProps.startAdornment).toBeTruthy();
    expect(textFieldProps.InputProps.endAdornment).toBeTruthy();
  });

  test('SelectProps.native renders a native <select> with the given options', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = renderBase({
      select: true,
      label: 'Native',
      textFieldProps: { SelectProps: { native: true }, defaultValue: 'b' },
      onChange,
      children: [
        <option key="a" value="a">
          A
        </option>,
        <option key="b" value="b">
          B
        </option>,
      ],
    });
    const select = container.querySelector('select') as HTMLSelectElement;
    expect(select).not.toBeNull();
    expect(screen.queryByRole('combobox', { name: /Native/ })?.tagName).toBe('SELECT');
    expect(select.value).toBe('b');
    await user.selectOptions(select, 'a');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].target.value).toBe('a');
  });

  test('[bug-lock] SelectProps.MenuProps reaches the menu, but replaces InputBase SelectProps entirely', async () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR (suspected bug): textFieldProps is spread after the internal SelectProps, so a
    // consumer SelectProps drops renderValue/onOpen/onClose, the paper height cap and the
    // OverlayStackingService registration (menu falls back to MUI's static modal z-index 1300).
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onClose = vi.fn();
    renderBase({
      select: true,
      label: 'Pick',
      value: 'a',
      selectRenderValue: (key: string) => `rendered:${key}`,
      textFieldProps: {
        SelectProps: { onOpen, onClose, MenuProps: { PaperProps: { 'data-testid': 'menu-paper' } as any } },
      },
      children: [
        <MenuItem key="a" value="a">
          A
        </MenuItem>,
      ],
    });
    const combo = screen.getByRole('combobox');
    // selectRenderValue is lost: MUI renders the MenuItem children
    expect(combo.textContent).toBe('A');
    await user.click(combo);
    const paper = await screen.findByTestId('menu-paper');
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(paper.style.maxHeight).toBe('');
    expect(getComputedStyle(paper.closest('.MuiMenu-root') as HTMLElement).zIndex).toBe('1300');
    expect(nextOverlayZ()).toBe(OVERLAY_BASE_Z_INDEX + 1);
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('textFieldProps overrides InputBase-owned TextField props (variant=filled drops the outlined notch)', () => {
    const outlined = renderBase({ id: 'o' });
    expect(outlined.container.querySelector('fieldset')).not.toBeNull();
    const filled = render(<InputBase id="f" textFieldProps={{ variant: 'filled' }} />);
    expect(filled.container.querySelector('fieldset')).toBeNull();
    // Vanguard SCSS targets `.MuiOutlinedInput-root`, so a filled field loses all Vanguard input styling
    expect(getInput(filled.container).closest('.MuiOutlinedInput-root')).toBeNull();
  });
});

/**
 * Precedence of the public `textFieldProps` escape hatch against what InputBase sets itself
 * (InputBase.tsx: adornment merge ~532-551, `{...textFieldProps}` spread + `inputProps` merge ~1020-1027).
 * MUI v5 TextField spreads `InputProps` over its own Input props and passes `inputProps` as one object, so
 * a v9 remap to `slotProps.input` / `slotProps.htmlInput` that changes any of these orders turns red here.
 */
describe('InputBase: textFieldProps precedence vs InputBase defaults', () => {
  describe('adornments', () => {
    test('vanguard adornment wins over textFieldProps.InputProps.startAdornment', () => {
      const { container } = renderBase({
        adornment: <span data-testid="vg-start">V</span>,
        textFieldProps: { InputProps: { startAdornment: <span data-testid="tfp-start">T</span> } },
      });
      expect(screen.queryByTestId('tfp-start')).toBeNull();
      expect(screen.getByTestId('vg-start').nextElementSibling).toBe(getInput(container));
    });

    test('vanguard endAdornment wins over textFieldProps.InputProps.endAdornment', () => {
      const { container } = renderBase({
        endAdornment: <span data-testid="vg-end">V</span>,
        textFieldProps: { InputProps: { endAdornment: <span data-testid="tfp-end">T</span> } },
      });
      expect(screen.queryByTestId('tfp-end')).toBeNull();
      expect(getInput(container).nextElementSibling).toBe(screen.getByTestId('vg-end'));
    });

    test('without vanguard adornments the textFieldProps adornments render; other InputProps keys are kept', () => {
      const { container } = renderBase({
        endAdornment: <span data-testid="vg-end">V</span>,
        textFieldProps: {
          InputProps: { startAdornment: <span data-testid="tfp-start">T</span>, readOnly: true },
        },
      });
      const input = getInput(container);
      expect(screen.getByTestId('tfp-start').nextElementSibling).toBe(input);
      expect(input.nextElementSibling).toBe(screen.getByTestId('vg-end'));
      expect(input.readOnly).toBe(true);
    });

    test('roundedNumericCTAType step buttons win over both endAdornment sources', async () => {
      renderBase({
        formFieldType: 'InputNumber',
        type: 'number',
        roundedNumericCTAType: true,
        endAdornment: <span data-testid="vg-end">V</span>,
        textFieldProps: { InputProps: { endAdornment: <span data-testid="tfp-end">T</span> } },
      });
      expect(await screen.findByTestId('button-step-up', {}, ICON_LOAD)).toBeTruthy();
      expect(screen.queryByTestId('vg-end')).toBeNull();
      expect(screen.queryByTestId('tfp-end')).toBeNull();
    });
  });

  describe('inputProps', () => {
    test('textFieldProps.inputProps keys land on the input AND InputBase keeps its scroll sync', () => {
      const { container } = renderBase({
        highlightUrl: true,
        textFieldProps: { inputProps: { 'data-qa': 'qa', inputMode: 'numeric', maxLength: 4 } as any },
      });
      const input = getInput(container);
      expect(input.getAttribute('data-qa')).toBe('qa');
      expect(input.getAttribute('inputmode')).toBe('numeric');
      expect(input.getAttribute('maxlength')).toBe('4');
      setScroll(input, 9);
      fireEvent.scroll(input);
      expect(highlights(container).style.transform).toBe('translate(0px, -9px)');
    });

    test('[v5-quirk] the vanguard maxLength prop feeds only the counter; only inputProps.maxLength limits the input', () => {
      // Baseline characterization: not a promised contract.
      // CURRENT BEHAVIOUR: InputBase never forwards its `maxLength` to the DOM.
      const vanguardOnly = renderBase({ id: 'a', counter: true, maxLength: 3 });
      expect(getInput(vanguardOnly.container).hasAttribute('maxlength')).toBe(false);
      expect(vanguardOnly.container.querySelector('.vanguard-input-counter')?.textContent).toBe('0/3');
      const both = render(<InputBase id="b" counter maxLength={3} textFieldProps={{ inputProps: { maxLength: 8 } }} />);
      expect(getInput(both.container).getAttribute('maxlength')).toBe('8');
      expect(both.container.querySelector('.vanguard-input-counter')?.textContent).toBe('0/3');
    });

    test('[bug-lock] textFieldProps.InputProps.inputProps replaces textFieldProps.inputProps and InputBase onScroll', () => {
      // Baseline characterization: not a promised contract.
      // CURRENT BEHAVIOUR (suspected bug): MUI TextField spreads InputProps after `inputProps={...}`, so the
      // nested object wins wholesale: the outer keys and InputBase's scroll sync are dropped.
      const onScroll = vi.fn();
      const { container } = renderBase({
        highlightUrl: true,
        textFieldProps: {
          inputProps: { 'data-outer': 'o' } as any,
          InputProps: { inputProps: { 'data-inner': 'i', onScroll } as any },
        },
      });
      const input = getInput(container);
      expect(input.getAttribute('data-inner')).toBe('i');
      expect(input.hasAttribute('data-outer')).toBe(false);
      setScroll(input, 6);
      fireEvent.scroll(input);
      expect(onScroll).toHaveBeenCalledTimes(1);
      expect(highlights(container).style.transform).not.toBe('translate(0px, -6px)');
    });

    test('InputProps.inputComponent receives textFieldProps.inputProps plus the InputBase onScroll handler', () => {
      const received: Record<string, unknown>[] = [];
      const Custom = CustomHarness794;
    const inputObserverValue = received;
      const { container } = render(<ReceivedInputContext.Provider value={inputObserverValue}><InputBase id="field" {...{
        highlightUrl: true,
        textFieldProps: { InputProps: { inputComponent: Custom as any }, inputProps: { customFlag: 'yes' } as any },
      }} /></ReceivedInputContext.Provider>);
      const last = received.at(-1) as Record<string, unknown>;
      expect(last.customFlag).toBe('yes');
      expect(typeof last.onScroll).toBe('function');
      const input = screen.getByTestId('custom-input');
      expect(getInput(container)).toBe(input);
      setScroll(input, 4);
      fireEvent.scroll(input);
      expect(highlights(container).style.transform).toBe('translate(0px, -4px)');
    });
  });

  describe('event handlers', () => {
    test('[bug-lock] textFieldProps.onChange replaces InputBase onChange: vanguard onChange, counter and formconfig dispatch are lost', async () => {
      // Baseline characterization: not a promised contract.
      // CURRENT BEHAVIOUR (suspected bug): `{...textFieldProps}` is spread after `onChange={onChangeFn}`.
      const user = userEvent.setup();
      const vanguardOnChange = vi.fn();
      const seen: string[] = [];
      const consumerOnChange = vi.fn((e: React.ChangeEvent<HTMLInputElement>) => seen.push(e.target.value));
      const formconfig = makeFormConfig();
      const { container } = renderBase({
        formconfig,
        formFieldType: 'Input',
        counter: true,
        onChange: vanguardOnChange,
        textFieldProps: { onChange: consumerOnChange },
      });
      await user.type(getInput(container), 'ab');
      expect(seen).toEqual(['a', 'ab']);
      expect(vanguardOnChange).not.toHaveBeenCalled();
      expect(formconfig.setStateValue).not.toHaveBeenCalled();
      expect(container.querySelector('.vanguard-input-counter')?.textContent).toBe('0');
    });

    test('[bug-lock] textFieldProps.InputProps.onChange replaces both the TextField and the vanguard onChange', async () => {
      // Baseline characterization: not a promised contract.
      const user = userEvent.setup();
      const vanguardOnChange = vi.fn();
      const tfpOnChange = vi.fn();
      const inputPropsOnChange = vi.fn();
      const { container } = renderBase({
        onChange: vanguardOnChange,
        textFieldProps: { onChange: tfpOnChange, InputProps: { onChange: inputPropsOnChange } },
      });
      await user.type(getInput(container), 'x');
      expect(inputPropsOnChange).toHaveBeenCalledTimes(1);
      expect(tfpOnChange).not.toHaveBeenCalled();
      expect(vanguardOnChange).not.toHaveBeenCalled();
    });

    test('textFieldProps.inputProps.onChange runs first, then the vanguard onChange, with the same event', async () => {
      const user = userEvent.setup();
      const order: string[] = [];
      const events: unknown[] = [];
      const inner = vi.fn((e: unknown) => {
        order.push('inputProps');
        events.push(e);
      });
      const outer = vi.fn((e: unknown) => {
        order.push('vanguard');
        events.push(e);
      });
      const { container } = renderBase({ onChange: outer, textFieldProps: { inputProps: { onChange: inner } } });
      await user.type(getInput(container), 'z');
      expect(order).toEqual(['inputProps', 'vanguard']);
      expect(events[0]).toBe(events[1]);
    });

    test('[bug-lock] textFieldProps.onFocus / onBlur replace the vanguard onFocus / onBlur', async () => {
      // Baseline characterization: not a promised contract.
      const user = userEvent.setup();
      const vg = { onFocus: vi.fn(), onBlur: vi.fn() };
      const tfp = { onFocus: vi.fn(), onBlur: vi.fn() };
      const { container } = renderBase({ ...vg, textFieldProps: tfp });
      await user.click(getInput(container));
      await user.tab();
      expect(tfp.onFocus).toHaveBeenCalledTimes(1);
      expect(tfp.onBlur).toHaveBeenCalledTimes(1);
      expect(tfp.onFocus.mock.calls[0][0].target).toBe(getInput(container));
      expect(vg.onFocus).not.toHaveBeenCalled();
      expect(vg.onBlur).not.toHaveBeenCalled();
    });

    test('[bug-lock] textFieldProps.onKeyDown replaces InputBase keydown: Enter and "e" are no longer blocked', () => {
      // Baseline characterization: not a promised contract.
      const vgKeyDown = vi.fn();
      const tfpKeyDown = vi.fn();
      const { container } = renderBase({
        formFieldType: 'InputNumber',
        type: 'number',
        onKeyDown: vgKeyDown,
        textFieldProps: { onKeyDown: tfpKeyDown },
      });
      const input = getInput(container);
      expect(fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })).toBe(true);
      expect(fireEvent.keyDown(input, { key: 'e' })).toBe(true);
      expect(tfpKeyDown).toHaveBeenCalledTimes(2);
      expect(tfpKeyDown.mock.calls[0][0].key).toBe('Enter');
      expect(vgKeyDown).not.toHaveBeenCalled();
    });

    test('without textFieldProps handlers InputBase keydown still blocks Enter and "e" (reference)', () => {
      const vgKeyDown = vi.fn();
      const { container } = renderBase({ formFieldType: 'InputNumber', type: 'number', onKeyDown: vgKeyDown });
      const input = getInput(container);
      expect(fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })).toBe(false);
      expect(fireEvent.keyDown(input, { key: 'e' })).toBe(false);
      expect(vgKeyDown).toHaveBeenCalledTimes(2);
    });
  });

  describe('refs', () => {
    test('[bug-lock] textFieldProps.inputRef takes the DOM node; inputRef prop and formconfig._inputRef stay empty', () => {
      // Baseline characterization: not a promised contract.
      // CURRENT BEHAVIOUR (suspected bug): `{...textFieldProps}` overrides `inputRef={inputRef}`.
      const consumerRef = createRef<HTMLInputElement>();
      const formconfig = makeFormConfig();
      const { container } = renderBase({ formconfig, textFieldProps: { inputRef: consumerRef } });
      expect(consumerRef.current).toBe(getInput(container));
      expect(formconfig._inputRef?.current).toBeNull();

      const vanguardRef = createRef<HTMLInputElement>() as MutableRefObject<HTMLInputElement | null>;
      const consumerRef2 = createRef<HTMLInputElement>();
      const second = render(<InputBase id="r2" inputRef={vanguardRef} textFieldProps={{ inputRef: consumerRef2 }} />);
      expect(consumerRef2.current).toBe(getInput(second.container));
      expect(vanguardRef.current).toBeNull();
    });

    test('[bug-lock] textFieldProps.InputProps.inputRef also takes the DOM node from the vanguard inputRef', () => {
      // Baseline characterization: not a promised contract.
      const consumerRef = createRef<HTMLInputElement>();
      const vanguardRef = createRef<HTMLInputElement>() as MutableRefObject<HTMLInputElement | null>;
      const { container } = renderBase({
        inputRef: vanguardRef,
        textFieldProps: { InputProps: { inputRef: consumerRef } },
      });
      expect(consumerRef.current).toBe(getInput(container));
      expect(vanguardRef.current).toBeNull();
    });

    test('textFieldProps.inputProps.ref is forked: both it and the vanguard inputRef get the DOM node', () => {
      const consumerRef = createRef<HTMLInputElement>();
      const vanguardRef = createRef<HTMLInputElement>() as MutableRefObject<HTMLInputElement | null>;
      const { container } = renderBase({ inputRef: vanguardRef, textFieldProps: { inputProps: { ref: consumerRef } } });
      expect(consumerRef.current).toBe(getInput(container));
      expect(vanguardRef.current).toBe(getInput(container));
    });
  });

  describe('label and select', () => {
    test('[bug-lock] textFieldProps.InputLabelProps.shrink=false un-shrinks a labelType=static label', () => {
      // Baseline characterization: not a promised contract.
      renderBase({ label: 'Name', labelType: 'static', textFieldProps: { InputLabelProps: { shrink: false } } });
      expect(document.getElementById('field-label')?.getAttribute('data-shrink')).toBe('false');
    });

    test('labelType=static without textFieldProps.InputLabelProps stays shrunk with labelStyle (reference)', () => {
      renderBase({ label: 'Name', labelType: 'static', labelStyle: { color: 'rgb(1, 2, 3)' } });
      const label = document.getElementById('field-label') as HTMLElement;
      expect(label.getAttribute('data-shrink')).toBe('true');
      expect(label.style.color).toBe('rgb(1, 2, 3)');
    });

    test('without textFieldProps.SelectProps the internal renderValue, height cap and stacking slot apply (reference)', async () => {
      const user = userEvent.setup();
      renderBase({
        select: true,
        value: 'a',
        selectRenderValue: (key: string) => `rendered:${key}`,
        children: [
          <MenuItem key="a" value="a">
            A
          </MenuItem>,
        ],
      });
      const combo = screen.getByRole('combobox');
      expect(combo.textContent).toBe('rendered:a');
      await user.click(combo);
      const paper = (await screen.findByRole('listbox')).closest('.MuiPaper-root') as HTMLElement;
      expect(paper.style.maxHeight).toBe('252px');
      expect(getComputedStyle(paper.closest('.MuiMenu-root') as HTMLElement).zIndex).toBe(
        String(OVERLAY_BASE_Z_INDEX + 1),
      );
    });
  });
});

describe('InputBase: select mode (MUI Select via TextField select)', () => {
  const children = [
    <MenuItem key="a" value="a">
      Alpha
    </MenuItem>,
    <MenuItem key="b" value="b">
      Beta
    </MenuItem>,
  ];

  test('renders a combobox labelled by the <label> and the display node', () => {
    renderBase({ select: true, label: 'Pick', children });
    const combo = screen.getByRole('combobox');
    expect(combo.getAttribute('aria-haspopup')).toBe('listbox');
    expect(combo.getAttribute('aria-expanded')).toBe('false');
    expect(combo.getAttribute('aria-labelledby')).toBe('field-label field');
    expect(document.getElementById('field-label')?.tagName).toBe('LABEL');
    // `.MuiSelect-select` is styled by InputBase.scss
    expect(combo.classList.contains('MuiSelect-select')).toBe(true);
  });

  test('opening the menu registers a popover slot and applies its z-index; closing releases it', async () => {
    const user = userEvent.setup();
    const hostZ = OverlayStackingService.register('host-modal', 'modal');
    renderBase({ select: true, label: 'Pick', children });
    const combo = screen.getByRole('combobox');

    await user.click(combo);
    const listbox = await screen.findByRole('listbox');
    expect(combo.getAttribute('aria-expanded')).toBe('true');
    // menu portals to body
    expect(listbox.closest('.MuiMenu-root')?.parentElement).toBe(document.body);
    // `.MuiMenu-root` is targeted by src/app-loaders/load-component/root-components.scss:64
    const menuRoot = listbox.closest('.MuiMenu-root') as HTMLElement;
    expect(Number(getComputedStyle(menuRoot).zIndex)).toBe(hostZ + 1);
    // the slot is held while open
    expect(nextOverlayZ()).toBe(hostZ + 2);

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect(nextOverlayZ()).toBe(hostZ + 1);
  });

  test('while the menu is open the page content is hidden from assistive tech', async () => {
    const user = userEvent.setup();
    const { container } = renderBase({ select: true, label: 'Pick', children });
    expect(container.getAttribute('aria-hidden')).toBeNull();
    await user.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    // MUI ModalManager sets aria-hidden on the portal's siblings
    expect(container.getAttribute('aria-hidden')).toBe('true');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(container.getAttribute('aria-hidden')).toBeNull());
  });

  test('menu paper caps its height at menuItemHeight * maxMenuItemsUntilScroll', async () => {
    const user = userEvent.setup();
    renderBase({ select: true, children, menuItemHeight: 40, maxMenuItemsUntilScroll: 3 });
    await user.click(screen.getByRole('combobox'));
    const listbox = await screen.findByRole('listbox');
    const paper = listbox.closest('.MuiPaper-root') as HTMLElement;
    expect(paper.style.maxHeight).toBe('120px');
  });

  test('default menu paper height cap is 36 * 7 = 252px', async () => {
    const user = userEvent.setup();
    renderBase({ select: true, children });
    await user.click(screen.getByRole('combobox'));
    const paper = (await screen.findByRole('listbox')).closest('.MuiPaper-root') as HTMLElement;
    expect(paper.style.maxHeight).toBe('252px');
  });

  test('unmounting with the menu open releases the stacking slot', async () => {
    const user = userEvent.setup();
    const { unmount } = renderBase({ select: true, children });
    await user.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    expect(nextOverlayZ()).toBe(OVERLAY_BASE_Z_INDEX + 2);
    unmount();
    expect(nextOverlayZ()).toBe(OVERLAY_BASE_Z_INDEX + 1);
  });

  test('keyboard: ArrowDown opens, arrows move, Enter selects and closes with a change event', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderBase({ select: true, children, onChange, valueAsDefaultValue: true, value: '' });
    const combo = screen.getByRole('combobox');
    combo.focus();
    await user.keyboard('{ArrowDown}');
    const listbox = await screen.findByRole('listbox');
    const options = within(listbox).getAllByRole('option');
    expect(options).toHaveLength(2);
    await waitFor(() => expect(document.activeElement).toBe(options[0]));
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(options[1]);
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].target.value).toBe('b');
    expect(combo.textContent).toBe('Beta');
    // focus returns to the combobox
    expect(document.activeElement).toBe(combo);
  });

  test('selectRenderValue renders the selected value', () => {
    renderBase({
      select: true,
      children,
      value: 'a',
      selectRenderValue: (key: string) => `rendered:${key}`,
    });
    expect(screen.getByRole('combobox').textContent).toBe('rendered:a');
  });

  test('[bug-lock] selectDisplayEmpty is accepted but not forwarded: an empty value skips selectRenderValue', () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR (suspected bug): InputBase destructures `selectDisplayEmpty` but never passes
    // `displayEmpty` to MUI Select, so the placeholder renderer is not called for ''.
    const selectRenderValue = vi.fn(() => 'placeholder');
    renderBase({ select: true, children, value: '', selectDisplayEmpty: true, selectRenderValue });
    expect(screen.getByRole('combobox').textContent).toBe('\u200B');
    expect(selectRenderValue).not.toHaveBeenCalled();
  });
});

describe('InputBase: loading, theme and popover', () => {
  test('isLoading on a Textarea renders min(minRows,maxRows)+1 skeleton lines', () => {
    const { container } = renderBase({ isLoading: true, formFieldType: 'Textarea', multiline: true, minRows: 2 });
    const root = container.firstElementChild as HTMLElement;
    expect(root.classList.contains('vanguard-input-loading')).toBe(true);
    expect(container.querySelector('.vanguard-input-skeleton')?.children).toHaveLength(3);
  });

  test.each(['Input', 'InputBase', 'InputNumber', 'Autocomplete'] as const)(
    'isLoading on %s renders a single skeleton',
    (formFieldType) => {
      const { container } = renderBase({ isLoading: true, formFieldType });
      expect(container.querySelector('.vanguard-input-skeleton')?.children).toHaveLength(1);
    },
  );

  test('isLoading on Select renders no skeleton', () => {
    const { container } = renderBase({ isLoading: true, formFieldType: 'Select' });
    expect(container.querySelector('.vanguard-input-skeleton')).toBeNull();
  });

  test('theme=grey and ColorPicker add their wrapper classes', () => {
    const { container } = renderBase({ theme: 'grey', formFieldType: 'ColorPicker' });
    const root = container.firstElementChild as HTMLElement;
    expect(root.classList.contains('vanguard-input-grey')).toBe(true);
    expect(root.classList.contains('vanguard-input-type-colorpicker')).toBe(true);
  });

  test('popoverMessage wraps the field in a tooltip shown on hover', async () => {
    const user = userEvent.setup();
    const { container } = renderBase({ popoverMessage: 'Tip text' });
    await user.hover(container.firstElementChild as HTMLElement);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip.textContent).toContain('Tip text');
  });
});

describe('InputBase: highlight backdrop', () => {
  const backdrop = (container: HTMLElement) => container.querySelector('.vanguard-input-highlights') as HTMLElement;

  test('highlightWords marks words green and reports each found word', async () => {
    const user = userEvent.setup();
    const onHighlightWordFound = vi.fn();
    const { container } = renderBase({ highlightWords: ['good'], onHighlightWordFound });
    await user.type(getInput(container), 'a good day');
    expect(backdrop(container).querySelector('.vanguard-input-mark-green')?.textContent).toBe('good');
    expect(onHighlightWordFound).toHaveBeenCalledWith('good', undefined);
  });

  test('prohibitedWords marks words red and reports with the formconfig', async () => {
    const user = userEvent.setup();
    const onProhibitedWordFound = vi.fn();
    const { container } = renderBase({ prohibitedWords: ['bad'], onProhibitedWordFound });
    await user.type(getInput(container), 'so bad');
    expect(backdrop(container).querySelector('.vanguard-input-mark-red')?.textContent).toBe('bad');
    expect(onProhibitedWordFound).toHaveBeenCalledWith('bad', undefined);
  });

  test.each([
    ['negative', 'vanguard-input-mark-red'],
    ['positive', 'vanguard-input-mark-green'],
    ['info', 'vanguard-input-mark-blue'],
  ] as const)('highlightUrl type=%s marks a URL with %s', async (highlightUrlType, cls) => {
    const { container } = renderBase({ highlightUrl: true, highlightUrlType, value: 'see https://example.com now' });
    await waitFor(() => expect(backdrop(container).querySelector(`.${cls}`)?.textContent).toBe('https://example.com'));
  });

  test('highlightLengthExceeded marks the overflow beyond maxLength', async () => {
    const user = userEvent.setup();
    const { container } = renderBase({ highlightLengthExceeded: true, maxLength: 3 });
    await user.type(getInput(container), 'abcdef');
    expect(backdrop(container).querySelector('.vanguard-input-mark-red')?.textContent).toBe('def');
  });

  test('user markup is escaped in the backdrop', () => {
    const { container } = renderBase({ highlightWords: ['x'], multiline: true, allowBreakLines: true });
    fireEvent.change(getInput(container), { target: { value: '<b>x</b>\nline' } });
    expect(backdrop(container).querySelector('b')).toBeNull();
    expect(backdrop(container).textContent).toBe('<b>x</b>\nline');
  });

  test('without allowBreakLines line breaks are flattened in the backdrop', () => {
    const { container } = renderBase({ highlightWords: ['x'], multiline: true });
    fireEvent.change(getInput(container), { target: { value: 'a\nb' } });
    expect(backdrop(container).textContent).toBe('a b');
  });

  test('without any highlight option the backdrop stays empty', async () => {
    const user = userEvent.setup();
    const { container } = renderBase();
    await user.type(getInput(container), 'https://example.com');
    expect(backdrop(container).innerHTML).toBe('');
  });
});

describe('InputBase: formconfig wiring', () => {
  test('sets formconfig.fieldType from formFieldType', () => {
    const formconfig = makeFormConfig();
    renderBase({ formconfig, formFieldType: 'Input' });
    expect(formconfig.fieldType).toBe('Input');
  });

  test('validation.required overrides the required prop in both directions', () => {
    const { container, rerender } = renderBase({
      required: true,
      formconfig: makeFormConfig({ validation: { required: false } }),
    });
    expect(getInput(container).required).toBe(false);
    rerender(<InputBase id="field" formconfig={makeFormConfig({ validation: { required: true } })} />);
    expect(getInput(container).required).toBe(true);
  });

  test('stateValue is written into the DOM input and optionally echoed through onChange', () => {
    const onChange = vi.fn();
    const formconfig = makeFormConfig({ stateValue: 'from-state' });
    const { container } = renderBase({ formconfig, triggerChangeOnStateFieldChange: true, onChange, counter: true });
    expect(getInput(container).value).toBe('from-state');
    expect(onChange).toHaveBeenCalledWith({ target: { value: 'from-state' } });
    expect(container.querySelector('.vanguard-input-counter')?.textContent).toBe('10');
  });

  test('Autocomplete fieldType does not write stateValue into the input', () => {
    const formconfig = makeFormConfig({ stateValue: 'from-state' });
    const { container } = renderBase({ formconfig, formFieldType: 'Autocomplete' });
    expect(getInput(container).value).toBe('');
  });

  test('formconfig.hasError drives the error state on every render', () => {
    const formconfig = makeFormConfig({ hasError: false, errors: ['Bad'] as any, setHasError: vi.fn() });
    const { container, rerender } = renderBase({ formconfig });
    expect(getInput(container).getAttribute('aria-invalid')).toBe('false');
    formconfig.hasError = true;
    rerender(<InputBase id="field" formconfig={formconfig} />);
    expect(getInput(container).getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByTestId('vanguard-input-error-text').textContent).toBe('Bad');
  });

  test.each(['InputBase', 'Input'] as const)('%s typing dispatches setStateValue and calls _onChange', async (ft) => {
    const user = userEvent.setup();
    const _onChange = vi.fn();
    const formconfig = makeFormConfig({ _onChange });
    const { container } = renderBase({ formconfig, formFieldType: ft });
    await user.type(getInput(container), 'hi');
    expect(formconfig.setStateValue).toHaveBeenLastCalledWith('hi');
    expect(_onChange).toHaveBeenCalledTimes(2);
  });

  test('valueMappers.toObject maps the value before dispatch', async () => {
    const user = userEvent.setup();
    const formconfig = makeFormConfig({
      valueMappers: { toPrimitive: (v: any) => v, toObject: (v: any) => ({ wrapped: v }) },
    });
    const { container } = renderBase({ formconfig, formFieldType: 'Input' });
    await user.type(getInput(container), 'z');
    expect(formconfig.setStateValue).toHaveBeenLastCalledWith({ wrapped: 'z' });
  });

  test('arrayPosition dispatches setStateValueArray with {el, idx}', async () => {
    const user = userEvent.setup();
    const setStateValueArray = vi.fn((payload: unknown) => ({ type: 'mui-contract/noop', payload }));
    const formconfig = makeFormConfig({ arrayPosition: 2, setStateValueArray });
    const { container } = renderBase({ formconfig, formFieldType: 'Input' });
    await user.type(getInput(container), 'q');
    expect(setStateValueArray).toHaveBeenLastCalledWith({ el: 'q', idx: 2 });
    expect(formconfig.setStateValue).not.toHaveBeenCalled();
  });

  test('InputNumber dispatches parseInt of the value', () => {
    const formconfig = makeFormConfig();
    const { container } = renderBase({ formconfig, formFieldType: 'InputNumber', type: 'number' });
    fireEvent.change(getInput(container), { target: { value: '12' } });
    expect(formconfig.setStateValue).toHaveBeenLastCalledWith(12);
  });

  test('ColorPicker dispatches only valid hex colors', () => {
    const formconfig = makeFormConfig();
    const { container } = renderBase({ formconfig, formFieldType: 'ColorPicker' });
    fireEvent.change(getInput(container), { target: { value: '#zz' } });
    expect(formconfig.setStateValue).not.toHaveBeenCalled();
    fireEvent.change(getInput(container), { target: { value: '#ff0000' } });
    expect(formconfig.setStateValue).toHaveBeenLastCalledWith('#ff0000');
  });

  test('Textarea dispatch flattens line breaks unless allowBreakLines', () => {
    const formconfig = makeFormConfig();
    const { container, rerender } = renderBase({ formconfig, formFieldType: 'Textarea', multiline: true });
    fireEvent.change(getInput(container), { target: { value: 'a\nb' } });
    expect(formconfig.setStateValue).toHaveBeenLastCalledWith('a b');
    rerender(
      <InputBase id="field" formconfig={formconfig} formFieldType="Textarea" multiline={true} allowBreakLines />,
    );
    fireEvent.change(getInput(container), { target: { value: 'c\nd' } });
    expect(formconfig.setStateValue).toHaveBeenLastCalledWith('c\nd');
  });

  test('Textarea with mapper and arrayPosition dispatches setStateValueArray', () => {
    const setStateValueArray = vi.fn((payload: unknown) => ({ type: 'mui-contract/noop', payload }));
    const formconfig = makeFormConfig({
      arrayPosition: 0,
      setStateValueArray,
      valueMappers: { toPrimitive: (v: any) => v, toObject: (v: any) => ({ t: v }) },
    });
    const { container } = renderBase({ formconfig, formFieldType: 'Textarea', multiline: true });
    fireEvent.change(getInput(container), { target: { value: 'x' } });
    expect(setStateValueArray).toHaveBeenLastCalledWith({ el: { t: 'x' }, idx: 0 });
  });

  test('Select dispatches the chosen value and syncs the hidden native input eagerly', async () => {
    const user = userEvent.setup();
    const formconfig = makeFormConfig();
    renderBase({
      formconfig,
      formFieldType: 'Select',
      select: true,
      children: [
        <MenuItem key="a" value="a">
          Alpha
        </MenuItem>,
      ],
    });
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Alpha' }));
    expect(formconfig.setStateValue).toHaveBeenLastCalledWith('a');
    // MUI SelectInput exposes an imperative handle `{ focus, node, value }` through inputRef, not the
    // element; InputBase writes `.value` on that handle. `node` is the hidden native input.
    const handle = formconfig._inputRef?.current as { node: HTMLInputElement; value: string; focus: () => void };
    expect(typeof handle.focus).toBe('function');
    expect(handle.node.getAttribute('aria-hidden')).toBe('true');
    expect(handle.node.tagName).toBe('INPUT');
    expect(handle.value).toBe('a');
  });

  test('Select with mapper and arrayPosition dispatches setStateValueArray', async () => {
    const user = userEvent.setup();
    const setStateValueArray = vi.fn((payload: unknown) => ({ type: 'mui-contract/noop', payload }));
    const formconfig = makeFormConfig({
      arrayPosition: 1,
      setStateValueArray,
      valueMappers: { toPrimitive: (v: any) => v, toObject: (v: any) => ({ s: v }) },
    });
    renderBase({
      formconfig,
      formFieldType: 'Select',
      select: true,
      children: [
        <MenuItem key="a" value="a">
          Alpha
        </MenuItem>,
      ],
    });
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Alpha' }));
    expect(setStateValueArray).toHaveBeenLastCalledWith({ el: { s: 'a' }, idx: 1 });
  });

  test('formconfig without setStateValue still calls _onChange', () => {
    const _onChange = vi.fn();
    const formconfig = makeFormConfig({ setStateValue: undefined, _onChange });
    const { container } = renderBase({ formconfig });
    fireEvent.change(getInput(container), { target: { value: 'k' } });
    expect(_onChange).toHaveBeenCalledTimes(1);
  });
});
