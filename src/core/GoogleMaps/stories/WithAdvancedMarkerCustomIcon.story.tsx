import React from 'react';
import { GoogleMaps } from '../GoogleMaps';
import { GoogleMapsAdvancedMarker, GoogleMapsAdvancedMarkerContent } from '@vanguard/GoogleMaps';
import { Story, testMapOptions } from './_GoogleMaps.default';

const customIcon =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAjCAYAAACHIWrsAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAALXSURBVHgBtZcxb9NAFMffXRKVikRKpyImo6KuDUnFwoChH4DCFwhFYmOBL0ArRgZgQyyQqR1a0k9AzMBSkZKuQJNshalRW4TUODneO9vFdh37zpi/1Prse+df7t27e88MFHRsLpoAYpkBuylAGHgt03NsD7DdweseANsuWZ+tpHexuM4js3qfA3uKZgYoSfTw31rRajdAB3hoVowC5JvYrEAqid4QRrdnrE4/3MPDD36b1+t5yH1JDyOxK/iDd4/M2vK5Hv8NGaALm5CdRA74yrS10zgHJDfSzLyAyFCHQ7CrnnvPXFqAXGsSrFB/COzqPEw9ey7vvSswBhdevIaLH3YgV6lNAs6ge997NxJI0ZgUibxYAoZ/kuNe8zdMB4RgvlCNG145MWv1M6AT+ik0O6tqSUsnGXlnU4OROGJuXs6M+1znzVSRaRCL0wmiYj716AlwXMdpXDNP/NJl0BDOUtzhGCgLSZbjvV0QPw5kW5wcg/3JcjqKRdARHY20hokbfNRpw+m7N7I93FwHe3PDeYGWS6UMAma97+JU5poDArPSXENnjLKlu15+4HBrXa6pJlD0VQyj1mu4tQHj719BQwMEsj78gzTd2uFOttaQ5lbwi1g0w22dQSm2wl8esrhbhwySrNNEZIjXR9ZH7qJfJZmP953gEPvfgq9xo1T8PIgbTrOTDJmAMfmWMWdRAfRfDgFcu57t1jhyhtgYqMwyNQ9Yw8v4gZoGk2RPvSRU5nWxbJzz7njwp7AVyFYCy8Ul/4MAkCJ2BOPHkBEMfbkWrk0jC+Ff5mITjZUS80QaiGbJat8LP488vE/BJtd2ID2ui1H5IKonEkhRi7XkXdWDPQSjMn+J3hHVG/sx43xj5Fo6HzOTvik8xeZDGogvuKU2U9FNgiUCfdBr2LRizFpoU0uCkRhoCOvKVeYWtJ4wGl9iNCpvJS2gCzUZiLeUuHHrrFIG0Bn/B8iyAYtRjCoiAAAAAElFTkSuQmCC';

export const WithAdvancedMarkerCustomIcon: Story = {
  args: {
    center: testMapOptions.center,
    zoom: testMapOptions.zoom,
    mapId: 'DEMO_MAP_ID',
  },
  render: (args) => (
    <GoogleMaps {...args}>
      <GoogleMapsAdvancedMarker
        id="advanced-marker-icon"
        isJsApiLoaded={true}
        pos={testMapOptions.center}
        title="Custom Icon Marker"
        onClick={(id) => console.log('Marker clicked:', id)}
      >
        <GoogleMapsAdvancedMarkerContent icon={customIcon} size={{ x: 28, y: 35 }} />
      </GoogleMapsAdvancedMarker>
    </GoogleMaps>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'AdvancedMarker with a custom icon image. Pass the icon URL (data URL or external URL) and size to GoogleMapsAdvancedMarkerContent.',
      },
    },
  },
};
