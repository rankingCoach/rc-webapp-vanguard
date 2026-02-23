import { ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { MapContext } from '../map-context';

/**
 * Props for GoogleMapsAdvancedMarker component
 */
export interface GoogleMapsAdvancedMarkerProps {
  /** Unique identifier for the marker */
  id: string;
  /** Indicates if Google Maps JavaScript API is loaded */
  isJsApiLoaded: boolean;
  /** Callback when marker is clicked, receives marker ID */
  onClick?: (id: string) => void;
  /** Callback when mouse enters marker area */
  onMouseOver?: (e: google.maps.MapMouseEvent) => void;
  /** Callback when mouse leaves marker area */
  onMouseOut?: (e: google.maps.MapMouseEvent) => void;
  /** Marker position coordinates */
  pos: { lat: number; lng: number };
  /** Z-index for marker layering */
  zIndex?: number;
  /** Rollover text displayed on hover */
  title?: string;
  /** If true, the marker can be dragged */
  draggable?: boolean;
  /** Callback when user stops dragging the marker */
  onDragEnd?: (e: google.maps.MapMouseEvent) => void;
  /**
   * Content rendered inside the AdvancedMarkerElement via React portal.
   * Use GoogleMapsAdvancedMarkerContent for a default pin, or provide custom HTML.
   * Absolutely-positioned children (e.g. info overlays) won't affect the marker anchor.
   */
  children?: ReactNode;
}

/**
 * GoogleMapsAdvancedMarker Component
 *
 * Uses google.maps.marker.AdvancedMarkerElement with a React portal so that
 * children are rendered directly inside the marker's DOM content node.
 * This allows arbitrary React content (SVG pins, info overlays, etc.) to be
 * placed exactly where the marker is on the map.
 *
 * Requires a mapId on the parent GoogleMaps component.
 *
 * @example
 * ```tsx
 * <GoogleMaps mapId="YOUR_MAP_ID" center={center} zoom={10}>
 *   <GoogleMapsAdvancedMarker id="marker-1" isJsApiLoaded={true} pos={{ lat: 40.7, lng: -74.0 }}>
 *     <GoogleMapsAdvancedMarkerContent color="#4285F4" />
 *   </GoogleMapsAdvancedMarker>
 * </GoogleMaps>
 * ```
 */
export const GoogleMapsAdvancedMarker = (props: GoogleMapsAdvancedMarkerProps) => {
  const { onClick, onMouseOver, onMouseOut, id, zIndex, pos, title, draggable, onDragEnd, children } = props;

  const map = useContext(MapContext);

  // Stable DOM container used as AdvancedMarkerElement content
  const container = useMemo(() => document.createElement('div'), []);

  const [markerInstance, setMarkerInstance] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);

  // Create / destroy marker when map becomes available
  useEffect(() => {
    if (!map) return;
    if (isNaN(pos.lat) || isNaN(pos.lng)) return;

    const marker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: pos,
      content: container,
      zIndex,
      title,
      gmpDraggable: draggable,
    });

    setMarkerInstance(marker);

    return () => {
      marker.map = null;
      setMarkerInstance(null);
    };
  }, [map]);

  // Sync position
  useEffect(() => {
    if (markerInstance) {
      markerInstance.position = pos;
    }
  }, [markerInstance, pos.lat, pos.lng]);

  // Sync zIndex
  useEffect(() => {
    if (markerInstance && zIndex !== undefined) {
      markerInstance.zIndex = zIndex;
    }
  }, [markerInstance, zIndex]);

  // Sync draggable
  useEffect(() => {
    if (markerInstance) {
      markerInstance.gmpDraggable = !!draggable;
    }
  }, [markerInstance, draggable]);

  // Click listener
  useEffect(() => {
    if (!markerInstance || !onClick) return;
    const listener = markerInstance.addListener('click', () => onClick(id));
    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [markerInstance, onClick, id]);

  // MouseOver listener
  useEffect(() => {
    if (!markerInstance || !onMouseOver) return;
    const listener = markerInstance.addListener('mouseover', onMouseOver);
    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [markerInstance, onMouseOver]);

  // MouseOut listener
  useEffect(() => {
    if (!markerInstance || !onMouseOut) return;
    const listener = markerInstance.addListener('mouseout', onMouseOut);
    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [markerInstance, onMouseOut]);

  // DragEnd listener
  useEffect(() => {
    if (!markerInstance || !onDragEnd) return;
    const listener = markerInstance.addListener('dragend', onDragEnd);
    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [markerInstance, onDragEnd]);

  // Portal children into the marker's content DOM node
  return createPortal(children, container);
};
