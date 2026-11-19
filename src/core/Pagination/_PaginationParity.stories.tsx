import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React from 'react';
import { expect, waitFor } from 'storybook/test';
import { VanguardThemeProvider } from '../VanguardThemeProvider/VanguardThemeProvider';
import { PaginationMui } from './_PaginationMui.reference';
import { Pagination, PaginationProps } from './Pagination';

/**
 * Track g differential in Chromium: the own Pagination vs the former MUI path (_PaginationMui.reference.tsx), side by
 * side, with and without VanguardThemeProvider, over size × shape × disabled (with first/last buttons, both
 * ellipses). Computed styles + boxes/positions of nav, ul, li, every item and icon: at rest, item :hover / :active
 * (forced by cloning those rules in place with [data-force-*]), keyboard focus-visible, and after paging.
 */
const CASES: Record<string, PaginationProps> = {};
for (const size of ['small', 'medium', 'large'] as const)
  for (const shape of ['circular', 'rounded'] as const)
    for (const disabled of [false, true])
      CASES[`${size}-${shape}${disabled ? '-disabled' : ''}`] = {
        count: 12,
        defaultPage: 6,
        size,
        shape,
        disabled,
        showFirstButton: true,
        showLastButton: true,
      };
CASES.edgeFirst = { count: 5, defaultPage: 1, showFirstButton: true, showLastButton: true };

const PROPS = [
  'display',
  'flex-wrap',
  'align-items',
  'justify-content',
  'position',
  'box-sizing',
  'width',
  'height',
  'min-width',
  'margin',
  'padding',
  'border',
  'border-radius',
  'background-color',
  'color',
  'opacity',
  'fill',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'text-align',
  'list-style-type',
  'user-select',
  'cursor',
  'outline',
  'transition',
  'vertical-align',
  'pointer-events',
];
const pick = (el: Element) => {
  const cs = getComputedStyle(el);
  return Object.fromEntries(PROPS.map((p) => [p, cs.getPropertyValue(p)]));
};
const measure = (host: Element) =>
  [host.querySelector('nav'), ...host.querySelectorAll('nav ul, nav li, nav button, nav li > div, nav svg')]
    .filter(Boolean)
    .map((el) => {
      const e = el as Element;
      const { width, height, x, y } = e.getBoundingClientRect();
      const h = host.getBoundingClientRect();
      return {
        tag: e.tagName,
        label: e.getAttribute('aria-label'),
        style: pick(e),
        box: { width, height, x: x - h.x, y: y - h.y },
      };
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
  <div style={{ width: 560 }}>
    {Object.entries(CASES).map(([name, p]) =>
      (['mui', 'own'] as const).map((impl) => {
        const C = impl === 'mui' ? PaginationMui : Pagination;
        return (
          <div key={`${name}-${impl}`} data-case={name} data-impl={impl} style={{ marginBottom: 8 }}>
            <C {...p} />
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
  const compare = async (state: string) => {
    for (const name of Object.keys(CASES))
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

  const target = (name: string, impl: string) =>
    get(name, impl).querySelector('[aria-label="Go to page 5"]') as HTMLElement;
  const selected = (name: string, impl: string) =>
    get(name, impl).querySelector('[aria-current="page"]') as HTMLElement;
  const restBg = getComputedStyle(target('medium-circular', 'mui')).backgroundColor;
  for (const attr of ['data-force-hover', 'data-force-active']) {
    for (const name of Object.keys(CASES))
      for (const impl of ['mui', 'own'])
        for (const el of [target(name, impl), selected(name, impl)]) el?.setAttribute(attr, '');
    await settle();
    if (attr === 'data-force-hover')
      await expect(getComputedStyle(target('medium-circular', 'mui')).backgroundColor).not.toBe(restBg);
    await compare(attr);
    for (const el of canvasElement.querySelectorAll(`[${attr}]`)) el.removeAttribute(attr);
  }

  for (const name of Object.keys(CASES)) {
    const focused: Record<string, unknown> = {};
    for (const impl of ['mui', 'own']) {
      const el = selected(name, impl);
      if (!el || (el as HTMLButtonElement).disabled) continue;
      el.focus();
      await settle();
      focused[impl] = { visible: el.matches(':focus-visible'), m: measure(get(name, impl)) };
      el.blur();
    }
    await expect({ name, diffs: diff(focused.own, focused.mui) }).toEqual({ name, diffs: [] });
  }

  for (const name of Object.keys(CASES))
    for (const impl of ['mui', 'own'])
      (get(name, impl).querySelector('[aria-label="Go to next page"]') as HTMLElement)?.click();
  await settle();
  await compare('paged');
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

export default { ...SbDecorator({ title: 'Vanguard/Pagination/ParityDifferential', component: Pagination }) };
