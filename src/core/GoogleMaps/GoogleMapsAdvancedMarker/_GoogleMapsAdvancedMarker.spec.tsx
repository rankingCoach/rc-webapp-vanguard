import { render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MapContext } from '../map-context';
import { GoogleMapsAdvancedMarker } from './GoogleMapsAdvancedMarker';

const stubMap = {} as google.maps.Map;

const markerCtorSpy = vi.fn();
const markerInstances: AdvancedMarkerElementMock[] = [];

class AdvancedMarkerElementMock {
  map: unknown;
  position: unknown;
  zIndex: unknown;
  title: unknown;
  gmpDraggable: unknown;
  gmpClickable: unknown;
  listeners: Record<string, ((event?: unknown) => void)[]> = {};

  constructor(options: Record<string, unknown>) {
    markerCtorSpy(options);
    Object.assign(this, options);
    markerInstances.push(this);
  }

  addListener(): { remove: () => void } {
    return { remove: () => undefined };
  }

  addEventListener(type: string, handler: (event?: unknown) => void): void {
    this.listeners[type] = [...(this.listeners[type] ?? []), handler];
  }

  removeEventListener(type: string, handler: (event?: unknown) => void): void {
    this.listeners[type] = (this.listeners[type] ?? []).filter((registered) => registered !== handler);
  }

  trigger(type: string): void {
    (this.listeners[type] ?? []).forEach((handler) => handler());
  }
}

const installGoogleMock = () => {
  (window as any).google = {
    maps: {
      version: '3.58',
      marker: { AdvancedMarkerElement: AdvancedMarkerElementMock },
      event: {
        addListener: () => ({ remove: () => undefined }),
        removeListener: () => undefined,
      },
    },
  };
};

const renderMarker = (props: Partial<React.ComponentProps<typeof GoogleMapsAdvancedMarker>> = {}) =>
  render(
    <MapContext.Provider value={stubMap}>
      <GoogleMapsAdvancedMarker id="marker-1" pos={{ lat: 40.7, lng: -74.0 }} {...props}>
        <span>pin</span>
      </GoogleMapsAdvancedMarker>
    </MapContext.Provider>,
  );

describe('GoogleMapsAdvancedMarker', () => {
  beforeEach(() => {
    markerCtorSpy.mockClear();
    markerInstances.length = 0;
    delete (window as any).google;
  });

  afterEach(() => {
    delete (window as any).google;
  });

  it('renders nothing and does not throw when window.google is absent', () => {
    expect(() => renderMarker()).not.toThrow();
    expect(markerCtorSpy).not.toHaveBeenCalled();
  });

  it('renders nothing and does not throw when the Maps script is present without the marker library', () => {
    (window as any).google = { maps: { version: '3.58' } };

    expect(() => renderMarker()).not.toThrow();
    expect(markerCtorSpy).not.toHaveBeenCalled();
  });

  it('skips construction when isJsApiLoaded is explicitly false, even with the marker library present', () => {
    installGoogleMock();

    renderMarker({ isJsApiLoaded: false });

    expect(markerCtorSpy).not.toHaveBeenCalled();
  });

  it('constructs the marker when the prop is omitted and the marker library exists', () => {
    installGoogleMock();

    renderMarker();

    expect(markerCtorSpy).toHaveBeenCalledTimes(1);
    expect(markerCtorSpy.mock.calls[0][0]).toMatchObject({
      map: stubMap,
      position: { lat: 40.7, lng: -74.0 },
    });
  });

  it('registers a gmp-click listener and enables gmpClickable when onClick is provided', () => {
    installGoogleMock();

    renderMarker({ onClick: vi.fn() });

    const [marker] = markerInstances;
    expect(marker.listeners['gmp-click']).toHaveLength(1);
    expect(marker.gmpClickable).toBe(true);
  });

  it('calls onClick with the marker id when gmp-click fires', () => {
    installGoogleMock();
    const onClick = vi.fn();

    renderMarker({ onClick });

    markerInstances[0].trigger('gmp-click');

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith('marker-1');
  });

  it('removes the gmp-click listener and disables gmpClickable on unmount', () => {
    installGoogleMock();

    const { unmount } = renderMarker({ onClick: vi.fn() });
    unmount();

    const [marker] = markerInstances;
    expect(marker.listeners['gmp-click']).toHaveLength(0);
    expect(marker.gmpClickable).toBe(false);
  });

  it('does not register a gmp-click listener when onClick is omitted', () => {
    installGoogleMock();

    renderMarker();

    const [marker] = markerInstances;
    expect(marker.listeners['gmp-click']).toBeUndefined();
    expect(marker.gmpClickable).toBeUndefined();
  });
});
