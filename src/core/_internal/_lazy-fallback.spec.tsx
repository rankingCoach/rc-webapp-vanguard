import { act, render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { lazyFallback } from './lazy-fallback';

/**
 * Plan §36.2 B.3 lazy boundary: before the module loads the first render suspends (renders nothing) and the content
 * appears once loaded; after loading (or after preload) every render is synchronous.
 */
describe('lazyFallback', () => {
  it('first use suspends, then renders the loaded component', async () => {
    let resolve: (m: { default: (p: { label: string }) => React.ReactElement }) => void = () => undefined;
    const Fallback = lazyFallback(
      () =>
        new Promise<{ default: (p: { label: string }) => React.ReactElement }>((r) => {
          resolve = r;
        }),
    );
    const view = render(<Fallback label="first" />);
    expect(view.container.textContent).toBe('');
    await act(async () => {
      resolve({ default: ({ label }) => <span>{label}</span> });
    });
    expect(view.container.textContent).toBe('first');
    view.rerender(<Fallback label="second" />);
    expect(view.container.textContent).toBe('second');
  });

  it('a loaded fallback renders synchronously on a fresh mount', async () => {
    const Fallback = lazyFallback(async () => ({ default: ({ label }: { label: string }) => <b>{label}</b> }));
    const first = render(<Fallback label="x" />);
    await act(async () => {
      await Promise.resolve();
    });
    first.unmount();
    const view = render(<Fallback label="sync" />);
    expect(view.container.innerHTML).toBe('<b>sync</b>');
  });

  it('module mode (WordPress build: inlined fallback) renders synchronously on the first mount', () => {
    const Fallback = lazyFallback({ default: ({ label }: { label: string }) => <i>{label}</i> });
    const view = render(<Fallback label="inline" />);
    expect(view.container.innerHTML).toBe('<i>inline</i>');
  });
});
