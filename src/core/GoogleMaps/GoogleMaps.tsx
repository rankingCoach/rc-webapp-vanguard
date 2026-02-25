import './GoogleMaps.scss';

import { useGoogleMapApiLoader } from '@custom-hooks/use-google-map-api-loader';
import { GoogleMap, GoogleMapProps } from '@react-google-maps/api';
import {
  googleMapBlackWhiteTheme,
  googleMapBlackWhiteTheme_NoPoi,
} from '@vanguard/GoogleMaps/_themes/GoogleMapBlackWhiteTheme';
import { googleMapColouredTheme } from '@vanguard/GoogleMaps/_themes/GoogleMapColouredTheme';
import { Render } from '@vanguard/Render/Render';
import React, { useState } from 'react';

import { ComponentContainer } from '@vanguard/ComponentContainer';
import { MapContext } from './map-context';

/**
 * Props
 */
export type GoogleMapsProps = {
  apiKey?: string; // Google Maps API key - if not provided, will use default from config
  isJsApiLoaded?: boolean; // you can preload Google JS API before. See: useJsApiLoader() - takes precedence over apiKey
  theme?: 'default' | 'blackWhite' | 'blackWhiteNoPoi' | 'coloured';
  testId?: string;
  onLoad?: ((map: google.maps.Map) => void | Promise<void>) | undefined;
  mapId?: boolean | string;
} & GoogleMapProps;

const DEFAULT_MAP_ID = 'fb831772aadb7781';

/**
 * Google Maps Component
 *
 * Documentation: https://react-google-maps-api-docs.netlify.app/
 * ---------------------------------------------------------------------------------------------------------------------
 */
export const GoogleMaps = (props: GoogleMapsProps) => {
  const {
    apiKey,
    isJsApiLoaded: externalIsJsApiLoaded,
    theme = 'default',
    testId = 'presence-insights-competitors-map-google-itself-textid',
    onLoad,
    mapId,
    children,
  } = props;

  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

  // Load Google Maps API internally if apiKey is provided and external loading is not used
  const { isLoaded: internalIsJsApiLoaded } = useGoogleMapApiLoader([], apiKey);

  // Use external loading if provided, otherwise use internal loading
  const isJsApiLoaded = externalIsJsApiLoaded !== undefined ? externalIsJsApiLoaded : internalIsJsApiLoaded;

  const onLoadFn = (map: google.maps.Map) => {
    setMapInstance(map);
    onLoad && onLoad(map);
  };

  /**
   * Get theme base on 'theme' prop
   */
  function getTheme() {
    if (mapId) {
      return null;
    }
    switch (theme) {
      case 'coloured':
        return googleMapColouredTheme;
      case 'blackWhite':
        return googleMapBlackWhiteTheme;
      case 'blackWhiteNoPoi':
        return googleMapBlackWhiteTheme_NoPoi;
      case 'default':
      default:
        return null; // Default Google Maps styles will be applied
    }
  }

  /**
   * Render view
   */
  return (
      <ComponentContainer data-testid={testId} className={'GoogleMaps-container'}>
        <Render if={isJsApiLoaded}>
          <GoogleMap
              {...props}
              onLoad={onLoadFn}
              mapContainerStyle={{
                width: '100%',
                height: '100%',
              }}
              options={{
                gestureHandling: 'greedy',
                ...props.options,
                styles: getTheme(),
                mapId: typeof mapId === 'string' ? mapId : mapId === true ? DEFAULT_MAP_ID : undefined,
              }}
          >
            {mapInstance !== null ? <MapContext.Provider value={mapInstance}>{children}</MapContext.Provider> : null}
          </GoogleMap>
        </Render>
      </ComponentContainer>
  );
};
