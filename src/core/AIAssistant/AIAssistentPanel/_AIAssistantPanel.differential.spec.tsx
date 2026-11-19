import { readFileSync } from 'node:fs';
import path from 'node:path';
import { act, fireEvent, render } from '@test-utils/test-utils';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AIAssistantStatus } from '../AIAssistant';
import { AIAssistantPanelMuiReference } from './_AIAssistantPanel.mui-reference';
import { AIAssistantPanel } from './AIAssistantPanel';

/**
 * Differential parity, jsdom: AIAssistantPanel on the own Grow / Fade / Collapse vs the frozen MUI implementation.
 * Same status timeline (closed → open → adjust (tone menu hover) → needsCommand → writing → closed) → same document,
 * including the transitions' inline writes at each step. Emotion classes and own-core markers normalised.
 */
// lottie-web touches HTMLCanvasElement.getContext at import time (not implemented in jsdom), as in the mui spec.
vi.mock('@vanguard/LottieAnimationLoader/LottieAnimationLoader', () => ({
  LottieAnimationLoader: () => <div data-testid="lottie-stub" />,
}));

// jsdom has no ResizeObserver (the panel's Textarea autosize uses it): inert stub, same for both implementations.
class InertResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('ResizeObserver', InertResizeObserver);

type Impl = 'mui' | 'own';

const normalize = (html: string) =>
  html
    .replace(/ ?\bcss-[a-z0-9]+(-[A-Za-z0-9]+)*/g, '')
    .replace(/ class=""/g, '')
    .replace(/ data-vg-core=""/g, '')
    .replace(/ data-slot="[^"]*"/g, '')
    .replace(/ data-orientation="(vertical|horizontal)"/g, '')
    .replace(/ data-(open|disabled|selected|focus-visible|highlighted|checked|pressed|focused|filled)=""/g, '')
    .replace(/ (id|for|aria-labelledby|aria-controls|aria-describedby)="[^"]*"/g, ' $1="ID"');

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

const snapshot = () => canonical(normalize(document.body.innerHTML));

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

type Step = AIAssistantStatus | ['advance', number] | 'toneHover';

const go = (impl: Impl, steps: Step[]) => {
  vi.useFakeTimers();
  const P = (impl === 'mui' ? AIAssistantPanelMuiReference : AIAssistantPanel) as React.ElementType;
  const anchor = document.createElement('div');
  document.body.appendChild(anchor);
  const tree = (status: AIAssistantStatus) => (
    <P
      id="ai"
      value="Some text"
      setValue={() => undefined}
      status={status}
      setStatus={() => undefined}
      anchorElem={anchor}
    />
  );
  const view = render(tree('closed'));
  const trace: string[] = [snapshot()];
  for (const step of steps) {
    if (Array.isArray(step))
      act(() => {
        vi.advanceTimersByTime(step[1]);
      });
    else if (step === 'toneHover') {
      const trigger = Array.from(document.querySelectorAll('[class]')).find(
        (el) => /tone/i.test(el.textContent ?? '') && el.children.length < 4,
      );
      if (trigger) fireEvent.mouseEnter(trigger);
    } else view.rerender(tree(step));
    trace.push(snapshot());
  }
  view.unmount();
  view.container.remove();
  anchor.remove();
  return trace;
};

describe('AIAssistantPanel own core equals MUI', () => {
  const cases: [string, Step[]][] = [
    ['open, settle, close', ['open', ['advance', 50], ['advance', 400], 'closed', ['advance', 400]]],
    [
      'open → adjust (tone menu) → open',
      ['open', ['advance', 400], 'adjust', ['advance', 400], 'toneHover', ['advance', 400], 'open', ['advance', 400]],
    ],
    [
      'open → needsCommand → writing → closed',
      [
        'open',
        ['advance', 400],
        'needsCommand',
        ['advance', 400],
        'writing',
        ['advance', 300],
        'closed',
        ['advance', 400],
      ],
    ],
  ];
  for (const [name, steps] of cases) {
    it(name, () => {
      expect(go('own', steps)).toEqual(go('mui', steps));
    });
  }
  it('imports nothing from @mui', () => {
    const src = readFileSync(path.join(__dirname, 'AIAssistantPanel.tsx'), 'utf8');
    expect(src).not.toMatch(/from '@mui\//);
  });
});
