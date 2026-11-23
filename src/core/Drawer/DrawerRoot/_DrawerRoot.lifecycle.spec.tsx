import '@testing-library/jest-dom/vitest';

import { PUB_SUB_EVENTS, pubSubService } from '@helpers/pub-sub';
import { OverlayStackingService } from '@vanguard/OverlayStacking/OverlayStackingService';
import { act, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { DrawerService } from '../DrawerService';
import { DrawerRoot } from './DrawerRoot';

/**
 * DrawerRoot hygiene (Tier P, V2): every DrawerRoot mount added one observer per drawer channel that was never
 * removed, and a root unmounted while its drawer was open kept its overlay-ledger slot. A root that mounts late must
 * still converge on the published state.
 */
type Channel = { observers?: unknown[] };
const observers = (event: string) =>
  ((pubSubService as unknown as { events: Record<string, Channel> }).events[event]?.observers ?? []).length;
const ledger = () => (OverlayStackingService as unknown as { order: Map<string, number> }).order;
const Content = ({ label }: { label: string }) => <p data-testid="lifecycle-content">{label}</p>;

describe('DrawerRoot lifecycle', () => {
  it('removes its channel observers on unmount', () => {
    render(<DrawerRoot />).unmount();
    const before = [observers(PUB_SUB_EVENTS.reactDrawerOpen), observers(PUB_SUB_EVENTS.reactDrawerClose)];
    for (let i = 0; i < 5; i++) render(<DrawerRoot />).unmount();
    expect([observers(PUB_SUB_EVENTS.reactDrawerOpen), observers(PUB_SUB_EVENTS.reactDrawerClose)]).toEqual(before);
  });

  it('releases its overlay-ledger slot when unmounted while a drawer is open', async () => {
    const view = render(<DrawerRoot />);
    let id = '';
    act(() => {
      id = DrawerService.open(<Content label="open" />);
    });
    await screen.findByTestId('lifecycle-content');
    expect(ledger().has(id)).toBe(true);
    view.unmount();
    expect(ledger().has(id)).toBe(false);
    act(() => DrawerService.close(id));
  });

  it('converges when mounted after the drawer events were published', async () => {
    let first = '';
    let second = '';
    act(() => {
      first = DrawerService.open(<Content label="first" />);
      DrawerService.close(first);
      second = DrawerService.open(<Content label="second" />);
    });
    const view = render(<DrawerRoot />);
    expect(await screen.findByTestId('lifecycle-content')).toHaveTextContent('second');
    act(() => DrawerService.close(second));
    await waitFor(() => expect(screen.queryByTestId('lifecycle-content')).toBeNull(), { timeout: 3000 });
    view.unmount();

    // A root mounted after the last drawer closed shows nothing.
    render(<DrawerRoot />);
    await act(async () => new Promise((resolve) => setTimeout(resolve, 50)));
    expect(screen.queryByTestId('lifecycle-content')).toBeNull();
  });
});
