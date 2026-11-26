import React, { useState } from 'react';
import { GoogleMaps, GoogleMapsProps } from '../GoogleMaps';
import { GoogleMapsAdvancedMarker } from '@vanguard/GoogleMaps';
import { Story, testMapOptions } from './_GoogleMaps.default';

const markers = [
  { id: 'hover-marker-1', lat: 40.7128, lng: -74.006, label: 'Downtown' },
  { id: 'hover-marker-2', lat: 40.7589, lng: -73.9851, label: 'Midtown' },
  { id: 'hover-marker-3', lat: 40.6782, lng: -73.9442, label: 'Brooklyn' },
];

const formatEvent = (name: string, id: string, e: google.maps.MapMouseEvent) =>
  `${name} · ${id} · ${e.domEvent.type} · ${e.latLng?.lat().toFixed(4)}, ${e.latLng?.lng().toFixed(4)}`;

/**
 * Hover state is driven only by the marker's onMouseOver / onMouseOut callbacks
 * (no CSS :hover), so the highlight proves the callbacks fire.
 */
const AdvancedMarkerHoverDemo = (args: GoogleMapsProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState('Hover a marker');

  return (
    <>
      <GoogleMaps {...args}>
        {markers.map((marker) => {
          const isHovered = hoveredId === marker.id;
          return (
            <GoogleMapsAdvancedMarker
              key={marker.id}
              id={marker.id}
              isJsApiLoaded={true}
              pos={{ lat: marker.lat, lng: marker.lng }}
              title={marker.label}
              onMouseOver={(e) => {
                setHoveredId(marker.id);
                setLastEvent(formatEvent('onMouseOver', marker.id, e));
              }}
              onMouseOut={(e) => {
                setHoveredId((current) => (current === marker.id ? null : current));
                setLastEvent(formatEvent('onMouseOut', marker.id, e));
              }}
            >
              <div
                data-testid={marker.id}
                style={{
                  background: isHovered ? '#4285F4' : '#fff',
                  color: isHovered ? '#fff' : '#4285F4',
                  padding: '6px 10px',
                  borderRadius: '16px',
                  border: '2px solid #4285F4',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  transform: isHovered ? 'scale(1.1)' : 'none',
                  transition: 'transform 120ms ease',
                }}
              >
                {marker.label}
              </div>
            </GoogleMapsAdvancedMarker>
          );
        })}
      </GoogleMaps>
      <div data-testid="advanced-marker-hover-status" style={{ fontFamily: 'monospace', fontSize: '13px', padding: '8px 0' }}>
        <div>Hovered: {hoveredId ?? 'none'}</div>
        <div>Last event: {lastEvent}</div>
      </div>
    </>
  );
};

export const WithAdvancedMarkerHover: Story = {
  args: {
    center: testMapOptions.center,
    zoom: 11,
    mapId: 'DEMO_MAP_ID',
  },
  render: (args) => <AdvancedMarkerHoverDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story:
          'AdvancedMarkers with onMouseOver / onMouseOut. The highlight and the status line below the map are driven only by those callbacks, which fire from the DOM pointerenter / pointerleave events on the marker.',
      },
    },
  },
};
