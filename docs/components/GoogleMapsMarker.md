# GoogleMapsMarker

Custom marker component for Google Maps that supports custom icons and info windows.

- Kind: component
- Import: `import { GoogleMapsMarker } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/GoogleMaps/GoogleMapsMarker/GoogleMapsMarker.tsx`
- Keywords: marker, map, google-maps, pin, info-window, location

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `children` | `React.ReactNode` | no |  |
| `clusterer` | `Clusterer` | no |  |
| `disableAutoPan` | `boolean` | no |  |
| `draggable` | `boolean` | no |  |
| `icon` | `string` | yes |  |
| `id` | `string` | yes |  |
| `isJsApiLoaded` | `boolean` | yes |  |
| `markerRef` | `React.MutableRefObject<Marker>` | no |  |
| `onClick` | `(id: string) => void` | no |  |
| `onCloseClick` | `() => void` | no |  |
| `onDragEnd` | `(e: google.maps.MapMouseEvent) => void` | no |  |
| `onMouseOut` | `(e: google.maps.MapMouseEvent) => void` | no |  |
| `onMouseOver` | `(e: google.maps.MapMouseEvent) => void` | no |  |
| `pos` | `{ lat: number; lng: number; }` | yes |  |
| `showInfoBox` | `boolean` | yes |  |
| `size` | `{ x: number; y: number; }` | yes |  |
| `zIndex` | `number` | no |  |
