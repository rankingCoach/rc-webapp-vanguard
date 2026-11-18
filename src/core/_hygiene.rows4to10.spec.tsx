import { act, render } from '@test-utils/test-utils';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ActionBar } from './ActionBar/ActionBar';
import { AnimatedNumber } from './AnimatedNumber/AnimatedNumber';
import { FadeCarouselAuto } from './FadeCarouselAuto/FadeCarouselAuto';
import { FadedCarousel } from './FadedCarousel/FadedCarousel';
import { saveCsvFile } from './Table/TableToolbar/table-toolbar-data';
import { Tabs } from './Tabs/Tabs';

/** Leak hygiene (track d), rows 4–10 of the inventory: these already clean up; the specs pin it. */
const balance = (target: object, add: string, remove: string, type?: string) => {
  const a = vi.spyOn(target as never, add as never) as unknown as { mock: { calls: unknown[][] } };
  const r = vi.spyOn(target as never, remove as never) as unknown as { mock: { calls: unknown[][] } };
  const of = (c: { mock: { calls: unknown[][] } }) =>
    c.mock.calls.filter(([t]) => type === undefined || t === type).length;
  return () => of(a) - of(r);
};

describe('cleanup on unmount (rows 4–10)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('ActionBar removes its window resize listener', () => {
    const active = balance(window, 'addEventListener', 'removeEventListener', 'resize');
    const { unmount } = render(
      <ActionBar show={true} templateProps={{ template: 'message', type: 'info', description: 'x' } as never} />,
    );
    unmount();
    expect(active()).toBe(0);
  });

  it('AnimatedNumber leaves no timer and no animation frame', () => {
    vi.useFakeTimers();
    const frames = balance(window, 'requestAnimationFrame', 'cancelAnimationFrame');
    const { unmount, rerender } = render(<AnimatedNumber value={10} />);
    rerender(<AnimatedNumber value={20} />);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(frames()).toBeLessThanOrEqual(0);
  });

  it('FadeCarouselAuto clears its interval', () => {
    vi.useFakeTimers();
    const { unmount } = render(
      <FadeCarouselAuto items={[{ label: 'a' }, { label: 'b' }]} ItemType={({ label }: { label: string }) => <span>{label}</span>} speed={1} />,
    );
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('FadedCarousel removes its scroll listener', () => {
    const add = vi.spyOn(HTMLDivElement.prototype, 'addEventListener');
    const remove = vi.spyOn(HTMLDivElement.prototype, 'removeEventListener');
    const items = ['a', 'b', 'c'].map((id) => <span key={id}>{id}</span>);
    const { container, unmount, rerender } = render(<FadedCarousel items={items} />);
    rerender(<FadedCarousel items={items.slice(0, 2)} />);
    unmount();
    // React's own root listener (registered on the render container) stays until the test cleanup; ignore it.
    const own = (spy: typeof add) =>
      spy.mock.calls.filter(([type], i) => type === 'scroll' && spy.mock.contexts[i] !== container).length;
    expect(own(add)).toBeGreaterThan(0);
    expect(own(add) - own(remove)).toBe(0);
  });

  it('Tabs disconnects observers and removes window listeners', () => {
    const disconnect = vi.fn();
    const observers: string[] = [];
    class FakeObserver {
      constructor(_cb: unknown) {
        observers.push('obs');
      }
      observe() {}
      disconnect() {
        disconnect();
      }
    }
    vi.stubGlobal('ResizeObserver', FakeObserver);
    vi.stubGlobal('MutationObserver', FakeObserver);
    const resize = balance(window, 'addEventListener', 'removeEventListener', 'resize');
    const { unmount } = render(<Tabs theme={'floating'} tabs={[{ label: 'One' }, { label: 'Two' }]} />);
    unmount();
    expect(disconnect).toHaveBeenCalledTimes(observers.length);
    expect(resize()).toBe(0);
    vi.unstubAllGlobals();
  });

  it('saveCsvFile leaves no link in the body and revokes the object URL', () => {
    const revoke = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL: () => 'blob:x', revokeObjectURL: revoke });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const before = document.body.querySelectorAll('a').length;
    act(() => saveCsvFile('a,b', 'report'));
    expect(document.body.querySelectorAll('a').length).toBe(before);
    expect(revoke).toHaveBeenCalledWith('blob:x');
    vi.unstubAllGlobals();
  });
});
