import { useMediaQuery as useMuiMediaQuery } from '@mui/material';

export interface UseMediaQueryOptions {
  /** Value returned before the first match (server render / jsdom without matchMedia). Default false. */
  defaultMatches?: boolean;
  /** Read the match synchronously on the first render instead of after mount. Default false. */
  noSsr?: boolean;
  /** Custom matchMedia implementation (e.g. for tests or iframes). */
  matchMedia?: (query: string) => MediaQueryList;
}

/**
 * Subscribes to a CSS media query and returns whether it currently matches.
 * Same semantics as MUI's useMediaQuery for string queries, e.g. useMediaQuery('(min-width:1025px)').
 */
export const useMediaQuery = (query: string, options?: UseMediaQueryOptions): boolean =>
  useMuiMediaQuery(query, options);
