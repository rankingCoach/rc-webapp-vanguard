import { cleanup, render } from '@testing-library/react';
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
  /** Event names passed to the legacy MVCObject addListener API */
  legacyListeners: string[] = [];

  constructor(options: Record<string, unknown>) {
    markerCtorSpy(options);
    Object.assign(this, options);
    markerInstances.push(this);
  }

  addListener(eventName: string): { remove: () => void } {
    this.legacyListeners.push(eventName);
    return { remove: () => undefined };
  }

  addEventListener(type: string, handler: (event?: unknown) => void): void {
    this.listeners[type] = [...(this.listeners[type] ?? []), handler];
  }

  removeEventListener(type: string, handler: (event?: unknown) => void): void {
    this.listeners[type] = (this.listeners[type] ?? []).filter((registered) => registered !== handler);
  }

  trigger(type: string, event?: unknown): void {
    (this.listeners[type] ?? []).forEach((handler) => handler(event));
  }
}

class LatLngMock {
  constructor(
    private readonly latValue: number,
    private readonly lngValue: number,
  ) {}

  lat(): number {
    return this.latValue;
  }

  lng(): number {
    return this.lngValue;
  }
}

const createPointerEvent = (type: string) => ({ type, stopPropagation: vi.fn() });

const installGoogleMock = () => {
  (window as any).google = {
    maps: {
      version: '3.58',
      LatLng: LatLngMock,
      marker: { AdvancedMarkerElement: AdvancedMarkerElementMock },
      event: {
        addListener: () => ({ remove: () => undefined }),
        removeListener: () => undefined,
      },
    },
  };
};

type MarkerProps = Partial<React.ComponentProps<typeof GoogleMapsAdvancedMarker>>;

const markerTree = (props: MarkerProps = {}) => (
  <MapContext.Provider value={stubMap}>
    <GoogleMapsAdvancedMarker id="marker-1" pos={{ lat: 40.7, lng: -74.0 }} {...props}>
      <span>pin</span>
    </GoogleMapsAdvancedMarker>
  </MapContext.Provider>
);

const renderMarker = (props: MarkerProps = {}) => render(markerTree(props));

describe('GoogleMapsAdvancedMarker', () => {
  beforeEach(() => {
    markerCtorSpy.mockClear();
    markerInstances.length = 0;
    delete (window as any).google;
  });

  afterEach(() => {
    // Unmount while the google mock still exists: marker effect cleanups call into it
    cleanup();
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

  describe('hover', () => {
    it('calls onMouseOver with a MapMouseEvent built from pointerenter', () => {
      installGoogleMock();
      const onMouseOver = vi.fn();

      renderMarker({ onMouseOver });

      const domEvent = createPointerEvent('pointerenter');
      markerInstances[0].trigger('pointerenter', domEvent);

      expect(onMouseOver).toHaveBeenCalledTimes(1);
      const [event] = onMouseOver.mock.calls[0] as [google.maps.MapMouseEvent];
      expect(event.domEvent).toBe(domEvent);
      expect(event.latLng?.lat()).toBe(40.7);
      expect(event.latLng?.lng()).toBe(-74.0);

      event.stop();
      expect(domEvent.stopPropagation).toHaveBeenCalledTimes(1);
    });

    it('calls onMouseOut with a MapMouseEvent built from pointerleave', () => {
      installGoogleMock();
      const onMouseOut = vi.fn();

      renderMarker({ onMouseOut });

      const domEvent = createPointerEvent('pointerleave');
      markerInstances[0].trigger('pointerleave', domEvent);

      expect(onMouseOut).toHaveBeenCalledTimes(1);
      const [event] = onMouseOut.mock.calls[0] as [google.maps.MapMouseEvent];
      expect(event.domEvent).toBe(domEvent);
      expect(event.latLng?.lat()).toBe(40.7);
    });

    it('reports the latest marker position after pos changes', () => {
      installGoogleMock();
      const onMouseOver = vi.fn();

      const { rerender } = renderMarker({ onMouseOver });
      rerender(markerTree({ onMouseOver, pos: { lat: 51.5, lng: -0.12 } }));

      markerInstances[0].trigger('pointerenter', createPointerEvent('pointerenter'));

      expect(markerInstances[0].listeners.pointerenter).toHaveLength(1);
      const [event] = onMouseOver.mock.calls[0] as [google.maps.MapMouseEvent];
      expect(event.latLng?.lat()).toBe(51.5);
      expect(event.latLng?.lng()).toBe(-0.12);
    });

    it('does not use the legacy mouseover/mouseout listeners', () => {
      installGoogleMock();

      renderMarker({ onMouseOver: vi.fn(), onMouseOut: vi.fn() });

      const [marker] = markerInstances;
      expect(marker.legacyListeners).not.toContain('mouseover');
      expect(marker.legacyListeners).not.toContain('mouseout');
    });

    it('removes the hover listeners on unmount', () => {
      installGoogleMock();

      const { unmount } = renderMarker({ onMouseOver: vi.fn(), onMouseOut: vi.fn() });
      unmount();

      const [marker] = markerInstances;
      expect(marker.listeners.pointerenter).toHaveLength(0);
      expect(marker.listeners.pointerleave).toHaveLength(0);
    });

    it('swaps the hover listeners when the callbacks change', () => {
      installGoogleMock();
      const firstOver = vi.fn();
      const firstOut = vi.fn();
      const nextOver = vi.fn();
      const nextOut = vi.fn();

      const { rerender } = renderMarker({ onMouseOver: firstOver, onMouseOut: firstOut });
      rerender(markerTree({ onMouseOver: nextOver, onMouseOut: nextOut }));

      const [marker] = markerInstances;
      expect(marker.listeners.pointerenter).toHaveLength(1);
      expect(marker.listeners.pointerleave).toHaveLength(1);

      marker.trigger('pointerenter', createPointerEvent('pointerenter'));
      marker.trigger('pointerleave', createPointerEvent('pointerleave'));

      expect(firstOver).not.toHaveBeenCalled();
      expect(firstOut).not.toHaveBeenCalled();
      expect(nextOver).toHaveBeenCalledTimes(1);
      expect(nextOut).toHaveBeenCalledTimes(1);
    });

    it('removes a hover listener when its callback is removed', () => {
      installGoogleMock();

      const { rerender } = renderMarker({ onMouseOver: vi.fn(), onMouseOut: vi.fn() });
      rerender(markerTree({}));

      const [marker] = markerInstances;
      expect(marker.listeners.pointerenter).toHaveLength(0);
      expect(marker.listeners.pointerleave).toHaveLength(0);
    });

    it('does not register hover listeners when the callbacks are omitted', () => {
      installGoogleMock();

      renderMarker();

      const [marker] = markerInstances;
      expect(marker.listeners.pointerenter).toBeUndefined();
      expect(marker.listeners.pointerleave).toBeUndefined();
    });

    it('leaves click handling untouched: hover alone does not make the marker clickable', () => {
      installGoogleMock();

      renderMarker({ onMouseOver: vi.fn(), onMouseOut: vi.fn() });

      const [marker] = markerInstances;
      expect(marker.listeners['gmp-click']).toBeUndefined();
      expect(marker.gmpClickable).toBeUndefined();
    });

    it('keeps hover and gmp-click working side by side', () => {
      installGoogleMock();
      const onClick = vi.fn();
      const onMouseOver = vi.fn();

      renderMarker({ onClick, onMouseOver });

      const [marker] = markerInstances;
      marker.trigger('pointerenter', createPointerEvent('pointerenter'));
      marker.trigger('gmp-click');

      expect(onMouseOver).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledWith('marker-1');
      expect(marker.gmpClickable).toBe(true);
    });
  });

  describe('drag', () => {
    it('still registers dragend through the marker listener API', () => {
      installGoogleMock();

      renderMarker({ draggable: true, onDragEnd: vi.fn() });

      const [marker] = markerInstances;
      expect(marker.legacyListeners).toEqual(['dragend']);
      expect(marker.gmpDraggable).toBe(true);
    });
  });
});
