import { useEffect, useState } from 'react';
import { of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';

export type DynamicRequestOpts = {
  shouldRequest?: boolean;
};

// Dynamically import all bundled assets (eager: false)
const assets = (import.meta.env.WORDPRESS_BUILD as boolean)
  ? {
      // For WordPress, include only icons and loading assets
      ...import.meta.glob('./assets/icons/**/*.*', { eager: false, query: '?url', import: 'default' }),
      ...import.meta.glob('./assets/**/loading.gif', { eager: false, query: '?url', import: 'default' }),
    }
  : import.meta.glob('./assets/**/*.*', { eager: false, query: '?url', import: 'default' });

// Global cache and observable map
const cache = new Map<string, string>();
const observables = new Map<string, any>();

async function getAssetUrl(assetName: string): Promise<string | undefined> {
  const assetKey = Object.keys(assets).find((key) => key.endsWith(`/assets/${assetName}`));
  if (!assetKey) return undefined;

  // Dynamically load asset
  const assetLoader = assets[assetKey];
  return assetLoader ? ((await assetLoader()) as string) : undefined;
}

function fetchSvgIcon(path: string) {
  if (!observables.has(path)) {
    const observable = of(path).pipe(
      catchError(() => of('')),
      shareReplay(1),
    );
    //console.log("FETCHING PATH:", path);
    observables.set(path, observable);
  }
  return observables.get(path);
}

export type SVGObject = {
  error: Error | null;
  loading: boolean;
  SvgIcon: string | '';
};

export const useDynamicImport = (assetName: string, opts: DynamicRequestOpts = { shouldRequest: true }): SVGObject => {
  const [state, setState] = useState<SVGObject>({
    error: null,
    loading: true,
    SvgIcon: '',
  });

  useEffect(() => {
    if (!opts.shouldRequest) return;

    let cancelled = false;
    let subscription: { unsubscribe(): void } | undefined;

    const resolvedAssetName = assetName.includes('assets/ads')
      ? // Adjust asset name for ads to avoid errors
        assetName.replace('assets/ads', 'assets/ads_')
      : assetName;

    const cachedSvgIcon = cache.get(resolvedAssetName);
    if (cachedSvgIcon) {
      setState({ error: null, loading: false, SvgIcon: cachedSvgIcon });
      return;
    }

    getAssetUrl(resolvedAssetName)
      .then((path) => {
        if (cancelled) return;
        if (!path) {
          console.error(`useDynamicImport: Asset not found: ${resolvedAssetName}`);
          setState({ error: new Error('Asset not found'), loading: false, SvgIcon: '' });
          return;
        }

        subscription = fetchSvgIcon(path).subscribe({
          next: (svgUrl: string) => {
            //console.log("SVG URL FETCHED:", svgUrl);
            cache.set(resolvedAssetName, svgUrl);
            if (!cancelled) setState({ error: null, loading: false, SvgIcon: svgUrl });
          },
          error: (err: unknown) => {
            console.error(`useDynamicImport: Failed to load asset: ${resolvedAssetName}`, err);
            if (!cancelled) setState({ error: new Error('Failed to load asset'), loading: false, SvgIcon: '' });
          },
        });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(`useDynamicImport: Failed to get asset URL: ${resolvedAssetName}`, err);
        setState({ error: new Error('Failed to load asset'), loading: false, SvgIcon: '' });
      });

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, [assetName, opts.shouldRequest]);

  return state;
};
