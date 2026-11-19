/**
 * MUI upgrade contract (S0): Textarea = InputBase(multiline) -> MUI TextField multiline ->
 * TextareaAutosize. (`.MuiInputBase-inputMultiline` is NOT asserted: the composed class is removed in v9
 * and its InputBase.scss rule is empty; the observable textarea + rows/height contract is asserted instead.)
 */
import userEvent from '@testing-library/user-event';
import React, { createRef, MutableRefObject } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { fireEvent, render, screen } from '../../../test-utils/test-utils';
import { getRowsBasedOnContent, Textarea } from './Textarea';

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => vi.stubGlobal('ResizeObserver', ResizeObserverStub));
afterEach(() => vi.unstubAllGlobals());

const visibleTextarea = (container: HTMLElement) =>
  container.querySelector('textarea:not([aria-hidden])') as HTMLTextAreaElement;

describe('Textarea', () => {
  test('renders a labelled autosizing textarea plus the hidden MUI shadow textarea', () => {
    const { container } = render(<Textarea id="ta" label="Bio" />);
    const ta = screen.getByLabelText(/Bio/) as HTMLTextAreaElement;
    expect(ta.tagName).toBe('TEXTAREA');
    expect(ta).toBe(visibleTextarea(container));
    const shadow = container.querySelector('textarea[aria-hidden="true"]') as HTMLTextAreaElement;
    expect(shadow.readOnly).toBe(true);
    expect(shadow.tabIndex).toBe(-1);
  });

  test('container takes className and 100% width; testId goes to the MUI root', () => {
    const { container } = render(<Textarea className="ta-outer" testId="ta-tid" />);
    const outer = container.firstElementChild as HTMLElement;
    expect(outer.className).toBe('ta-outer');
    expect(outer.style.width).toBe('100%');
    const tidEl = screen.getByTestId('ta-tid');
    // the MUI TextField root: wraps the label, the input and the helper text
    expect(tidEl.tagName).toBe('DIV');
    expect(tidEl.querySelector('input, textarea')).not.toBeNull();
    expect(tidEl.parentElement?.classList.contains('vanguard-input')).toBe(true);
  });

  test('defaults: static (shrunk) label and a visible counter', () => {
    const { container } = render(<Textarea id="ta" label="Bio" maxLength={20} />);
    expect(document.getElementById('ta-label')?.getAttribute('data-shrink')).toBe('true');
    expect(container.querySelector('.vanguard-input-counter')?.textContent).toBe('0/20');
  });

  test('counter=false hides the counter; labelType=floating un-shrinks the empty label', () => {
    const { container } = render(<Textarea id="ta" label="Bio" counter={false} labelType="floating" />);
    expect(container.querySelector('.vanguard-input-counter')).toBeNull();
    expect(document.getElementById('ta-label')?.getAttribute('data-shrink')).toBe('false');
  });

  test('Enter is prevented by default (no line breaks) and allowed with allowBreakLines', () => {
    const { container, rerender } = render(<Textarea />);
    expect(fireEvent.keyDown(visibleTextarea(container), { key: 'Enter', code: 'Enter' })).toBe(false);
    rerender(<Textarea allowBreakLines />);
    expect(fireEvent.keyDown(visibleTextarea(container), { key: 'Enter', code: 'Enter' })).toBe(true);
  });

  test('highlights URLs (red) and length overflow by default', async () => {
    const user = userEvent.setup();
    const { container } = render(<Textarea maxLength={5} />);
    await user.type(visibleTextarea(container), 'www.a.de');
    const marks = container.querySelectorAll('.vanguard-input-highlights .vanguard-input-mark-red');
    expect(marks.length).toBeGreaterThan(0);
  });

  test('controlled value + onChange event with target.value', () => {
    const seen: string[] = [];
    const onChange = vi.fn((e: React.ChangeEvent<HTMLTextAreaElement>) => seen.push(e.target.value));
    const { container } = render(<Textarea value="abc" onChange={onChange} />);
    expect(visibleTextarea(container).value).toBe('abc');
    fireEvent.change(visibleTextarea(container), { target: { value: 'abcd' } });
    expect(seen).toEqual(['abcd']);
  });

  test('disabled / required / placeholder reach the textarea', () => {
    const { container } = render(<Textarea disabled required placeholder="Write" />);
    const ta = visibleTextarea(container);
    expect(ta.disabled).toBe(true);
    expect(ta.required).toBe(true);
    expect(ta.placeholder).toBe('Write');
  });

  test('inputRef receives the visible textarea', () => {
    const inputRef = createRef<HTMLTextAreaElement>() as MutableRefObject<HTMLTextAreaElement | null>;
    const { container } = render(<Textarea inputRef={inputRef} />);
    expect(inputRef.current).toBe(visibleTextarea(container));
  });

  test('[v5-quirk] minRows/maxRows drive TextareaAutosize; no rows attribute is rendered', () => {
    // Baseline characterization: not a promised contract.
    // MUI InputBase spreads `rows: undefined` after TextareaAutosize's `rows={minRows}`, so the attribute is
    // absent and the height comes from autosize (measured in the browser contract story).
    const { container } = render(<Textarea minRows={4} maxRows={8} />);
    expect(visibleTextarea(container).getAttribute('rows')).toBeNull();
  });

  test('isLoading renders min(minRows,maxRows)+1 skeleton lines', () => {
    const { container } = render(<Textarea isLoading minRows={2} maxRows={5} />);
    expect(container.querySelector('.vanguard-input-skeleton')?.children).toHaveLength(3);
  });

  test('adornment is rendered as MUI startAdornment', () => {
    const { container } = render(<Textarea adornment={<span data-testid="ta-start">S</span>} />);
    const root = container.querySelector('.MuiOutlinedInput-root') as HTMLElement;
    expect(root.firstElementChild).toBe(screen.getByTestId('ta-start'));
    expect(screen.getByTestId('ta-start').nextElementSibling).toBe(visibleTextarea(container));
  });

  test('[v5-quirk] getRowsBasedOnContent is an exported no-op', () => {
    // Baseline characterization: not a promised contract.
    expect(getRowsBasedOnContent('a\nb', 1, 3)).toBeUndefined();
  });
});
