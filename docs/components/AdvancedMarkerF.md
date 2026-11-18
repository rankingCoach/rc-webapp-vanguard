# AdvancedMarkerF

- Kind: component
- Import: `import { AdvancedMarkerF } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/GoogleMaps/GoogleMapsMarker/AdvancedMarker.tsx`

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `animation` | `google.maps.Animation` | no | Start an animation. Any ongoing animation will be cancelled. Currently supported animations are: BOUNCE, DROP. Passing in null will cause any animation to stop. |
| `children` | `React.ReactNode` | no |  |
| `clickable` | `boolean` | no | If true, the marker receives mouse and touch events. Default value is true. |
| `clusterer` | `Clusterer \| MarkerClusterer` | no | Render prop that handles clustering markers |
| `cursor` | `string` | no | Mouse cursor to show on hover |
| `draggable` | `boolean` | no | If true, the marker can be dragged. Default value is false. |
| `icon` | `string \| google.maps.Icon \| google.maps.Symbol` | no | Icon for the foreground. If a string is provided, it is treated as though it were an Icon with the string as url. |
| `label` | `string \| google.maps.MarkerLabel` | no | Adds a label to the marker. The label can either be a string, or a MarkerLabel object. |
| `noClustererRedraw` | `boolean` | no | Clusters are redrawn when a Marker is added unless noClustererRedraw? is set to true. |
| `onAnimationChanged` | `() => void` | no | This event is fired when the marker's animation property changes. |
| `onClick` | `(e: google.maps.MapMouseEvent) => void` | no | This event is fired when the marker icon was clicked. |
| `onClickableChanged` | `() => void` | no | This event is fired when the marker's clickable property changes. |
| `onCursorChanged` | `() => void` | no | This event is fired when the marker's cursor property changes. |
| `onDblClick` | `(e: google.maps.MapMouseEvent) => void` | no | This event is fired when the marker icon was double clicked. |
| `onDrag` | `(e: google.maps.MapMouseEvent) => void` | no | This event is repeatedly fired while the user drags the marker. |
| `onDragEnd` | `(e: google.maps.MapMouseEvent) => void` | no | This event is fired when the user stops dragging the marker. |
| `onDraggableChanged` | `() => void` | no | This event is fired when the marker's draggable property changes. |
| `onDragStart` | `(e: google.maps.MapMouseEvent) => void` | no | This event is fired when the user starts dragging the marker. |
| `onFlatChanged` | `() => void` | no | This event is fired when the marker's flat property changes. |
| `onIconChanged` | `() => void` | no | This event is fired when the marker icon property changes. |
| `onLoad` | `(marker: google.maps.marker.AdvancedMarkerElement) => void` | no | This callback is called when the marker instance has loaded. It is called with the marker instance. |
| `onMouseDown` | `(e: google.maps.MapMouseEvent) => void` | no | This event is fired for a mousedown on the marker. |
| `onMouseOut` | `(e: google.maps.MapMouseEvent) => void` | no | This event is fired when the mouse leaves the area of the marker icon. |
| `onMouseOver` | `(e: google.maps.MapMouseEvent) => void` | no | This event is fired when the mouse enters the area of the marker icon. |
| `onMouseUp` | `(e: google.maps.MapMouseEvent) => void` | no | This event is fired for a mouseup on the marker. |
| `onPositionChanged` | `() => void` | no | This event is fired when the marker position property changes. |
| `onRightClick` | `(e: google.maps.MapMouseEvent) => void` | no | This event is fired for a rightclick on the marker. |
| `onShapeChanged` | `() => void` | no | This event is fired when the marker's shape property changes. |
| `onTitleChanged` | `() => void` | no | This event is fired when the marker title property changes. |
| `onUnmount` | `(marker: google.maps.marker.AdvancedMarkerElement) => void` | no | This callback is called when the component unmounts. It is called with the marker instance. |
| `onVisibleChanged` | `() => void` | no | This event is fired when the marker's visible property changes. |
| `onZindexChanged` | `() => void` | no | This event is fired when the marker's zIndex property changes. |
| `opacity` | `number` | no | The marker's opacity between 0.0 and 1.0. |
| `options` | `google.maps.marker.AdvancedMarkerElementOptions` | no |  |
| `position` | `google.maps.LatLng \| google.maps.LatLngLiteral` | yes | Marker position. |
| `shape` | `google.maps.MarkerShape` | no | Image map region definition used for drag/click. |
| `title` | `string` | no | Rollover text |
| `visible` | `boolean` | no | If true, the marker is visible |
| `zIndex` | `number` | no | All markers are displayed on the map in order of their zIndex, with higher values displaying in front of markers with lower values. By default, markers are displayed according to their vertical position on screen, with lower markers appearing in front of markers further up the screen. |
