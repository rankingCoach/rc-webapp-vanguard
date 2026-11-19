import { ComponentType,lazy, Suspense } from 'react';

const WrappedComponentRender = (LazyComponent: ReturnType<typeof lazy>, props: any) => (
    <Suspense fallback={null}>
      <LazyComponent {...props} />
    </Suspense>
  );


export function withLazy<T extends ComponentType<any>>(importFn: () => Promise<{ default: T }>): T {
  const LazyComponent = lazy(importFn);

  const WrappedComponent = WrappedComponentRender.bind(null, LazyComponent);

  return WrappedComponent as T;
}
