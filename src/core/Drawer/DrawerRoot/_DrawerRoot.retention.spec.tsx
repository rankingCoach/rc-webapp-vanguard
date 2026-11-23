import '@testing-library/jest-dom/vitest';

import { PUB_SUB_EVENTS, pubSubService } from '@helpers/pub-sub';
import { OverlayStackingService } from '@vanguard/OverlayStacking/OverlayStackingService';
import { act, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { setFlagsFromString } from 'node:v8';
import { runInNewContext } from 'node:vm';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DrawerService } from '../DrawerService';
import { DrawerRoot } from './DrawerRoot';

/**
 * Tier P (V2) measured a pre-existing DrawerService leak, the same on .472 and the final candidate: every
 * open → Escape cycle leaves the closed drawer's DOM reachable from JS (+118 nodes, +9 listeners per cycle).
 * This spec drives the same service path and checks, after N cycles, that closed drawers can be collected and that
 * nothing the service or root registers per open is kept: listeners on window/document/body, the overlay ledger,
 * and the published open payloads (which carry the drawer's React element).
 */
const CYCLES = 8;
type Internals = { events: Record<string, { _buffer?: unknown[] }> };
const openPayloads = () =>
  (pubSubService as unknown as Internals).events[PUB_SUB_EVENTS.reactDrawerOpen]?._buffer?.length ?? 0;
const ledgerSize = () => (OverlayStackingService as unknown as { order: Map<string, number> }).order.size;

const listenerBalance = () => {
  const spies = [window, document, document.body].map((target, i) => ({
    name: ['window', 'document', 'body'][i],
    add: vi.spyOn(target, 'addEventListener'),
    remove: vi.spyOn(target, 'removeEventListener'),
  }));
  const balance = new Map<string, number>();
  const read = () => {
    for (const { name, add, remove } of spies) {
      for (const [type] of add.mock.calls) balance.set(`${name}:${type}`, (balance.get(`${name}:${type}`) ?? 0) + 1);
      for (const [type] of remove.mock.calls) balance.set(`${name}:${type}`, (balance.get(`${name}:${type}`) ?? 0) - 1);
    }
  };
  return {
    balance,
    restore: () => {
      read();
      for (const { add, remove } of spies) {
        add.mockRestore();
        remove.mockRestore();
      }
    },
  };
};

const Content = ({ n }: { n: number }) => (
  <div data-testid={`drawer-content-${n}`}>
    <h2>Track competitors</h2>
    <input aria-label={`competitor-${n}`} />
    <p>You can track up to 5 competitors.</p>
  </div>
);

afterEach(() => {
  vi.restoreAllMocks();
});

describe('DrawerService open → close cycles', () => {
  // Growth between two batches, the shape of the Tier P finding (per-cycle slope), so one-time setup such as React's
  // root listeners on the portal container is not counted.
  it('keeps no per-cycle growth in retained drawers, listeners, overlay ledger or published open payloads', {
    timeout: 30000,
  }, async () => {
    // The gates run the spec project without --expose-gc: expose it for this file (V8 flag, then a fresh context).
    setFlagsFromString('--expose-gc');
    const gc = ((globalThis as { gc?: () => void }).gc ?? runInNewContext('gc')) as (() => void) | undefined;
    expect(typeof gc, 'gc must be available').toBe('function');
    const collect = async () => {
      await act(async () => new Promise((resolve) => setTimeout(resolve, 50)));
      for (let i = 0; i < 3; i++) {
        gc!();
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    };

    render(<DrawerRoot />);
    const refs: WeakRef<Element>[] = [];
    const cycle = async (n: number) => {
      act(() => {
        DrawerService.open(<Content n={n} />, { title: `Drawer ${n}` });
      });
      refs.push(new WeakRef(await screen.findByTestId(`drawer-content-${n}`)));
      act(() => {
        DrawerService.closeLast();
      });
      await waitFor(() => expect(screen.queryByTestId(`drawer-content-${n}`)).toBeNull(), { timeout: 3000 });
    };
    const snapshot = () => ({
      retained: refs.filter((ref) => ref.deref() !== undefined).length,
      ledger: ledgerSize(),
      payloads: openPayloads(),
    });

    for (let n = 0; n < 2; n++) await cycle(n);
    await collect();
    const first = snapshot();
    const { balance, restore } = listenerBalance();
    for (let n = 2; n < 2 + CYCLES; n++) await cycle(n);
    restore();
    await collect();
    const second = snapshot();

    expect({
      retainedClosedDrawersGrowth: second.retained - first.retained,
      listenersAddedButNotRemovedOverCycles: [...balance].filter(([, count]) => count > 0),
      ledgerGrowth: second.ledger - first.ledger,
      retainedOpenPayloadGrowth: second.payloads - first.payloads,
    }).toEqual({
      retainedClosedDrawersGrowth: 0,
      listenersAddedButNotRemovedOverCycles: [],
      ledgerGrowth: 0,
      retainedOpenPayloadGrowth: 0,
    });
  });
});
