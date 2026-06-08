import React from 'react';
import { GoogleMaps } from '../GoogleMaps';
import { GoogleMapsMarker } from '@vanguard/GoogleMaps';
import { Story, testMapOptions } from './_GoogleMaps.default';

export const WithMarkerInfoBox: Story = {
  args: {
    center: testMapOptions.center,
    zoom: testMapOptions.zoom,
  },
  render: (args) => (
    <GoogleMaps {...args}>
      <GoogleMapsMarker
        id="marker-with-info"
        isJsApiLoaded={true}
        pos={testMapOptions.center}
        icon="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAjCAYAAACHIWrsAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAALXSURBVHgBtZcxb9NAFMffXRKVikRKpyImo6KuDUnFwoChH4DCFwhFYmOBL0ArRgZgQyyQqR1a0k9AzMBSkZKuQJNshalRW4TUODneO9vFdh37zpi/1Prse+df7t27e88MFHRsLpoAYpkBuylAGHgt03NsD7DdweseANsuWZ+tpHexuM4js3qfA3uKZgYoSfTw31rRajdAB3hoVowC5JvYrEAqid4QRrdnrE4/3MPDD36b1+t5yH1JDyOxK/iDd4/M2vK5Hv8NGaALm5CdRA74yrS10zgHJDfSzLyAyFCHQ7CrnnvPXFqAXGsSrFB/COzqPEw9ey7vvSswBhdevIaLH3YgV6lNAs6ge997NxJI0ZgUibxYAoZ/kuNe8zdMB4RgvlCNG145MWv1M6AT+ik0O6tqSUsnGXlnU4OROGJuXs6M+1znzVSRaRCL0wmiYj716AlwXMdpXDNP/NJl0BDOUtzhGCgLSZbjvV0QPw5kW5wcg/3JcjqKRdARHY20hokbfNRpw+m7N7I93FwHe3PDeYGWS6UMAma97+JU5poDArPSXENnjLKlu15+4HBrXa6pJlD0VQyj1mu4tQHj719BQwMEsj78gzTd2uFOttaQ5lbwi1g0w22dQSm2wl8esrhbhwySrNNEZIjXR9ZH7qJfJZmP953gEPvfgq9xo1T8PIgbTrOTDJmAMfmWMWdRAfRfDgFcu57t1jhyhtgYqMwyNQ9Yw8v4gZoGk2RPvSRU5nWxbJzz7njwp7AVyFYCy8Ul/4MAkCJ2BOPHkBEMfbkWrk0jC+Ff5mITjZUS80QaiGbJat8LP488vE/BJtd2ID2ui1H5IKonEkhRi7XkXdWDPQSjMn+J3hHVG/sx43xj5Fo6HzOTvik8xeZDGogvuKU2U9FNgiUCfdBr2LRizFpoU0uCkRhoCOvKVeYWtJ4wGl9iNCpvJS2gCzUZiLeUuHHrrFIG0Bn/B8iyAYtRjCoiAAAAAElFTkSuQmCC"
        size={{ x: 28, y: 35 }}
        showInfoBox={true}
        onClick={(id) => console.log('Marker clicked:', id)}
        onCloseClick={() => console.log('InfoBox closed')}
      >
        <div style={{ padding: '8px', fontSize: '14px' }}>
          <strong>New York City</strong>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>
            Latitude: {testMapOptions.center.lat.toFixed(4)}
            <br />
            Longitude: {testMapOptions.center.lng.toFixed(4)}
          </p>
        </div>
      </GoogleMapsMarker>
    </GoogleMaps>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Google Maps marker with an InfoBox popup. Click the marker to see the info box with custom content.',
      },
    },
  },
};
