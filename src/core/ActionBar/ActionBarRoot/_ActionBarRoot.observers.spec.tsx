import { PUB_SUB_EVENTS, pubSubService } from '@helpers/pub-sub';
import { act, render } from '@testing-library/react';
import { ActionBarRoot } from '@vanguard/ActionBar/ActionBarRoot/ActionBarRoot';
import React from 'react';
import { expect, it } from 'vitest';

import { pubSubService as sourceSingleton } from '../../../helpers/pub-sub';
import { ActionBarRoot as sourceRoot } from './ActionBarRoot';

const selector = '[data-testid="ActionBar_Container"]';
const zeroCounts = [0, 0, 0, 0];
const closedSettleMs = 1500;
const channels = [
  PUB_SUB_EVENTS.reactActionBarAddMessage,
  PUB_SUB_EVENTS.reactActionBarRemoveMessage,
  PUB_SUB_EVENTS.reactActionBarSetFooter,
  PUB_SUB_EVENTS.reactActionBarHideFooter,
];

const fixture = (generation?: number) => (
  <div className="react-container">
    {generation === undefined ? null : <ActionBarRoot key={generation} />}
  </div>
);

it('releases all four ActionBarRoot observers after natural teardown and remount', async () => {
  expect(pubSubService).toBe(sourceSingleton);
  expect(ActionBarRoot).toBe(sourceRoot);
  expect(channels).toEqual([
    'REACT_ACTION_BAR_ADD',
    'REACT_ACTION_BAR_REMOVE',
    'REACT_ACTION_BAR_SET_FOOTER',
    'REACT_ACTION_BAR_HIDE_FOOTER',
  ]);

  const { events } = pubSubService as unknown as {
    events: Partial<Record<PUB_SUB_EVENTS, { observers: unknown[] }>>;
  };
  const counts = (mounted = false) => channels.map((channel) => {
    const subject = events[channel];
    if (!subject && !mounted) return 0;
    expect(Array.isArray(subject?.observers), channel).toBe(true);
    return subject!.observers.length;
  });
  const view = render(fixture());
  try {
    expect(document.querySelectorAll(selector)).toHaveLength(0);
    const initial = counts();
    expect(initial).toEqual(zeroCounts);
    const owner = view.container.firstElementChild;
    expect(owner).not.toBeNull();
    const cycles = [];
    let previous: WeakRef<Element> | undefined;

    for (const generation of [1, 2]) {
      const before = counts();
      view.rerender(fixture(generation));
      let node = document.querySelector(selector);
      const distinctOwnedNode = Boolean(
        node && owner?.contains(node) && document.querySelectorAll(selector).length === 1 && previous?.deref() !== node,
      );
      const mounted = counts(true);
      previous = node ? new WeakRef(node) : undefined;

      view.rerender(fixture());
      const detached = Boolean(node && !node.isConnected);
      node = null;
      const remainingAtTeardown = document.querySelectorAll(selector).length;
      const teardown = counts();
      await act(async () => {
        await new Promise<void>((resolve) => setTimeout(resolve, closedSettleMs));
      });
      const aged = counts();
      const remainingAfterAging = document.querySelectorAll(selector).length;

      cycles.push({
        generation, before, mounted, teardown, aged, distinctOwnedNode, detached, remainingAtTeardown, remainingAfterAging,
      });
    }

    console.log('ACTIONBAR_OBSERVER_TRACE ' + JSON.stringify({ channels, initial, cycles }));

    for (const cycle of cycles) {
      expect(cycle.distinctOwnedNode, 'distinct owned bar').toBe(true);
      expect(cycle.detached, 'previous bar disconnected').toBe(true);
      expect([cycle.remainingAtTeardown, cycle.remainingAfterAging], 'closed DOM').toEqual([0, 0]);
      expect(cycle.mounted, 'mounted delta on all four real channels').toEqual(cycle.before.map((count) => count + 1));
    }
    expect(cycles.map(({ teardown, aged }) => ({ teardown, aged })), 'ActionBarRoot observers remaining after teardown')
      .toEqual([
        { teardown: zeroCounts, aged: zeroCounts },
        { teardown: zeroCounts, aged: zeroCounts },
      ]);
  } finally {
    view.unmount();
  }
});
