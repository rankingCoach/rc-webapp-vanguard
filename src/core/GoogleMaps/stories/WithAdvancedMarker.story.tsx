import React from 'react';
import { GoogleMaps } from '../GoogleMaps';
import { GoogleMapsAdvancedMarker, GoogleMapsAdvancedMarkerContent } from '@vanguard/GoogleMaps';
import { Story, testMapOptions } from './_GoogleMaps.default';

export const WithAdvancedMarker: Story = {
  args: {
    center: testMapOptions.center,
    zoom: testMapOptions.zoom,
    mapId: 'DEMO_MAP_ID', // Required for AdvancedMarkerElement
  },
  render: (args) => (
    <GoogleMaps {...args}>
      <GoogleMapsAdvancedMarker
        id="advanced-marker-1"
        isJsApiLoaded={true}
        pos={testMapOptions.center}
        title="Advanced Marker"
        onClick={(id) => console.log('Advanced marker clicked:', id)}
      >
        <GoogleMapsAdvancedMarkerContent color="#4285F4" />
      </GoogleMapsAdvancedMarker>
    </GoogleMaps>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Google Maps with AdvancedMarkerElement using default pin content. This uses the modern Google Maps API and requires the mapId prop. No deprecation warnings will appear in the console.',
      },
    },
  },
};
