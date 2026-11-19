import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render } from '../../../test-utils/test-utils';
import { DrawerMuiReference } from './_Drawer.mui-reference';
import { Drawer, DrawerProps } from './Drawer';

/**
 * Differential parity, jsdom: Vanguard Drawer on the own core vs the frozen MUI 9.5 implementation, same props and
 * timeline (mount closed → open → Slide enter → backdrop / Escape close → exit) → same document and onClose calls, per
 * variant (persistent, temporary, permanent) and anchor. Canonical form: emotion classes, own-core markers and
 * attribute / style / class order normalised; values and structure must match.
 */
type Impl = 'mui' | 'own';

const normalize = (html: string) =>
  html
    .replace(/ ?\bcss-[a-z0-9]+(-[A-Za-z0-9]+)*/g, '')
    .replace(/ ?\bvg-z-n?\d+/g, '')
    .replace(/ class=""/g, '')
    .replace(/ data-vg-core=""/g, '')
    .replace(/ data-slot="[^"]*"/g, '')
    .replace(/ data-anchor="(left|top|right|bottom)"/g, '')
    .replace(/ data-docked=""/g, '')
    .replace(/ data-(open|disabled|selected|focus-visible|highlighted|checked|pressed|focused|filled)=""/g, '')
    .replace(/ vg-typography-vanguard/g, '')
    .replace(/ (id|aria-labelledby|aria-controls|aria-describedby)="[^"]*"/g, ' $1="ID"');

const canonical = (html: string) => {
  const host = document.createElement('div');
  host.innerHTML = html;
  for (const el of Array.from(host.querySelectorAll('*'))) {
    const attrs = Array.from(el.attributes).map((a) => [a.name, a.value] as const);
    for (const [name] of attrs) el.removeAttribute(name);
    for (const [name, value] of attrs.sort(([x], [y]) => x.localeCompare(y))) {
      let v = value;
      if (name === 'class') v = value.split(/\s+/).filter(Boolean).sort().join(' ');
      if (name === 'style')
        v = value
          .split(';')
          .map((d) => d.trim())
          .filter(Boolean)
          .sort()
          .join('; ');
      el.setAttribute(name, v);
    }
  }
  return host.innerHTML;
};

// Body state belongs to every overlay differential (H16): the body's own inline style (scroll lock, scrollbar gap)
// next to its children (sibling aria-hidden is in the markup).
const snapshot = () =>
  `<body style="${document.body.getAttribute('style') ?? ''}">${canonical(normalize(document.body.innerHTML))}`;

type Step = ['open'] | ['close'] | ['advance', number] | ['backdrop'] | ['escape'];

const go = (impl: Impl, props: Partial<DrawerProps>, steps: Step[]) => {
  vi.useFakeTimers();
  const log: string[] = [];
  const C = (impl === 'mui' ? DrawerMuiReference : Drawer) as React.ElementType;
  const tree = (open: boolean) => (
    <C open={open} title="Title" onClose={(r: unknown) => log.push(`close:${JSON.stringify(r)}`)} {...props}>
      <button type="button">{'inside'}</button>
    </C>
  );
  let open = false;
  const view = render(tree(open));
  const trace: { html: string; log: string[] }[] = [{ html: snapshot(), log: [] }];
  for (const step of steps) {
    if (step[0] === 'open' || step[0] === 'close') {
      open = step[0] === 'open';
      view.rerender(tree(open));
    }
    if (step[0] === 'advance')
      act(() => {
        vi.advanceTimersByTime(step[1]);
      });
    if (step[0] === 'backdrop') {
      const backdrop = document.querySelector('.MuiBackdrop-root');
      if (backdrop) fireEvent.click(backdrop);
    }
    if (step[0] === 'escape') fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    trace.push({ html: snapshot(), log: log.splice(0) });
  }
  view.unmount();
  view.container.remove();
  vi.useRealTimers();
  return trace;
};

afterEach(() => {
  document.body.innerHTML = '';
  document.body.removeAttribute('style');
});

const TIMELINE: Step[] = [['open'], ['advance', 100], ['advance', 500], ['close'], ['advance', 100], ['advance', 500]];
const MODAL_TIMELINE: Step[] = [['open'], ['advance', 500], ['backdrop'], ['escape'], ['close'], ['advance', 500]];

describe('Drawer own core equals the MUI implementation', () => {
  it.each([
    ['persistent, right (default)', {}, TIMELINE],
    ['persistent, left, close button', { anchor: 'left', showCloseButton: true }, TIMELINE],
    ['persistent, bottom', { anchor: 'bottom' }, TIMELINE],
    ['temporary, right: backdrop and Escape close', { variant: 'temporary' }, MODAL_TIMELINE],
    ['temporary, hideBackdrop', { variant: 'temporary', hideBackdrop: true }, MODAL_TIMELINE],
    [
      'temporary, bottom, sticky compact header',
      { variant: 'temporary', anchor: 'bottom', isHeaderSticky: true, isHeaderCompact: true, description: 'D' },
      MODAL_TIMELINE,
    ],
    ['permanent', { variant: 'permanent' }, [['open'], ['close']]],
    ['zIndex given', { variant: 'temporary', zIndex: 2000 }, MODAL_TIMELINE],
  ] as [string, Partial<DrawerProps>, Step[]][])('%s', (_name, props, steps) => {
    expect(go('own', props, steps)).toEqual(go('mui', props, steps));
  });
});
