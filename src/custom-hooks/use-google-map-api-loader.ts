import { APIKEYS } from '@config/apiKeys';
import { type Libraries, Loader } from '@googlemaps/js-api-loader';
import { useEffect, useRef, useState } from 'react';

/**
 * Must byte-match the options every host app passes to useJsApiLoader
 * (id: 'google-map-script', libraries incl. 'marker' so AdvancedMarkerElement exists).
 * Order matters: @googlemaps/js-api-loader compares options with an
 * order-sensitive deep equal.
 */
const GOOGLE_MAPS_LIBRARIES: Libraries = ['places', 'marker'];

export const useGoogleMapApiLoader = (
  GoogleApiLibrariesToLoad?: any, // DEPRECATED & ignored (kept for call-site compat); libraries are always GOOGLE_MAPS_LIBRARIES
  apiKey: string = APIKEYS.googleMapsApiKey,
  languageCode?: string,
  enabled: boolean = true,
): { isLoaded: boolean; loadError: Error | undefined } => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | undefined>(undefined);

  // Freeze first-render values: the Loader singleton's options are immutable
  // for the page lifetime, so a later render passing a different language
  // must not re-run construction with new options.
  const optionsRef = useRef({ apiKey, language: languageCode });

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    // Script already fully loaded (host app loader, raw <script> tag, or a
    // previous mount) — nothing to do, and no Loader singleton to touch.
    if (typeof window !== 'undefined' && window.google?.maps?.version) {
      setIsLoaded(true);
      return undefined;
    }

    let cancelled = false;

    try {
      // Byte-identical to what @react-google-maps/api's useJsApiLoader would
      // construct (its useMemo normalization + defaultLoadScriptProps), so it
      // deep-equals the Loader options of host apps that use useJsApiLoader
      // with id 'google-map-script' and the same libraries.
      const loader = new Loader({
        id: 'google-map-script',
        apiKey: optionsRef.current.apiKey,
        version: 'weekly',
        libraries: GOOGLE_MAPS_LIBRARIES,
        language: optionsRef.current.language || 'en',
        region: 'US',
        mapIds: [],
        nonce: '',
        authReferrerPolicy: 'origin',
      });

      loader
        .load()
        .then(() => {
          if (!cancelled) {
            setIsLoaded(true);
          }
          return undefined;
        })
        .catch((error: Error) => {
          if (!cancelled) {
            setLoadError(error);
          }
        });
    } catch (error) {
      // A Loader singleton already exists with different options (created by
      // the host app). Degrade to loadError instead of crashing the render.
      setLoadError(error as Error);
    }

    return (): void => {
      cancelled = true;
    };
  }, [enabled]);

  return { isLoaded, loadError };
};
