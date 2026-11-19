// Ported from @mui/system@9.5.0 useMediaQuery/useMediaQuery.js (MIT)
import { useCallback, useMemo, useSyncExternalStore } from 'react';

export interface UseMediaQueryOptions {
  /** Value returned before the first match (server render / jsdom without matchMedia). Default false. */
  defaultMatches?: boolean;
  /** Read the match synchronously on the first render instead of after mount. Default false. */
  noSsr?: boolean;
  /** Custom matchMedia implementation (e.g. for tests or iframes). */
  matchMedia?: (query: string) => MediaQueryList;
}

const noopSubscribe = () => () => {};

/**
 * Subscribes to a CSS media query and returns whether it currently matches.
 * Same semantics as MUI's useMediaQuery for string queries, e.g. useMediaQuery('(min-width:1025px)'): a leading
 * `@media ` is stripped; without matchMedia (SSR, old jsdom) the value is `defaultMatches`.
 */
export const useMediaQuery = (queryInput: string, options: UseMediaQueryOptions = {}): boolean => {
  const { defaultMatches = false, matchMedia: customMatchMedia, noSsr = false } = options;
  const supportMatchMedia = typeof window !== 'undefined' && typeof window.matchMedia !== 'undefined';
  const matchMedia = useMemo(() => {
    if (customMatchMedia !== undefined) return customMatchMedia;
    return supportMatchMedia ? window.matchMedia.bind(window) : null;
  }, [customMatchMedia, supportMatchMedia]);
  const query = queryInput.replace(/^@media( ?)/m, '');

  const getDefaultSnapshot = useCallback(() => defaultMatches, [defaultMatches]);
  const getServerSnapshot = useMemo(() => {
    if (noSsr && matchMedia) return () => matchMedia(query).matches;
    return getDefaultSnapshot;
  }, [getDefaultSnapshot, query, noSsr, matchMedia]);
  const [getSnapshot, subscribe] = useMemo((): [() => boolean, (notify: () => void) => () => void] => {
    if (matchMedia === null) return [getDefaultSnapshot, noopSubscribe];
    const mediaQueryList = matchMedia(query);
    return [
      () => mediaQueryList.matches,
      (notify) => {
        mediaQueryList.addEventListener('change', notify);
        return () => mediaQueryList.removeEventListener('change', notify);
      },
    ];
  }, [getDefaultSnapshot, matchMedia, query]);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
