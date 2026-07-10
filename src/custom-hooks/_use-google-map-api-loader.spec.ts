import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

// The JWT language is resolved at module scope, so every test re-evaluates
// the module after seeding localStorage.
const importHook = (): Promise<typeof import('./use-google-map-api-loader')> => {
  vi.resetModules();
  return import('./use-google-map-api-loader');
};

describe('useGoogleMapApiLoader', () => {
  beforeEach(() => {
    localStorage.clear();
    loaderCtorSpy.mockReset();
    // Pending by default so isLoaded stays false unless a test resolves it.
    loadMock.mockReset().mockReturnValue(new Promise(() => undefined));
    delete (window as any).google;
  });

  it('resolves the language from the userService localStorage entry at module scope', async () => {
    localStorage.setItem('userService', JSON.stringify({ languageCode: 'de' }));
    const { useGoogleMapApiLoader } = await importHook();

    renderHook(() => useGoogleMapApiLoader([], 'test-key'));

    expect(loaderCtorSpy).toHaveBeenCalledWith({
      id: 'google-map-script',
      apiKey: 'test-key',
      version: 'weekly',
      libraries: ['places', 'marker'],
      language: 'de',
      region: 'US',
      mapIds: [],
      nonce: '',
      authReferrerPolicy: 'origin',
    });
  });

  it('lets an explicit languageCode win over the JWT language', async () => {
    localStorage.setItem('userService', JSON.stringify({ languageCode: 'de' }));
    const { useGoogleMapApiLoader } = await importHook();

    renderHook(() => useGoogleMapApiLoader([], 'test-key', 'fr'));

    expect(loaderCtorSpy.mock.calls[0][0]).toMatchObject({ language: 'fr' });
  });

  it('falls back to the JWT language when the explicit languageCode is an empty string', async () => {
    localStorage.setItem('userService', JSON.stringify({ languageCode: 'de' }));
    const { useGoogleMapApiLoader } = await importHook();

    renderHook(() => useGoogleMapApiLoader([], 'test-key', ''));

    expect(loaderCtorSpy.mock.calls[0][0]).toMatchObject({ language: 'de' });
  });

  it("falls back to 'en' when userService is missing or malformed", async () => {
    localStorage.setItem('userService', '{not json');
    const { useGoogleMapApiLoader } = await importHook();

    renderHook(() => useGoogleMapApiLoader([], 'test-key'));

    expect(loaderCtorSpy.mock.calls[0][0]).toMatchObject({ language: 'en' });
  });

  it('does nothing while enabled=false, then loads once enabled flips to true', async () => {
    const { useGoogleMapApiLoader } = await importHook();
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
    const { useGoogleMapApiLoader } = await importHook();

    const { result } = renderHook(() => useGoogleMapApiLoader([], 'test-key'));

    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    expect(loaderCtorSpy).not.toHaveBeenCalled();
  });

  it('degrades a constructor options-mismatch throw to loadError instead of crashing the render', async () => {
    const boom = new Error('Loader must not be called again with different options');
    loaderCtorSpy.mockImplementation(() => {
      throw boom;
    });
    const { useGoogleMapApiLoader } = await importHook();

    const { result } = renderHook(() => useGoogleMapApiLoader([], 'test-key'));

    await waitFor(() => expect(result.current.loadError).toBe(boom));
    expect(result.current.isLoaded).toBe(false);
  });

  it('surfaces a load() rejection as loadError', async () => {
    const boom = new Error('script failed');
    loadMock.mockRejectedValue(boom);
    const { useGoogleMapApiLoader } = await importHook();

    const { result } = renderHook(() => useGoogleMapApiLoader([], 'test-key'));

    await waitFor(() => expect(result.current.loadError).toBe(boom));
  });
});
