import React from 'react';
import { GoogleMaps } from '../GoogleMaps';
import { GoogleMapsAdvancedMarker, GoogleMapsAdvancedMarkerContent } from '@vanguard/GoogleMaps';
import { Story, testMapOptions } from './_GoogleMaps.default';

const markers = [
  { id: 'adv-marker-1', lat: 40.7128, lng: -74.006, color: '#EA4335', label: 'Red Pin' },
  { id: 'adv-marker-2', lat: 40.7589, lng: -73.9851, color: '#FBBC04', label: 'Yellow Pin' },
  { id: 'adv-marker-3', lat: 40.6782, lng: -73.9442, color: '#34A853', label: 'Green Pin' },
  { id: 'adv-marker-4', lat: 40.7489, lng: -73.968, color: '#4285F4', label: 'Blue Pin' },
];

export const WithMultipleAdvancedMarkers: Story = {
  args: {
    center: testMapOptions.center,
    zoom: testMapOptions.zoom,
    mapId: 'DEMO_MAP_ID',
  },
  render: (args) => (
    <GoogleMaps {...args}>
      {markers.map((marker) => (
        <GoogleMapsAdvancedMarker
          key={marker.id}
          id={marker.id}
          isJsApiLoaded={true}
          pos={{ lat: marker.lat, lng: marker.lng }}
          title={marker.label}
          onClick={(id) => console.log('Marker clicked:', id)}
        >
          <GoogleMapsAdvancedMarkerContent color={marker.color} />
        </GoogleMapsAdvancedMarker>
      ))}
    </GoogleMaps>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Multiple AdvancedMarkers with different colors displayed on the map. Each marker uses a unique color to differentiate locations.',
      },
    },
  },
};
