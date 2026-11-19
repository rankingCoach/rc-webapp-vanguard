/**
 * MUI upgrade contract (S0): Input = ComponentContainer + InputBase (MUI TextField).
 * Public `textFieldProps` (typed as MUI TextFieldProps) is forwarded verbatim to TextField.
 */
import userEvent from '@testing-library/user-event';
import React, { createRef, MutableRefObject } from 'react';
import { describe, expect, test, vi } from 'vitest';

import { render, screen } from '../../../test-utils/test-utils';
import { Input } from './Input';

const getInput = (container: HTMLElement) => container.querySelector('input') as HTMLInputElement;

describe('Input', () => {
  test('renders a labelled text input; className goes to the container, inputClassName to InputBase', () => {
    const { container } = render(
      <Input id="in" label="Email" className="outer" inputClassName="inner" testId="in-tid" />,
    );
    const outer = container.firstElementChild as HTMLElement;
    expect(outer.className).toBe('outer');
    const inner = outer.firstElementChild as HTMLElement;
    expect(inner.classList.contains('vanguard-input')).toBe(true);
    expect(inner.classList.contains('inner')).toBe(true);
    expect(inner.classList.contains('outer')).toBe(false);
    expect(screen.getByLabelText(/Email/)).toBe(getInput(container));
    // testId lands on the MUI TextField root (wraps label + input), not on the container
    const tidEl = screen.getByTestId('in-tid');
    // the MUI TextField root: wraps the label, the input and the helper text
    expect(tidEl.tagName).toBe('DIV');
    expect(tidEl.querySelector('input, textarea')).not.toBeNull();
    expect(tidEl.parentElement?.classList.contains('vanguard-input')).toBe(true);
    expect(tidEl.querySelector('label')).not.toBeNull();
  });

  test('default type is "text"', () => {
    const { container } = render(<Input />);
    expect(getInput(container).type).toBe('text');
  });

  test.each(['email', 'password', 'date'] as const)('type=%s is forwarded to the native input', (type) => {
    const { container } = render(<Input type={type} />);
    expect(getInput(container).getAttribute('type')).toBe(type);
  });

  test('type=number makes InputBase treat the field as InputNumber (blocks "e")', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<Input type="number" onChange={onChange} />);
    const input = getInput(container);
    expect(input.type).toBe('number');
    await user.type(input, 'e1');
    expect(input.value).toBe('1');
  });

  test('never renders a textarea', () => {
    const { container } = render(<Input />);
    expect(container.querySelector('textarea')).toBeNull();
  });

  test('controlled value + onChange event shape', async () => {
    const user = userEvent.setup();
    const seen: string[] = [];
    const onChange = vi.fn((e: React.ChangeEvent<HTMLInputElement>) => seen.push(e.target.value));
    const { container } = render(<Input value="" onChange={onChange} />);
    await user.type(getInput(container), 'x');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(seen).toEqual(['x']);
    // controlled: stays at prop value
    expect(getInput(container).value).toBe('');
  });

  test('disabled / required / placeholder are forwarded', () => {
    const { container } = render(<Input disabled required placeholder="Type" label="L" />);
    const input = getInput(container);
    expect(input.disabled).toBe(true);
    expect(input.required).toBe(true);
    expect(input.placeholder).toBe('Type');
  });

  test('inputRef receives the native input', () => {
    const inputRef = createRef<HTMLInputElement>() as MutableRefObject<HTMLInputElement | null>;
    const { container } = render(<Input inputRef={inputRef} />);
    expect(inputRef.current).toBe(getInput(container));
  });

  test('textFieldProps.InputProps.readOnly and inputProps reach the DOM', () => {
    const { container } = render(
      <Input
        textFieldProps={{
          InputProps: { readOnly: true, endAdornment: <span data-testid="tfp-end">E</span> },
          inputProps: { maxLength: 3, inputMode: 'numeric', 'data-qa': 'q' } as any,
          InputLabelProps: { shrink: true },
        }}
        label="L"
        id="in"
      />,
    );
    const input = getInput(container);
    expect(input.readOnly).toBe(true);
    expect(input.maxLength).toBe(3);
    expect(input.getAttribute('inputmode')).toBe('numeric');
    expect(input.getAttribute('data-qa')).toBe('q');
    expect(input.nextElementSibling).toBe(screen.getByTestId('tfp-end'));
    expect(document.getElementById('in-label')?.getAttribute('data-shrink')).toBe('true');
  });

  test('[v5-quirk] size prop is accepted but not forwarded to MUI: small renders exactly like medium', () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR: `size` is typed on Input ("@todo implement") but InputBase ignores it.
    const medium = render(<Input id="m" label="L" />);
    const small = render(<Input id="s" label="L" size="small" />);
    // same element tree with the same classes (MUI size styling would add size classes + other emotion css)
    const shape = (c: HTMLElement) =>
      Array.from(c.querySelectorAll('*'))
        .map((el) => `${el.tagName}.${el.getAttribute('class') ?? ''}`)
        .join('|');
    expect(shape(small.container)).toBe(shape(medium.container));
  });

  test('isLoading renders one skeleton and adds the loading class', () => {
    const { container } = render(<Input isLoading={true} />);
    const base = container.querySelector('.vanguard-input') as HTMLElement;
    expect(base.classList.contains('vanguard-input-loading')).toBe(true);
    expect(container.querySelector('.vanguard-input-skeleton')?.children).toHaveLength(1);
  });

  test('adornment and endAdornment render on both sides of the input', () => {
    const { container } = render(
      <Input adornment={<span data-testid="s">S</span>} endAdornment={<span data-testid="e">E</span>} />,
    );
    const input = getInput(container);
    expect(screen.getByTestId('s').nextElementSibling).toBe(input);
    expect(input.nextElementSibling).toBe(screen.getByTestId('e'));
  });
});
