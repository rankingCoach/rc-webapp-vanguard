import React, { type ComponentType, Suspense } from 'react';

/**
 * Plan §36.2 B.3: a MUI fallback route behind a lazy boundary, so the eager import graph of the public export stays
 * free of `@mui/*`. The module loads on the first render that needs it; until then that render suspends (renders
 * nothing) — acceptable only because these routes are unreachable in rc-webapp (props it never passes). Once loaded
 * every later render is synchronous and renders exactly what the MUI route rendered before.
 *
 * `preloadMuiFallbacks()` loads every registered fallback (spec setup, so the existing MUI contract specs run against
 * the same DOM without awaiting the chunk).
 */
const registry: (() => Promise<void>)[] = [];

export const lazyFallback = <P extends object>(load: () => Promise<{ default: ComponentType<P> }>) => {
  let Loaded: ComponentType<P> | null = null;
  let pending: Promise<void> | null = null;
  const preload = () => {
    pending ??= load().then((module) => {
      Loaded = module.default;
    });
    return pending;
  };
  registry.push(preload);
  const Inner = (props: P) => {
    if (Loaded) return <Loaded {...props} />;
    throw preload();
  };
  const Fallback = (props: P) =>
    Loaded ? (
      <Loaded {...props} />
    ) : (
      <Suspense fallback={null}>
        <Inner {...props} />
      </Suspense>
    );
  return Fallback;
};

export const preloadMuiFallbacks = () => Promise.all(registry.map((preload) => preload()));
