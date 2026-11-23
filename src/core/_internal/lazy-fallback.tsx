import React, { type ComponentType, Suspense } from 'react';

/**
 * Plan §36.2 B.3: a MUI fallback route behind a lazy boundary, so the eager import graph of the public export stays
 * free of `@mui/*`. The module loads on the first render that needs it; until then that render suspends (renders
 * nothing) — acceptable only because these routes are unreachable in rc-webapp (props it never passes). Once loaded
 * every later render is synchronous and renders exactly what the MUI route rendered before.
 *
 * Tests and stories that exercise a fallback deliberately can call `preloadMuiFallbacks()` to load the registered
 * routes before rendering. The gate allow-lists those files.
 */
const registry: (() => Promise<void>)[] = [];

type FallbackModule<P> = { default: ComponentType<P> };
type FallbackRoute<P> = {
  readLoaded: () => ComponentType<P> | null;
  preload: () => Promise<void>;
};

function renderInner<P extends object>(route: FallbackRoute<P>, props: P) {
  const Loaded = route.readLoaded();
  if (Loaded) return <Loaded {...props} />;
  throw route.preload();
}

function renderFallback<P extends object>(route: FallbackRoute<P>, Inner: ComponentType<P>, props: P) {
  const Loaded = route.readLoaded();
  return Loaded ? (
    <Loaded {...props} />
  ) : (
    <Suspense fallback={null}>
      <Inner {...props} />
    </Suspense>
  );
}

/**
 * `load` is the lazy loader (`() => import('./XFallback')`). The WordPress build passes the module itself instead
 * (config/inline-mui-fallbacks.ts rewrites the import to a static one): WordPress keeps its fallbacks inline and
 * synchronous (watchdog B.5), since its cleanup keeps no other chunks.
 */
export const lazyFallback = <P extends object>(load: (() => Promise<FallbackModule<P>>) | FallbackModule<P>) => {
  let Loaded: ComponentType<P> | null = typeof load === 'function' ? null : load.default;
  let pending: Promise<void> | null = null;
  const preload = () => {
    if (typeof load !== 'function') return Promise.resolve();
    pending ??= load().then((module) => {
      Loaded = module.default;
    });
    return pending;
  };
  registry.push(preload);
  const route = { readLoaded: () => Loaded, preload };
  const Inner = (renderInner<P>).bind(null, route);
  return (renderFallback<P>).bind(null, route, Inner);
};

export const preloadMuiFallbacks = () => Promise.all(registry.map((preload) => preload()));
