// Characterizes the InlineSvg mount-effect lifetime so `[]` → `[load]` is shown to change nothing (drafted by B,
// admitted by A). Every expectation is GREEN on the base and on the patch. No real network: a local fetch stub accepts
// only the two synthetic keys below.
import { act, render } from '@testing-library/react';
import React, { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StyledSVG } from './StyledSVG';

const A = '/__fixture__/inline-svg-lifecycle-a.svg';
const B = '/__fixture__/inline-svg-lifecycle-b.svg';
const svg = (marker: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" data-marker="${marker}"><rect width="16" height="16"/></svg>`;

type Deferred = { resolve: () => void; reject: (e: Error) => void };
let pending: Map<string, Deferred[]>;
let starts: string[];

beforeEach(() => {
  pending = new Map();
  starts = [];
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {
      if (url !== A && url !== B) throw new Error(`unexpected fetch ${url}`);
      starts.push(url);
      return new Promise((res, rej) => {
        const d: Deferred = {
          resolve: () =>
            res({
              status: 200,
              headers: { get: () => 'image/svg+xml' },
              text: async () => svg(url === A ? 'A' : 'B'),
            } as unknown as Response),
          reject: rej,
        };
        pending.set(url, [...(pending.get(url) ?? []), d]);
      });
    }),
  );
});
afterEach(() => vi.unstubAllGlobals());

const flush = () => act(async () => {});
const settle = async (url: string, ok: boolean) => {
  const d = pending.get(url)?.shift();
  if (!d) throw new Error(`no pending request for ${url}`);
  await act(async () => (ok ? d.resolve() : d.reject(new Error(`fixture failure ${url}`))));
  await flush();
};

const element = (src: string, onLoad: () => void, onError: () => void, className = 'fixture-svg') => (
  <StyledSVG
    src={src}
    cacheRequests={false}
    className={className}
    width={16}
    color="#2468ac"
    testid="fixture"
    loader={<span data-loader="" />}
    onLoad={onLoad}
    onError={onError}
  >
    <span data-fallback="" />
  </StyledSVG>
);

describe('InlineSvg mount-effect lifetime (characterization for [] → [load])', () => {
  it('T1 one load per mount: rerenders with new callback identities and className start no second request', async () => {
    const onLoad = vi.fn();
    const { container, rerender } = render(element(A, onLoad, vi.fn()));
    await flush();
    expect(starts).toEqual([A]);
    for (let i = 0; i < 3; i++) rerender(element(A, onLoad, vi.fn(), `fixture-svg r${i}`));
    await flush();
    expect(starts).toEqual([A]); // a re-run of the mount effect would not refetch (initialized branch), see T2
    await settle(A, true);
    expect(container.querySelector('svg')?.getAttribute('data-marker')).toBe('A');
    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(onLoad).toHaveBeenCalledWith(A, false);
  });

  it('T2 unmount suppresses a late rejection, even after callback-identity rerenders and IDLE→LOADING', async () => {
    const errors = [vi.fn(), vi.fn(), vi.fn(), vi.fn()];
    const { rerender, unmount } = render(element(A, vi.fn(), errors[0]));
    await flush(); // status is LOADING here: a `[status]` dependency would already have re-run the effect
    for (let i = 1; i < errors.length; i++) rerender(element(A, vi.fn(), errors[i])); // `[handleError]` re-run trigger
    await flush();
    expect(starts).toEqual([A]);
    unmount();
    await settle(A, false);
    for (const e of errors) expect(e).not.toHaveBeenCalled();
  });

  it('T3 READY A→B then unmount while B pending: B rejection is suppressed', async () => {
    const onLoad = vi.fn();
    const onError = vi.fn();
    const { container, rerender, unmount } = render(element(A, onLoad, onError));
    await flush();
    await settle(A, true);
    rerender(element(B, onLoad, onError)); // `[src]` re-run trigger
    await flush();
    expect(starts).toEqual([A, B]); // source-change effect issues B exactly once
    expect(container.querySelector('svg')).toBeNull(); // A removed, B loader shown
    expect(container.querySelector('[data-loader]')).not.toBeNull();
    unmount();
    await settle(B, false);
    expect(onError).not.toHaveBeenCalled();
    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  describe('StrictMode (characterization of CURRENT behavior, not a contract)', () => {
    it('T4 one request per StrictMode mount (observed on base: setup → cleanup → setup replay hits the initialized branch)', async () => {
      render(<StrictMode>{element(A, vi.fn(), vi.fn())}</StrictMode>);
      await flush();
      expect(starts).toEqual([A]);
    });

    it('T5 late rejection after StrictMode unmount (observed on base: onError IS called once — replay left a no-op cleanup)', async () => {
      const onError = vi.fn();
      const { unmount } = render(<StrictMode>{element(A, vi.fn(), onError)}</StrictMode>);
      await flush();
      unmount();
      await settle(A, false);
      // Pins the existing replay defect recorded in the B log ("InlineSvg remaining dependency findings" §3).
      // Pre-existing; changing it is out of scope. [] and [load] must agree.
      expect(onError).toHaveBeenCalledTimes(1);
    });
  });
});

/*
RED / GREEN expectation
1. Lint (scoped, same config): base = 4 InlineSvg useExhaustiveDependencies identities (handleError, src, load,
   status). Patch = 3; only the `load` row disappears. That row is the red → green.
2. This spec: GREEN on base and GREEN on the patch, with identical recorded starts and callback calls. Any difference
   is a stop.
3. Discrimination controls (scratch copy only, never committed): replacing `[]` with each forbidden dependency
   must turn a named test RED. This proves the spec would catch an effect re-run:
   3.1 `[status]`       → T2 red (IDLE→LOADING re-runs setup → no-op cleanup → late onError fires).
   3.2 `[handleError]`  → T2 red (new onError identity re-runs setup).
   3.3 `[src]`          → T3 red (A→B re-runs setup).
   3.4 `[load]`         → all green. load = useCallback(() => {...}, []) over the isActive ref and the stable
       reducer dispatch, so it keeps the same identity for the instance and React 19.2's areHookInputsEqual never
       schedules a re-run. Its stability is pinned by its consequence: an unstable `load` would behave like 3.1/3.2.
4. "Effect runs once per mount" = T1 (single start) + T2/T3 (cleanup still the original one at unmount).
   "Cleanup on unmount and on late resolve" = T2/T3 (late settle after unmount: no callback).
   "StrictMode double mount" = T4/T5. "load identity stable" = 3.4 via the controls.
*/
