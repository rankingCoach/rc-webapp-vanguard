/**
 * MUI upgrade contract (S0): FlagAdornment = MUI InputAdornment(position=start) + flag image.
 * `.MuiInputAdornment-root/-positionStart` are styled by InputBase.scss, so the class is queried on purpose.
 */
import { OutlinedInput } from '@mui/material';
import React from 'react';
import { describe, expect, test } from 'vitest';

import { render, screen, waitFor } from '../../../test-utils/test-utils';
import { FlagAdornment } from './FlagAdornment';

describe('FlagAdornment', () => {
  test('renders a start-positioned MUI InputAdornment with a 32x24 flag image', () => {
    const { container } = render(<FlagAdornment countryCode="de" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe('DIV');
    expect(root.classList.contains('MuiInputAdornment-root')).toBe(true);
    expect(root.classList.contains('MuiInputAdornment-positionStart')).toBe(true);
    // MUI start adornments render a zero-width notranslate span before the children
    expect(root.firstElementChild?.classList.contains('notranslate')).toBe(true);
    const img = screen.getByRole('img', { name: 'de flag' }) as HTMLImageElement;
    expect(img.width).toBe(32);
    expect(img.height).toBe(24);
  });

  test('resolves the bundled flag asset for the country code', async () => {
    render(<FlagAdornment countryCode="de" />);
    const img = screen.getByRole('img', { name: 'de flag' });
    await waitFor(() => expect(img.getAttribute('src') ?? '').toMatch(/flags\/de\.png$/));
  });

  test('inside an OutlinedInput it renders before the input', () => {
    const { container } = render(<OutlinedInput startAdornment={<FlagAdornment countryCode="us" />} />);
    const root = container.querySelector('.MuiOutlinedInput-root') as HTMLElement;
    const input = container.querySelector('input') as HTMLInputElement;
    const adornment = root.firstElementChild as HTMLElement;
    expect(adornment.classList.contains('MuiInputAdornment-positionStart')).toBe(true);
    expect(adornment.nextElementSibling).toBe(input);
    expect(screen.getByRole('img', { name: 'us flag' })).toBeTruthy();
  });

  test('unknown country renders an image without src', async () => {
    const { container } = render(<FlagAdornment countryCode="zz-none" />);
    await new Promise((resolve) => setTimeout(resolve, 0));
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.alt).toBe('zz-none flag');
    expect(img.getAttribute('src')).toBeNull();
  });
});
