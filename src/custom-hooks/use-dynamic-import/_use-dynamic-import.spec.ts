import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDynamicImport } from './use-dynamic-import';

// A real asset that the module-level `import.meta.glob('./assets/**/*.*')`
// is guaranteed to resolve. Kept top-level + stable on purpose.
const REAL_ASSET = 'star.svg';
const REAL_ASSET_NESTED = 'icons/Icon-g-ads.svg';
const MISSING_ASSET = '__definitely-not-a-real-asset__.svg';

describe('useDynamicImport', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('starts in a loading state with no icon and no error', () => {
    const { result } = renderHook(() => useDynamicImport(REAL_ASSET));

    // getAssetUrl resolves on a later tick, so the synchronous initial
    // state must still be "loading".
    expect(result.current).toEqual({ error: null, loading: true, SvgIcon: '' });
  });

  it('does nothing while shouldRequest is false', async () => {
    const { result } = renderHook(() => useDynamicImport(REAL_ASSET, { shouldRequest: false }));

    // Give any (incorrectly fired) async work a chance to run.
    await new Promise((r) => setTimeout(r, 50));

    expect(result.current).toEqual({ error: null, loading: true, SvgIcon: '' });
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('resolves a known asset to a non-empty SvgIcon url', async () => {
    const { result } = renderHook(() => useDynamicImport(REAL_ASSET));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(typeof result.current.SvgIcon).toBe('string');
    expect(result.current.SvgIcon.length).toBeGreaterThan(0);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('resolves a nested asset path', async () => {
    const { result } = renderHook(() => useDynamicImport(REAL_ASSET_NESTED));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.SvgIcon.length).toBeGreaterThan(0);
  });

  it('reports an "Asset not found" error for an unknown asset', async () => {
    const { result } = renderHook(() => useDynamicImport(MISSING_ASSET));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.SvgIcon).toBe('');
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Asset not found');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining(`Asset not found: ${MISSING_ASSET}`));
  });

  it('rewrites "assets/ads" → "assets/ads_" before resolving', async () => {
    const { result } = renderHook(() => useDynamicImport('assets/ads/whatever.svg'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    // The rewritten name is what gets looked up (and logged on miss).
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('assets/ads_/whatever.svg'));
    expect(errorSpy).not.toHaveBeenCalledWith(expect.stringContaining('assets/ads/whatever.svg'));
  });

  it('resolves when shouldRequest flips from false to true', async () => {
    const { result, rerender } = renderHook(
      ({ name, request }: { name: string; request: boolean }) => useDynamicImport(name, { shouldRequest: request }),
      { initialProps: { name: REAL_ASSET, request: false } },
    );

    await new Promise((r) => setTimeout(r, 20));
    expect(result.current.loading).toBe(true);

    rerender({ name: REAL_ASSET, request: true });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.SvgIcon.length).toBeGreaterThan(0);
    expect(result.current.error).toBeNull();
  });

  it('serves the same asset to two independent consumers', async () => {
    const a = renderHook(() => useDynamicImport(REAL_ASSET));
    const b = renderHook(() => useDynamicImport(REAL_ASSET));

    await waitFor(() => expect(a.result.current.loading).toBe(false));
    await waitFor(() => expect(b.result.current.loading).toBe(false));

    expect(a.result.current.SvgIcon).toBe(b.result.current.SvgIcon);
    expect(a.result.current.SvgIcon.length).toBeGreaterThan(0);
  });
});
