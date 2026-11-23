import { act, render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { lazyFallback } from './lazy-fallback';

const SharedFallback = ({ label }: { label: string }) => <span>{label}</span>;

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

  it('deduplicates cold mounts and keeps distinct routes stable on the warm branch', async () => {
    const module = { default: SharedFallback };
    let resolve!: (value: typeof module) => void;
    const pending = new Promise<typeof module>((done) => {
      resolve = done;
    });
    const load = vi.fn(() => pending);
    const Route = lazyFallback(load);
    const OtherRoute = lazyFallback(module);
    const view = render(
      <>
        <Route label="First cold" />
        <Route label="Second cold" />
      </>,
    );
    expect(view.container.textContent).toBe('');
    expect(load).toHaveBeenCalledTimes(1);
    await act(async () => resolve(module));
    expect(view.container.textContent).toBe('First coldSecond cold');

    // Establish the direct loaded branch before taking a node identity witness.
    view.rerender(<Route label="Warm" />);
    const warmNode = view.getByText('Warm');
    view.rerender(<Route label="Still warm" />);
    expect(view.getByText('Still warm')).toBe(warmNode);

    view.rerender(<OtherRoute label="Other route" />);
    expect(view.getByText('Other route')).not.toBe(warmNode);
    expect(load).toHaveBeenCalledTimes(1);
  });
});
