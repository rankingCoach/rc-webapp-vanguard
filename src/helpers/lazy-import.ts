import { ComponentType, lazy, LazyExoticComponent } from 'react';

type ExtractComponent<M, K extends keyof M> = M[K] extends ComponentType<any> ? M[K] : ComponentType<any>;

/**
 * Lazily load a component from a dynamically imported module by export name.
 *
 * The factory returns a real module namespace (`typeof import('...')`) and
 * `name` keys the component export, so a typed `import()` satisfies the
 * signature directly — no `as any` cast at the call site. The named export's
 * prop types are preserved on the returned lazy component.
 */
export const lazyImport = <M, K extends keyof M = keyof M>(
  factory: () => Promise<M>,
  name: K = 'default' as K,
  delay: number = 0,
): LazyExoticComponent<ExtractComponent<M, K>> => {
  return lazy(async () => {
    const resolved = await factory();
    const component = resolved[name];

    if (!component) {
      throw new Error(`Module does not export '${String(name)}'.`);
    }

    return new Promise<{ default: ExtractComponent<M, K> }>((resolve) => {
      setTimeout(() => {
        resolve({ default: component as ExtractComponent<M, K> });
      }, delay);
    });
  });
};
