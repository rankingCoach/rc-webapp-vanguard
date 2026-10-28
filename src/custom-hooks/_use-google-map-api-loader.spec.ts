import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useGoogleMapApiLoader } from './use-google-map-api-loader';

// Hoisted spies shared between the vi.mock factory and the assertions.
const { loaderCtorSpy, loadMock } = vi.hoisted(() => ({
  loaderCtorSpy: vi.fn(),
  loadMock: vi.fn(),
}));

vi.mock('@googlemaps/js-api-loader', () => ({
  Loader: class {
    constructor(options: unknown) {
      loaderCtorSpy(options);
    }
    load = loadMock;
  },
}));

describe('useGoogleMapApiLoader', () => {
  beforeEach(() => {
    localStorage.clear();
    loaderCtorSpy.mockReset();
    // Pending by default so isLoaded stays false unless a test resolves it.
    loadMock.mockReset().mockReturnValue(new Promise(() => undefined));
    delete (window as any).google;
  });

  it('passes the languageCode param through to the Loader', () => {
    renderHook(() => useGoogleMapApiLoader([], 'test-key', 'fr'));

    expect(loaderCtorSpy).toHaveBeenCalledWith({
      id: 'google-map-script',
      apiKey: 'test-key',
      version: 'weekly',
      libraries: ['places', 'marker'],
      language: 'fr',
      region: 'US',
      mapIds: [],
      nonce: '',
      authReferrerPolicy: 'origin',
    });
  });

  it("defaults to 'en' when no languageCode is given", () => {
    renderHook(() => useGoogleMapApiLoader([], 'test-key'));

    expect(loaderCtorSpy.mock.calls[0][0]).toMatchObject({ language: 'en' });
  });

  it("defaults to 'en' when languageCode is an empty string", () => {
    renderHook(() => useGoogleMapApiLoader([], 'test-key', ''));

    expect(loaderCtorSpy.mock.calls[0][0]).toMatchObject({ language: 'en' });
  });

  it('ignores app-level state: a userService localStorage entry does not influence the language', () => {
    localStorage.setItem('userService', JSON.stringify({ languageCode: 'de' }));

    renderHook(() => useGoogleMapApiLoader([], 'test-key'));

    expect(loaderCtorSpy.mock.calls[0][0]).toMatchObject({ language: 'en' });
  });

  it('does nothing while enabled=false, then loads once enabled flips to true', async () => {
    loadMock.mockResolvedValue(undefined);

    const { result, rerender } = renderHook(
      ({ enabled }) => useGoogleMapApiLoader([], 'test-key', undefined, enabled),
      { initialProps: { enabled: false } },
    );

    expect(loaderCtorSpy).not.toHaveBeenCalled();
    expect(result.current.isLoaded).toBe(false);

    rerender({ enabled: true });

    expect(loaderCtorSpy).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(result.current.isLoaded).toBe(true));
  });

  it('reports loaded immediately without constructing a Loader when the script is already present', async () => {
    (window as any).google = { maps: { version: '3.58' } };

    const { result } = renderHook(() => useGoogleMapApiLoader([], 'test-key'));

    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    expect(loaderCtorSpy).not.toHaveBeenCalled();
  });

  it('degrades a constructor options-mismatch throw to loadError instead of crashing the render', async () => {
    const boom = new Error('Loader must not be called again with different options');
    loaderCtorSpy.mockImplementation(() => {
      throw boom;
    });

    const { result } = renderHook(() => useGoogleMapApiLoader([], 'test-key'));

    await waitFor(() => expect(result.current.loadError).toBe(boom));
    expect(result.current.isLoaded).toBe(false);
  });

  it('surfaces a load() rejection as loadError', async () => {
    const boom = new Error('script failed');
    loadMock.mockRejectedValue(boom);

    const { result } = renderHook(() => useGoogleMapApiLoader([], 'test-key'));

    await waitFor(() => expect(result.current.loadError).toBe(boom));
  });
});
