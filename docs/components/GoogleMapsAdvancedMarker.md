# GoogleMapsAdvancedMarker

- Kind: component
- Import: `import { GoogleMapsAdvancedMarker } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/GoogleMaps/GoogleMapsAdvancedMarker/GoogleMapsAdvancedMarker.tsx`

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `children` | `React.ReactNode` | no | Content rendered inside the AdvancedMarkerElement via React portal. Use GoogleMapsAdvancedMarkerContent for a default pin, or provide custom HTML. Absolutely-positioned children (e.g. info overlays) won't affect the marker anchor. |
| `draggable` | `boolean` | no | If true, the marker can be dragged |
| `id` | `string` | yes | Unique identifier for the marker |
| `isJsApiLoaded` | `boolean` | no | Indicates if Google Maps JavaScript API is loaded. An explicit `false` skips marker construction; omitting it falls back to the internal `window.google.maps.marker` existence check alone. |
| `onClick` | `(id: string) => void` | no | Callback when marker is clicked, receives marker ID |
| `onDragEnd` | `(e: google.maps.MapMouseEvent) => void` | no | Callback when user stops dragging the marker |
| `onMouseOut` | `(e: google.maps.MapMouseEvent) => void` | no | Callback when mouse leaves marker area |
| `onMouseOver` | `(e: google.maps.MapMouseEvent) => void` | no | Callback when mouse enters marker area |
| `pos` | `{ lat: number; lng: number; }` | yes | Marker position coordinates |
| `title` | `string` | no | Rollover text displayed on hover |
| `zIndex` | `number` | no | Z-index for marker layering |
