import { TRANSITION_LONGHANDS } from '@test-utils/transition-longhands';
import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React from 'react';
import { expect, waitFor } from 'storybook/test';
import { VanguardThemeProvider } from '../VanguardThemeProvider/VanguardThemeProvider';
import { BreadcrumbsMui } from './_BreadcrumbsMui.reference';
import { Breadcrumbs, BreadcrumbsProps } from './Breadcrumbs';

/**
 * Track g differential in Chromium: the own Breadcrumbs vs the former MUI path (_BreadcrumbsMui.reference.tsx), side by
 * side, with and without VanguardThemeProvider. Computed styles + boxes of nav, ol, every li, separator, the ellipsis
 * button and its icon: at rest, ellipsis :hover / :active (forced by cloning those rules in place with
 * [data-force-*], same specificity and position), :focus, and after expanding.
 */
const CASES: Record<string, { p: Partial<BreadcrumbsProps>; n: number }> = {
  short: { p: {}, n: 3 },
  nodeSeparator: { p: { separator: <span style={{ fontWeight: 700 }}>›</span> }, n: 4 },
  collapsed: { p: { maxItems: 3 }, n: 7 },
  collapsedWide: { p: { maxItems: 4, itemsBeforeCollapse: 2, itemsAfterCollapse: 2 }, n: 9 },
  wrapping: { p: {}, n: 8 },
};
const PROPS = [
  ...TRANSITION_LONGHANDS,
  'display',
  'flex-wrap',
  'align-items',
  'justify-content',
  'position',
  'box-sizing',
  'width',
  'height',
  'margin',
  'padding',
  'border',
  'border-radius',
  'background-color',
  'box-shadow',
  'color',
  'fill',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'list-style-type',
  'user-select',
  'cursor',
  'outline',
  'transition',
  'vertical-align',
  'text-decoration-line',
];
const pick = (el: Element) => {
  const cs = getComputedStyle(el);
  return Object.fromEntries(PROPS.map((p) => [p, cs.getPropertyValue(p)]));
};
const measure = (host: Element) =>
  [host.querySelector('nav'), ...host.querySelectorAll('nav ol, nav li, nav button, nav svg')]
    .filter(Boolean)
    .map((el) => {
      const e = el as Element;
      const { width, height, x, y } = e.getBoundingClientRect();
      const h = host.getBoundingClientRect();
      return { tag: e.tagName, style: pick(e), box: { width, height, x: x - h.x, y: y - h.y } };
    });

const forcePseudo = () => {
  const walk = (list: CSSRuleList, owner: CSSStyleSheet | CSSGroupingRule) => {
    for (let i = list.length - 1; i >= 0; i--) {
      const rule = list[i];
      if (rule instanceof CSSStyleRule && /:(hover|active)/.test(rule.selectorText)) {
        const sel = rule.selectorText
          .replace(/:hover/g, '[data-force-hover]')
          .replace(/:active/g, '[data-force-active]');
        try {
          owner.insertRule(rule.cssText.replace(rule.selectorText, sel), i + 1);
        } catch {
          /* rejected selector: skip */
        }
      } else if (rule instanceof CSSGroupingRule) walk(rule.cssRules, rule);
    }
  };
  for (const sheet of [...document.styleSheets]) {
    try {
      walk(sheet.cssRules, sheet);
    } catch {
      /* cross-origin */
    }
  }
};
const settle = async () => {
  await new Promise((r) => requestAnimationFrame(r));
  for (const a of document.getAnimations()) {
    if (a.effect?.getComputedTiming().endTime === Infinity) {
      a.pause();
      a.currentTime = 0;
    } else a.finish();
  }
};
const flat = (v: unknown, path = '', out: Record<string, unknown> = {}) => {
  if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) flat(x, path ? `${path}.${k}` : k, out);
  else out[path] = v;
  return out;
};
const diff = (own: unknown, mui: unknown) => {
  const a = flat(own);
  const b = flat(mui);
  return [...new Set([...Object.keys(a), ...Object.keys(b)])]
    .filter((k) => a[k] !== b[k])
    .map((k) => `${k}: own=${a[k]} mui=${b[k]}`);
};

const Grid = () => (
  <div style={{ width: 360 }}>
    {Object.entries(CASES).map(([name, { p, n }]) =>
      (['mui', 'own'] as const).map((impl) => {
        const C = impl === 'mui' ? BreadcrumbsMui : Breadcrumbs;
        return (
          <div key={`${name}-${impl}`} data-case={name} data-impl={impl} style={{ marginBottom: 12 }}>
            <C {...p}>
              {Array.from({ length: n }, (_, i) =>
                i < n - 1 ? (
                  <a key={i} href={`#${i}`}>
                    Entry {i}
                  </a>
                ) : (
                  <span key={i}>Current page</span>
                ),
              )}
            </C>
          </div>
        );
      }),
    )}
  </div>
);

const play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  forcePseudo();
  const get = (name: string, impl: string) =>
    canvasElement.querySelector(`[data-case="${name}"][data-impl="${impl}"]`) as Element;
  const compare = async (state: string, names = Object.keys(CASES)) => {
    for (const name of names)
      await waitFor(() =>
        expect({ state, name, diffs: diff(measure(get(name, 'own')), measure(get(name, 'mui'))) }).toEqual({
          state,
          name,
          diffs: [],
        }),
      );
  };
  await settle();
  await compare('rest');

  const collapsed = ['collapsed', 'collapsedWide'];
  const restBg = getComputedStyle(get('collapsed', 'mui').querySelector('button') as Element).backgroundColor;
  for (const attr of ['data-force-hover', 'data-force-active']) {
    for (const name of collapsed)
      for (const impl of ['mui', 'own']) (get(name, impl).querySelector('button') as Element).setAttribute(attr, '');
    await settle();
    // Guard: the forced state changes the MUI side, so an identical comparison is not vacuous.
    await expect(getComputedStyle(get('collapsed', 'mui').querySelector('button') as Element).backgroundColor).not.toBe(
      restBg,
    );
    await compare(attr, collapsed);
    for (const el of canvasElement.querySelectorAll(`[${attr}]`)) el.removeAttribute(attr);
  }

  for (const name of collapsed) {
    const focused: Record<string, unknown> = {};
    for (const impl of ['mui', 'own']) {
      const b = get(name, impl).querySelector('button') as HTMLElement;
      b.focus();
      await settle();
      focused[impl] = measure(get(name, impl));
      b.blur();
    }
    await expect({ name, diffs: diff(focused.own, focused.mui) }).toEqual({ name, diffs: [] });
  }

  for (const name of collapsed)
    for (const impl of ['mui', 'own']) (get(name, impl).querySelector('button') as HTMLElement).click();
  await settle();
  await expect(get('collapsed', 'mui').querySelector('button')).toBeNull();
  await compare('expanded');
};

export const DefaultTheme: StoryObj = { render: () => <Grid />, play };
export const VanguardTheme: StoryObj = {
  render: () => (
    <VanguardThemeProvider>
      <Grid />
    </VanguardThemeProvider>
  ),
  play,
};

export default { ...SbDecorator({ title: 'Vanguard/Breadcrumbs/ParityDifferential', component: Breadcrumbs }) };
