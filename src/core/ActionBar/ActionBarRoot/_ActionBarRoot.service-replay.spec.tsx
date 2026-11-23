import '@testing-library/jest-dom/vitest';
import { PUB_SUB_EVENTS, pubSubService } from '@helpers/pub-sub';
import { act, render, waitFor, within } from '@testing-library/react';
import { actionBarService } from '@vanguard/ActionBar/ActionBar.service';
import { ActionBarRoot } from '@vanguard/ActionBar/ActionBarRoot/ActionBarRoot';
import React from 'react';
import { expect, it } from 'vitest';

const selector = '[data-testid="ActionBar_Container"]';

it('replays a footer published while detached and still handles hide on the next root', async () => {
  const { events } = pubSubService as unknown as {
    events: Partial<Record<PUB_SUB_EVENTS, { observers: unknown[] }>>;
  };
  const channel = PUB_SUB_EVENTS.reactActionBarSetFooter;
  expect(events[channel]).toBeUndefined();
  const fixture = (generation?: number) => (
    <div className="react-container">
      {generation === undefined ? null : <ActionBarRoot key={generation} />}
    </div>
  );
  const view = render(fixture(1));
  try {
    const first = view.container.querySelector<HTMLDivElement>(selector);
    expect(first).not.toBeNull();
    const footerSubject = events[channel];
    expect(footerSubject?.observers).toHaveLength(1);

    view.rerender(fixture());
    expect(first?.isConnected).toBe(false);
    expect(view.container.querySelector(selector)).toBeNull();
    expect(events[channel]).toBe(footerSubject);
    expect(footerSubject?.observers).toHaveLength(0);

    const name = 'Synthetic replay footer action';
    act(() => {
      actionBarService.setFooter({ buttons: [{ text: name, onClick: () => {} }] });
    });
    expect(footerSubject?.observers).toHaveLength(0);
    view.rerender(fixture(2));
    const canvas = within(view.container);
    const second = view.container.querySelector<HTMLDivElement>(selector);
    expect(second).not.toBeNull();
    expect(second).not.toBe(first);
    await waitFor(() => {
      expect(canvas.getByRole('button', { name })).toBeVisible();
      expect(second?.style.transform).toBe('translateY(0)');
    });
    expect(events[channel]).toBe(footerSubject);
    expect(footerSubject?.observers).toHaveLength(1);

    act(() => {
      actionBarService.hideFooter();
    });
    await waitFor(() => {
      expect(canvas.queryByRole('button', { name })).toBeNull();
      expect(second?.style.transform).toBe('translateY(100%)');
    });
    view.rerender(fixture());
    expect(second?.isConnected).toBe(false);
    expect(events[channel]).toBe(footerSubject);
    expect(footerSubject?.observers).toHaveLength(0);
    console.log('ACTIONBAR_REPLAY_TRACE {"detachedSubscribeCount":0,"replayVisible":true,"hideHandled":true,"subjectPreserved":true}');
  } finally {
    view.unmount();
  }
});
