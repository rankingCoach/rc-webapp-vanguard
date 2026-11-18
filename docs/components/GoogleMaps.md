# GoogleMaps

Wrapper component for rendering Google Maps instances with markers, overlays and utility methods.

- Kind: component
- Import: `import { GoogleMaps } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/GoogleMaps/GoogleMaps.tsx`
- Keywords: google, maps, map, marker, overlay, geo, location

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `apiKey` | `string` | no |  |
| `isJsApiLoaded` | `boolean` | no |  |
| `languageCode` | `string` | no |  |
| `mapId` | `string \| boolean` | no |  |
| `onLoad` | `((map: google.maps.Map) => void \| Promise<void>) & ((map: google.maps.Map) => void \| …` | no | This callback is called when the map instance has loaded. It is called with the map instance. |
| `options` | `Omit<google.maps.MapOptions, "styles" \| "mapId">` | no |  |
| `testId` | `string` | no |  |
| `theme` | `"default" \| "blackWhite" \| "blackWhiteNoPoi" \| "coloured"` | no |  |

Also accepts: 33 other (not listed).

## Examples

From `src/core/GoogleMaps/stories/BlackWhite.story.tsx`:

```tsx
import React from "react";
import { GoogleMaps } from "../GoogleMaps";
import { Story, testMapOptions } from "./_GoogleMaps.default";

export const BlackWhite: Story = {
  args: {
    theme: "blackWhite",
    center: testMapOptions.center,
    zoom: testMapOptions.zoom,
  },
  parameters: {
    docs: {
      description: {
        story: "Google Maps component with black and white theme.",
      },
    },
  },
};
```

From `src/core/GoogleMaps/stories/BlackWhiteNoPoi.story.tsx`:

```tsx
import React from "react";
import { GoogleMaps } from "../GoogleMaps";
import { Story, testMapOptions } from "./_GoogleMaps.default";

export const BlackWhiteNoPoi: Story = {
  args: {
    theme: "blackWhiteNoPoi",
    center: testMapOptions.center,
    zoom: testMapOptions.zoom,
  },
  parameters: {
    docs: {
      description: {
        story: "Google Maps component with black and white theme without points of interest.",
      },
    },
  },
};
```
