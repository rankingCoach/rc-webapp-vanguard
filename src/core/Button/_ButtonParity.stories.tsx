import { TRANSITION_LONGHANDS } from '@test-utils/transition-longhands';
import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React from 'react';
import { expect, waitFor } from 'storybook/test';
import { IconNames } from '../Icon/IconNames';
import { VanguardThemeProvider } from '../VanguardThemeProvider/VanguardThemeProvider';
import { ButtonMui } from './_ButtonMui.reference';
import { Button, ButtonProps, ButtonSizes, ButtonTypes } from './Button';

/**
 * Track g differential in Chromium (Tier A + B): the own Button (A's Grow primitive) vs the former MUI Grow path
 * (_ButtonMui.reference.tsx), side by side, with and without VanguardThemeProvider, over type × size × icon
 * configuration × loading/disabled/rounded/label. Computed styles of the button, its inner container, every icon
 * wrapper and the label, plus boxes, at rest, hovered (real :hover forced by rule cloning) and focus-visible; and the
 * Grow icon swap sampled during and after the hover transition (opacity/transform/transition of both icon wrappers).
 */
const CASES: Record<string, ButtonProps> = {};
for (const type of [
  ButtonTypes.default,
  ButtonTypes.secondary,
  ButtonTypes.primary,
  ButtonTypes.shimmer,
  ButtonTypes.muted,
])
  for (const size of [ButtonSizes.small, ButtonSizes.medium, ButtonSizes.large, ButtonSizes.extraLarge])
    for (const [cfg, extra] of Object.entries({
      text: { children: 'Label' },
      growLeft: { children: 'Label', icon: IconNames.caretDown, iconLargeOnHover: true },
      growRight: { children: 'Label', icon: IconNames.caretDown, iconPosition: 'right', iconLargeOnHover: true },
      iconOnly: { ariaLabel: 'Add', icon: IconNames.caretDown, iconLargeOnHover: true },
      loading: { children: 'Label', icon: IconNames.caretDown, isLoading: true },
      disabled: { children: 'Label', icon: IconNames.caretDown, iconLargeOnHover: true, disabled: true },
      rounded: { children: 'Label', icon: IconNames.caretDown, rounded: true },
    } as Record<string, Partial<ButtonProps>>))
      CASES[`${type}-${size}-${cfg}`] = { type, size, ...extra } as ButtonProps;

const PROPS = [
  ...TRANSITION_LONGHANDS,
  'display',
  'position',
  'box-sizing',
  'width',
  'height',
  'margin',
  'padding',
  'border',
  'border-radius',
  'background-color',
  'background-image',
  'box-shadow',
  'color',
  'opacity',
  'transform',
  'transition',
  'font-size',
  'font-weight',
  'line-height',
  'cursor',
  'outline',
  'filter',
  'visibility',
  'overflow',
];
const pick = (el: Element) => {
  const cs = getComputedStyle(el);
  return Object.fromEntries(PROPS.map((p) => [p, cs.getPropertyValue(p)]));
};
const measure = (host: Element) =>
  [host.querySelector('button'), ...host.querySelectorAll('button div, button span')].filter(Boolean).map((el) => {
    const e = el as Element;
    const { width, height } = e.getBoundingClientRect();
    return { tag: e.tagName, cls: e.getAttribute('class'), style: pick(e), box: { width, height } };
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
const setChain = (el: Element, attr: string, on: boolean) => {
  for (let n: Element | null = el; n; n = n.parentElement) on ? n.setAttribute(attr, '') : n.removeAttribute(attr);
};
const finishAll = async () => {
  await new Promise((r) => requestAnimationFrame(r));
  // Finite transitions end; infinite ones (shimmer, loading spinner) are frozen at their start so both sides compare
  // the same frame.
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
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, max-content)', gap: 8, alignItems: 'center' }}>
    {Object.entries(CASES).map(([name, props]) =>
      (['mui', 'own'] as const).map((impl) => (
        <div key={`${name}-${impl}`} data-case={name} data-impl={impl}>
          {impl === 'mui' ? <ButtonMui {...props} /> : <Button {...props} />}
        </div>
      )),
    )}
  </div>
);

const play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  forcePseudo();
  const get = (name: string, impl: string) =>
    canvasElement.querySelector(`[data-case="${name}"][data-impl="${impl}"]`) as Element;
  const compareAll = async (state: string) => {
    for (const name of Object.keys(CASES))
      await waitFor(() =>
        expect({ state, name, diffs: diff(measure(get(name, 'own')), measure(get(name, 'mui'))) }).toEqual({
          state,
          name,
          diffs: [],
        }),
      );
  };
  // Icons load asynchronously (dynamic import + react-inlinesvg): wait until every icon wrapper holds its svg on both
  // sides (an equal count alone would pass at 0 = 0 before anything loaded).
  await waitFor(
    () => {
      for (const name of Object.keys(CASES))
        for (const impl of ['mui', 'own']) {
          const host = get(name, impl);
          const wrappers = host.querySelectorAll('[data-slot="icon"]');
          for (const w of wrappers) expect(w.querySelector('svg'), `${name}/${impl}`).not.toBeNull();
        }
    },
    { timeout: 10000 },
  );
  await finishAll();
  // Guards: icons are loaded, and the Grow pair starts small-visible / large-hidden (so the hover steps can change it).
  // Grow pair = inner container's first child (icon-on-hover container): [0] small icon wrapper, [1] large one.
  const growWrap = (impl: string, which: 'Small' | 'Large') => {
    const pair = (get('primary-medium-growLeft', impl).querySelector('button') as Element).lastElementChild
      ?.firstElementChild as Element;
    return pair.children[which === 'Small' ? 0 : 1].firstElementChild as HTMLElement;
  };
  await waitFor(
    () =>
      expect(canvasElement.querySelectorAll('[data-slot="icon"] svg').length).toBe(
        canvasElement.querySelectorAll('[data-slot="icon"]').length,
      ),
    { timeout: 10000 },
  );
  await finishAll();
  await expect([
    getComputedStyle(growWrap('mui', 'Small')).opacity,
    getComputedStyle(growWrap('mui', 'Large')).opacity,
  ]).toEqual(['1', '0']);
  const restBg = getComputedStyle(get('primary-medium-text', 'mui').querySelector('button') as Element).backgroundColor;
  await compareAll('rest');

  // CSS :hover (forced) — the Grow swap is driven by JS hover (useHover), checked below.
  for (const name of Object.keys(CASES))
    for (const impl of ['mui', 'own'])
      setChain(get(name, impl).querySelector('button') as Element, 'data-force-hover', true);
  await finishAll();
  await expect(
    getComputedStyle(get('primary-medium-text', 'mui').querySelector('button') as Element).backgroundColor,
  ).not.toBe(restBg);
  await compareAll('css-hover');
  for (const el of document.querySelectorAll('[data-force-hover]')) el.removeAttribute('data-force-hover');

  // Grow icon swap: JS hover on the grow cases, sampled mid-transition (both sides entered in the same frame) and settled.
  const growCases = Object.keys(CASES).filter((n) => /grow|iconOnly/.test(n));
  for (const name of growCases)
    for (const impl of ['mui', 'own'])
      (get(name, impl).querySelector('button') as HTMLElement).dispatchEvent(
        new MouseEvent('mouseover', { bubbles: true }),
      );
  for (const name of growCases)
    for (const impl of ['mui', 'own'])
      (get(name, impl).querySelector('button') as HTMLElement).dispatchEvent(
        new MouseEvent('mouseenter', { bubbles: false }),
      );
  await new Promise((r) => setTimeout(r, 600));
  await finishAll();
  await expect([
    getComputedStyle(growWrap('mui', 'Small')).opacity,
    getComputedStyle(growWrap('mui', 'Large')).opacity,
  ]).toEqual(['0', '1']);
  await compareAll('js-hover settled');
  for (const name of growCases)
    for (const impl of ['mui', 'own']) {
      const b = get(name, impl).querySelector('button') as HTMLElement;
      b.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
      b.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false }));
    }
  await new Promise((r) => setTimeout(r, 600));
  await finishAll();
  await compareAll('js-hover left');

  // Keyboard focus-visible.
  for (const name of Object.keys(CASES)) {
    const focused: Record<string, unknown> = {};
    for (const impl of ['mui', 'own']) {
      const b = get(name, impl).querySelector('button') as HTMLButtonElement;
      if (b.disabled) continue;
      b.focus();
      await finishAll();
      focused[impl] = { visible: b.matches(':focus-visible'), m: measure(get(name, impl)) };
      b.blur();
    }
    await expect({ name, diffs: diff(focused.own, focused.mui) }).toEqual({ name, diffs: [] });
  }
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

export default { ...SbDecorator({ title: 'Vanguard/Button/ParityDifferential', component: Button }) };
