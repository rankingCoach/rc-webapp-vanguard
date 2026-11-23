import '@testing-library/jest-dom/vitest';

import { cleanupOverlaySpec } from '@test-utils/cleanup-overlay-spec';
import { render } from '@test-utils/test-utils';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';

import { SearchableSelect } from './SearchableSelect';

const upAsset = vi.hoisted(() => {
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { requests: 0, held, release };
});

vi.mock('../../custom-hooks/use-dynamic-import/assets/icons/Icon-caret-up.svg?url', async (importOriginal) => {
  upAsset.requests++;
  await upAsset.held;
  return importOriginal();
});

const DOWN = 'M3 6.70829L8 11.7083L13 6.70829L11.5833 5.29163L8 8.87496L4.41667 5.29163L3 6.70829Z';
const UP = 'M3 9.29163L4.41667 10.7083L8 7.12496L11.5833 10.7083L13 9.29163L8 4.29163L3 9.29163Z';

afterEach(cleanupOverlaySpec);

it('keeps the trigger caret mounted and follows open state without the second direction asset', async () => {
  const user = userEvent.setup();
  const options = Array.from({ length: 3 }, (_, key) => ({ key, value: `v${key}`, title: `Title ${key}` }));
  const view = render(<SearchableSelect<string> options={options} value="v1" />);
  try {
    const trigger = view.getByRole('combobox');
    const adornment = view.getByTestId('vanguard-searchable-select-input').querySelector('.MuiInputAdornment-positionEnd');
    const currentIcon = () => adornment?.querySelector('[data-slot="icon"]');
    await waitFor(() => expect(currentIcon()?.querySelector('path')).toHaveAttribute('d', DOWN));
    const icon = currentIcon();
    const svg = icon?.querySelector('svg');
    const path = svg?.querySelector('path');
    expect(icon).toHaveAttribute('data-icon', 'caret-down');
    expect(icon).toHaveAttribute('data-size', 'small');
    expect(svg).toHaveAttribute('role', 'figure');
    expect(svg).toHaveAttribute('width', '16');
    expect(svg).toHaveAttribute('height', '16');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect({
      direction: currentIcon()?.getAttribute('data-icon'),
      path: currentIcon()?.querySelector('path')?.getAttribute('d'),
      extraRequests: upAsset.requests,
    }).toEqual({ direction: 'caret-up', path: UP, extraRequests: 0 });
    expect(currentIcon()).toBe(icon);
    expect(icon?.querySelector('svg')).toBe(svg);
    expect(svg?.querySelector('path')).toBe(path);

    const listbox = await view.findByRole('listbox');
    const popup = listbox.closest('.MuiModal-root');
    expect(popup?.parentElement).toBe(document.body);
    await waitFor(() => expect(popup?.contains(document.activeElement)).toBe(true));

    await user.keyboard('{Escape}');
    await waitFor(() => expect(listbox.isConnected).toBe(false));
    expect(document.activeElement).toBe(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(currentIcon()).toBe(icon);
    expect(icon?.querySelector('svg')).toBe(svg);
    expect(svg?.querySelector('path')).toBe(path);
    expect(icon).toHaveAttribute('data-icon', 'caret-down');
    expect(path).toHaveAttribute('d', DOWN);
    expect(upAsset.requests).toBe(0);
  } finally {
    view.unmount();
    upAsset.release();
  }
});
