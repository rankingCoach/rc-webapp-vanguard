/**
 * MUI upgrade contract tests for <DateRangePickerBaseInputAdornment> (wraps MUI <InputAdornment position="end">).
 */
import '@testing-library/jest-dom/vitest';

import userEvent from '@testing-library/user-event';
import { Input } from '@vanguard/Input/Input';
import React from 'react';
import { describe, expect, test, vi } from 'vitest';

import { render, waitFor } from '../../../../../test-utils/test-utils';
import { DateRangePickerBaseInputAdornment } from './DateRangePickerBaseInputAdornment';

const getIcon = async (container: HTMLElement) => {
  await waitFor(() => expect(container.querySelector('svg')).not.toBeNull());
  return container.querySelector('svg') as SVGElement;
};

describe('DateRangePickerBaseInputAdornment contract', () => {
  test('renders a single 18px calendar icon', async () => {
    const { container } = render(<DateRangePickerBaseInputAdornment />);

    const icon = await getIcon(container);
    expect(container.querySelectorAll('svg')).toHaveLength(1);
    expect(icon).toHaveAttribute('width', '18');
    expect(icon).toHaveAttribute('height', '18');
  });

  test('root keeps the Vanguard inline layout (margins, 48px height, 3px padding)', () => {
    const { container } = render(<DateRangePickerBaseInputAdornment />);

    const root = container.firstElementChild as HTMLElement;
    expect(root.style.marginLeft).toBe('0px');
    expect(root.style.marginRight).toBe('16px');
    expect(root.style.height).toBe('48px');
    expect(root.style.padding).toBe('3px');
  });

  test('click on the icon calls onClick once without arguments', async () => {
    const onClick = vi.fn();
    const { container } = render(<DateRangePickerBaseInputAdornment onClick={onClick} />);

    await userEvent.click(await getIcon(container));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith();
  });

  test('click without onClick does not throw', async () => {
    const { container } = render(<DateRangePickerBaseInputAdornment />);
    await userEvent.click(await getIcon(container));
  });

  test('used as Input endAdornment it renders inside the field, after the input', async () => {
    const onClick = vi.fn();
    const { container } = render(<Input endAdornment={<DateRangePickerBaseInputAdornment onClick={onClick} />} />);

    const input = container.querySelector('input') as HTMLInputElement;
    const icon = await getIcon(input.parentElement as HTMLElement);
    expect(input.compareDocumentPosition(icon) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    await userEvent.click(icon);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
