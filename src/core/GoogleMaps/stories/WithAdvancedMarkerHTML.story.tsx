import React from 'react';
import { GoogleMaps } from '../GoogleMaps';
import { GoogleMapsAdvancedMarker } from '@vanguard/GoogleMaps';
import { Story, testMapOptions } from './_GoogleMaps.default';

export const WithAdvancedMarkerHTML: Story = {
  args: {
    center: testMapOptions.center,
    zoom: testMapOptions.zoom,
    mapId: 'DEMO_MAP_ID',
  },
  render: (args) => (
    <GoogleMaps {...args}>
      <GoogleMapsAdvancedMarker
        id="advanced-marker-html"
        isJsApiLoaded={true}
        pos={testMapOptions.center}
        title="Custom HTML Marker"
        onClick={(id) => console.log('Marker clicked:', id)}
      >
        <div
          style={{
            background: '#fff',
            padding: '8px 12px',
            borderRadius: '20px',
            border: '2px solid #4285F4',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#4285F4',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          🗽 NYC
        </div>
      </GoogleMapsAdvancedMarker>
    </GoogleMaps>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'AdvancedMarker with fully custom HTML content. This demonstrates the flexibility of AdvancedMarkerElement - you can render any React components as marker content.',
      },
    },
  },
};
