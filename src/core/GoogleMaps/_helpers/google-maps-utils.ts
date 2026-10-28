import { rcWindow } from '@stores/window.store';

/**
 * The Maps JS script can be present without the `marker` library loaded.
 * Guard AdvancedMarkerElement construction so callers render nothing instead of crashing.
 **/
export function isAdvancedMarkerElementAvailable(): boolean {
  return Boolean(rcWindow.google?.maps?.marker?.AdvancedMarkerElement);
}

/**
 * Handy functions to project lat/lng to pixel
 * Extracted from: https://developers.google.com/maps/documentation/javascript/examples/map-coordinates
 **/
function project(latLng: google.maps.LatLng) {
  const TILE_SIZE = 256;

  let siny = Math.sin((latLng.lat() * Math.PI) / 180);

  // Truncating to 0.9999 effectively limits latitude to 89.189. This is
  // about a third of a tile past the edge of the world tile.
  siny = Math.min(Math.max(siny, -0.9999), 0.9999);

  return new google.maps.Point(
    TILE_SIZE * (0.5 + latLng.lng() / 360),
    TILE_SIZE * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI)),
  );
}

/**
 * Handy functions to project lat/lng to pixel
 * Extracted from: https://developers.google.com/maps/documentation/javascript/examples/map-coordinates
 **/
function getPixel(latLng: google.maps.LatLng, zoom: number = 0) {
  const scale = 1 << zoom;
  const worldCoordinate = project(latLng);
  return new google.maps.Point(Math.floor(worldCoordinate.x * scale), Math.floor(worldCoordinate.y * scale));
}

/**
 * Given a map, return the map dimension (width and height)
 * in pixels.
 **/
function getMapDimenInPixels(map: google.maps.Map) {
  const zoom = map.getZoom();
  const bounds = map.getBounds();
  if (!bounds) {
    return;
  }
  const southWestPixel = getPixel(bounds.getSouthWest(), zoom);
  const northEastPixel = getPixel(bounds.getNorthEast(), zoom);
  if (!southWestPixel || !northEastPixel) {
    throw new Error('No coords to zoom to');
    // return {
    //   width: 0,
    //   height:0,
    // }
  }
  return {
    width: Math.abs(southWestPixel.x - northEastPixel.x),
    height: Math.abs(southWestPixel.y - northEastPixel.y),
  };
}

/**
 * Given a map and a destLatLng returns true if calling
 * map.panTo(destLatLng) will be smoothly animated or false
 * otherwise.
 *
 * optionalZoomLevel can be optionally be provided and if so
 * returns true if map.panTo(destLatLng) would be smoothly animated
 * at optionalZoomLevel.
 **/
function willAnimatePanTo(map: google.maps.Map, destLatLng: google.maps.LatLng, optionalZoomLevel?: number) {
  const dimen = getMapDimenInPixels(map);

  const mapCenter = map.getCenter();
  if (!mapCenter || !dimen) {
    return;
  }
  optionalZoomLevel = !!optionalZoomLevel ? optionalZoomLevel : map.getZoom();

  const destPixel = getPixel(destLatLng, optionalZoomLevel);
  const mapPixel = getPixel(mapCenter, optionalZoomLevel);
  if (!destPixel || !mapPixel) {
    throw new Error('cannot determine pizels');
  }
  const diffX = Math.abs(destPixel.x - mapPixel.x);
  const diffY = Math.abs(destPixel.y - mapPixel.y);

  return diffX < dimen.width && diffY < dimen.height;
}

/**
 * Returns the optimal zoom value when animating
 * the zoom out.
 *
 * The maximum change will be currentZoom - 3.
 * Changing the zoom with a difference greater than
 * 3 levels will cause the map to "jump" and not
 * smoothly animate.
 *
 * Unfortunately the magical number "3" was empirically
 * determined as we could not find any official docs
 * about it.
 **/
function getOptimalZoomOut(map: google.maps.Map, latLng: google.maps.LatLng, currentZoom: number) {
  if (willAnimatePanTo(map, latLng, currentZoom - 1)) {
    return currentZoom - 1;
  } else if (willAnimatePanTo(map, latLng, currentZoom - 2)) {
    return currentZoom - 2;
  } else {
    return currentZoom - 3;
  }
}

/**
 * Given a map and a destLatLng, smoothly animates the map center to
 * destLatLng by zooming out until distance (in pixels) between map center
 * and destLatLng are less than map width and height, then panTo to destLatLng
 * and finally animate to restore the initial zoom.
 *
 * optionalAnimationEndCallback can be optionally be provided and if so
 * it will be called when the animation ends
 **/
export function smoothlyAnimatePanToWorkarround(
  map: google.maps.Map,
  destLatLng: google.maps.LatLng,
  optionalAnimationEndCallback?: () => void,
) {
  const initialZoom = map.getZoom() ?? 0;
  let listener: any;

  if (!map) {
    return;
  }

  function zoomIn() {
    if (!map) {
      return;
    }
    const zoom = map.getZoom() ?? 0;

    if (zoom < initialZoom) {
      map.setZoom(Math.min(zoom + 3, initialZoom));
    } else {
      google.maps.event.removeListener(listener);

      //here you should (re?)enable only the ui controls that make sense to your app
      map.setOptions({ draggable: true, zoomControl: true, scrollwheel: true, disableDoubleClickZoom: false });

      if (!!optionalAnimationEndCallback) {
        optionalAnimationEndCallback();
      }
    }
  }

  function zoomOut() {
    if (!map) {
      return;
    }
    if (willAnimatePanTo(map, destLatLng)) {
      google.maps.event.removeListener(listener);
      listener = google.maps.event.addListener(map, 'idle', zoomIn);
      map.panTo(destLatLng);
    } else {
      if (map) {
        map.setZoom(getOptimalZoomOut(map, destLatLng, map.getZoom() ?? 0));
      }
    }
  }

  if (!map) {
    return;
  }

  //here you should disable all the ui controls that your app uses
  map.setOptions({ draggable: false, zoomControl: false, scrollwheel: false, disableDoubleClickZoom: true });
  map.setZoom(getOptimalZoomOut(map, destLatLng, initialZoom ?? 0));
  listener = google.maps.event.addListener(map, 'idle', zoomOut);
}

export function smoothlyAnimatePanTo(map: google.maps.Map, destLatLng: google.maps.LatLng) {
  if (willAnimatePanTo(map, destLatLng)) {
    map.panTo(destLatLng);
  } else {
    smoothlyAnimatePanToWorkarround(map, destLatLng);
  }
}
