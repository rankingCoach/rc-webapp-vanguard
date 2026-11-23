import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { render } from '@testing-library/react';
import React, { StrictMode } from 'react';
import { createPortal } from 'react-dom';
import { expect, it } from 'vitest';

import { AIOrb, AIOrbSize, AIOrbStatus } from './AIOrb';

const rootKeys = [
  '--animation-duration-rotation',
  '--animation-duration-scale',
  '--ai-orb-base-color',
  '--color1',
  '--color2',
  '--color3',
  '--container-size',
];
const rootSentinel = '--aiorb-review-root-sentinel';
const bodySentinel = '--aiorb-review-body-sentinel';
const read = (style: CSSStyleDeclaration, keys: string[]) => {
  const present = new Set(Array.from({ length: style.length }, (_, i) => style.item(i)));
  return keys.map((key) => ({
    key,
    present: present.has(key),
    value: style.getPropertyValue(key),
    priority: style.getPropertyPriority(key),
  }));
};
// jsdom 26 / cssstyle 4.6 drops custom-property priority at readback, so this spec seeds ordinary declarations.
// !important seeds, sentinel priority and computed stylesheet parity are REQUIRED AIOrb acceptance coverage in the
// paired Chromium witness (_AIOrbStyleOwnership.stories.tsx), decided-by-watchdog 2026-11-23.
const expectedHost = (seeded: boolean) =>
  rootKeys.map((key) => {
    const seed =
      seeded && key === '--container-size'
        ? ['312px', '']
        : seeded && key === '--color1'
          ? ['rgb(1, 2, 3)', '']
          : undefined;
    return { key, present: Boolean(seed), value: seed?.[0] ?? '', priority: seed?.[1] ?? '' };
  });
const local = (size: number) => [
  '3s',
  '1.5s',
  'hsla(217, 100%, 50%, 1)',
  'hsl(from var(--ai-orb-base-color) calc(h + 123) s calc(l + 6))',
  'hsl(from var(--ai-orb-base-color) calc(h - 35) 62 62)',
  'hsl(from var(--ai-orb-base-color) h s 98)',
  size + 'px',
];

it.each([false, true])('preserves host inline styles through a natural orb unmount (seeded=%s)', (seeded) => {
  const root = document.documentElement.style;
  const body = document.body.style;
  const original = { root: root.cssText, body: body.cssText };
  for (const key of rootKeys) root.removeProperty(key);
  if (seeded) {
    root.setProperty('--container-size', '312px');
    root.setProperty('--color1', 'rgb(1, 2, 3)');
  }
  root.setProperty(rootSentinel, 'host-root');
  body.setProperty(bodySentinel, 'host-body');
  const rootBefore = read(root, [...rootKeys, rootSentinel]);
  const bodyBefore = body.cssText;
  const fixture = (size?: AIOrbSize) => (
    <div data-testid="orb-shell">
      {size === undefined ? null : <AIOrb state={AIOrbStatus.Thinking} size={size} className="ownership-subject" />}
    </div>
  );
  let view: ReturnType<typeof render> | undefined;
  try {
    expect(read(root, rootKeys)).toEqual(expectedHost(seeded));
    expect(read(body, [bodySentinel])).toEqual([
      { key: bodySentinel, present: true, value: 'host-body', priority: '' },
    ]);
    view = render(fixture(AIOrbSize.Small));
    const shell = view.getByTestId('orb-shell');
    const orb = shell.querySelector<HTMLElement>('.ownership-subject');
    expect(orb).not.toBeNull();
    const sample = () => ({ root: read(root, [...rootKeys, rootSentinel]), body: body.cssText });
    const mounted = { ...sample(), local: read(orb!.style, rootKeys) };

    view.rerender(fixture(AIOrbSize.Medium));
    expect(shell.querySelector('.ownership-subject')).toBe(orb);
    const resized = { ...sample(), local: read(orb!.style, rootKeys) };

    view.rerender(fixture());
    expect(view.getByTestId('orb-shell')).toBe(shell);
    expect(shell.isConnected).toBe(true);
    expect(orb!.isConnected).toBe(false);
    expect(shell.querySelector('.ownership-subject')).toBeNull();
    const removed = sample();
    console.log('AIORB_OWNER_TRACE ' + JSON.stringify({ seeded, rootBefore, bodyBefore, mounted, resized, removed }));

    for (const [frame, size] of [
      [mounted, 40],
      [resized, 72],
    ] as const) {
      expect(frame.local).toEqual(
        rootKeys.map((key, i) => ({
          key,
          present: true,
          value: local(size)[i],
          priority: '',
        })),
      );
    }
    expect([mounted.body, resized.body, removed.body]).toEqual([bodyBefore, bodyBefore, bodyBefore]);
    expect([mounted.root.at(-1), resized.root.at(-1), removed.root.at(-1)]).toEqual([
      rootBefore.at(-1),
      rootBefore.at(-1),
      rootBefore.at(-1),
    ]);
    expect([mounted.root, resized.root, removed.root], 'host root CSSOM ownership before restoration').toEqual([
      rootBefore,
      rootBefore,
      rootBefore,
    ]);
  } finally {
    view?.unmount();
    root.cssText = original.root;
    body.cssText = original.body;
  }
});

const absentRoot = () => rootKeys.map((key) => ({ key, present: false, value: '', priority: '' }));
const ownSize = (orb: Element | null) => (orb as HTMLElement | null)?.style.getPropertyValue('--container-size');

it('updates each orb own size on resize without any root value (size is not gated on state)', () => {
  const root = document.documentElement.style;
  const original = root.cssText;
  for (const key of rootKeys) root.removeProperty(key);
  const fixture = (size: AIOrbSize) => <AIOrb state={AIOrbStatus.Thinking} size={size} className="size-subject" />;
  const view = render(fixture(AIOrbSize.Small));
  try {
    const orb = view.container.querySelector('.size-subject');
    expect(ownSize(orb)).toBe('40px');
    view.rerender(fixture(AIOrbSize.Medium));
    expect(view.container.querySelector('.size-subject')).toBe(orb);
    expect(ownSize(orb)).toBe('72px');
    expect(read(root, rootKeys), 'root after Small→Medium resize').toEqual(absentRoot());
  } finally {
    view.unmount();
    root.cssText = original;
  }
});

it('leaves the host root untouched through a StrictMode double mount and unmount', () => {
  const root = document.documentElement.style;
  const original = root.cssText;
  for (const key of rootKeys) root.removeProperty(key);
  const view = render(
    <StrictMode>
      <AIOrb state={AIOrbStatus.Error} size={AIOrbSize.Medium} className="strict-subject" />
    </StrictMode>,
  );
  let mounted = true;
  try {
    const orb = view.container.querySelector('.strict-subject');
    expect(read((orb as HTMLElement).style, rootKeys)).toEqual(
      rootKeys.map((key, i) => ({
        key,
        present: true,
        priority: '',
        value: [
          '5s',
          '10s',
          'hsla(15, 100%, 50%, 1)',
          'hsla(15, 100%, 56%, 1)',
          'hsla(25, 62%, 62%, 1)',
          'hsla(0, 100%, 80%, 1)',
          '72px',
        ][i],
      })),
    );
    expect(read(root, rootKeys), 'root while StrictMode-mounted').toEqual(absentRoot());
    view.unmount();
    mounted = false;
    expect(read(root, rootKeys), 'root after StrictMode unmount').toEqual(absentRoot());
  } finally {
    if (mounted) view.unmount();
    root.cssText = original;
  }
});

it('keeps a portal orb and an inline orb in one document on their own values', () => {
  const root = document.documentElement.style;
  const original = root.cssText;
  for (const key of rootKeys) root.removeProperty(key);
  const fixture = (inlineSize: AIOrbSize) => (
    <div>
      <AIOrb state={AIOrbStatus.Thinking} size={inlineSize} className="inline-subject" />
      {createPortal(
        <AIOrb state={AIOrbStatus.Error} size={AIOrbSize.Medium} className="portal-subject" />,
        document.body,
      )}
    </div>
  );
  const view = render(fixture(AIOrbSize.Small));
  try {
    const inline = document.querySelector('.inline-subject');
    const portal = document.querySelector('.portal-subject');
    expect(portal?.parentElement).toBe(document.body);
    expect([ownSize(inline), ownSize(portal)]).toEqual(['40px', '72px']);
    expect((inline as HTMLElement).style.getPropertyValue('--ai-orb-base-color')).toBe('hsla(217, 100%, 50%, 1)');
    expect((portal as HTMLElement).style.getPropertyValue('--ai-orb-base-color')).toBe('hsla(15, 100%, 50%, 1)');
    view.rerender(fixture(AIOrbSize.Large));
    expect([ownSize(inline), ownSize(portal)]).toEqual(['140px', '72px']);
    expect(read(root, rootKeys), 'root with portal and inline orbs').toEqual(absentRoot());
  } finally {
    view.unmount();
    root.cssText = original;
  }
});

it('scopes the derived orb declarations to the orb instead of a global :root block', () => {
  const scss = readFileSync(join(__dirname, 'AIOrb.module.scss'), 'utf8').replace(/\/\/.*$/gm, '');
  expect(scss).not.toMatch(/:root\b/);
  const orbBlock = scss.slice(scss.indexOf('.ai-orb {'), scss.indexOf('&::before', scss.indexOf('.ai-orb {')));
  for (const name of [
    '--orb-size-small',
    '--orb-size-large',
    '--animation-delay-roatation',
    '--animation-delay-scale',
    '--animation-scale-ease',
    '--ai-orb-base-color-op',
    '--overlay-orbs',
  ]) {
    expect(orbBlock, name).toMatch(new RegExp(name + ':'));
  }
});
