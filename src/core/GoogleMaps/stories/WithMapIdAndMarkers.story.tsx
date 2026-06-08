import React from 'react';
import { GoogleMaps } from '../GoogleMaps';
import { GoogleMapsMarker } from '@vanguard/GoogleMaps';
import { Story, testMapOptions } from './_GoogleMaps.default';

const markers = [
  { id: 'marker-1', lat: 40.7128, lng: -74.006, label: 'Marker 1' },
  { id: 'marker-2', lat: 40.7589, lng: -73.9851, label: 'Marker 2' },
  { id: 'marker-3', lat: 40.6782, lng: -73.9442, label: 'Marker 3' },
];

export const WithMapIdAndMarkers: Story = {
  args: {
    center: testMapOptions.center,
    zoom: testMapOptions.zoom,
    mapId: 'DEMO_MAP_ID', // Using mapId enables AdvancedMarkerElement support
  },
  render: (args) => (
    <GoogleMaps {...args}>
      {markers.map((marker) => (
        <GoogleMapsMarker
          key={marker.id}
          id={marker.id}
          isJsApiLoaded={true}
          pos={{ lat: marker.lat, lng: marker.lng }}
          icon="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAjCAYAAACHIWrsAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAALXSURBVHgBtZcxb9NAFMffXRKVikRKpyImo6KuDUnFwoChH4DCFwhFYmOBL0ArRgZgQyyQqR1a0k9AzMBSkZKuQJNshalRW4TUODneO9vFdh37zpi/1Prse+df7t27e88MFHRsLpoAYpkBuylAGHgt03NsD7DdweseANsuWZ+tpHexuM4js3qfA3uKZgYoSfTw31rRajdAB3hoVowC5JvYrEAqid4QRrdnrE4/3MPDD36b1+t5yH1JDyOxK/iDd4/M2vK5Hv8NGaALm5CdRA74yrS10zgHJDfSzLyAyFCHQ7CrnnvPXFqAXGsSrFB/COzqPEw9ey7vvSswBhdevIaLH3YgV6lNAs6ge997NxJI0ZgUibxYAoZ/kuNe8zdMB4RgvlCNG145MWv1M6AT+ik0O6tqSUsnGXlnU4OROGJuXs6M+1znzVSRaRCL0wmiYj716AlwXMdpXDNP/NJl0BDOUtzhGCgLSZbjvV0QPw5kW5wcg/3JcjqKRdARHY20hokbfNRpw+m7N7I93FwHe3PDeYGWS6UMAma97+JU5poDArPSXENnjLKlu15+4HBrXa6pJlD0VQyj1mu4tQHj719BQwMEsj78gzTd2uFOttaQ5lbwi1g0w22dQSm2wl8esrhbhwySrNNEZIjXR9ZH7qJfJZmP953gEPvfgq9xo1T8PIgbTrOTDJmAMfmWMWdRAfRfDgFcu57t1jhyhtgYqMwyNQ9Yw8v4gZoGk2RPvSRU5nWxbJzz7njwp7AVyFYCy8Ul/4MAkCJ2BOPHkBEMfbkWrk0jC+Ff5mITjZUS80QaiGbJat8LP488vE/BJtd2ID2ui1H5IKonEkhRi7XkXdWDPQSjMn+J3hHVG/sx43xj5Fo6HzOTvik8xeZDGogvuKU2U9FNgiUCfdBr2LRizFpoU0uCkRhoCOvKVeYWtJ4wGl9iNCpvJS2gCzUZiLeUuHHrrFIG0Bn/B8iyAYtRjCoiAAAAAElFTkSuQmCC"
          size={{ x: 28, y: 35 }}
          showInfoBox={false}
          onClick={(id) => console.log('Marker clicked:', id)}
        />
      ))}
    </GoogleMaps>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Google Maps with mapId prop enabled for AdvancedMarkerElement support. This prevents deprecation warnings and enables advanced marker features. Note: When mapId is set, custom themes are automatically disabled.',
      },
    },
  },
};
