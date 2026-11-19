import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { VanguardThemeProvider } from '../VanguardThemeProvider/VanguardThemeProvider';
import { ChipMui } from './_ChipMui.reference';
import { Chip, ChipProps } from './Chip';

/**
 * Track g differential in Chromium: the own Chip vs the former MUI path (_ChipMui.reference.tsx), side by side, with
 * and without VanguardThemeProvider, over size × variant × clickable/deletable × disabled × icon. Computed styles of
 * root, label, icon and delete icon, and boxes, in four states: rest, hover, active (pressed), keyboard focus-visible.
 * Synthetic events cannot set :hover/:active, so `forcePseudo` clones every :hover/:active rule right after itself
 * with `[data-force-hover]`/`[data-force-active]` (same specificity, same position) and the state is set on the
 * element and its ancestors — both implementations go through the same rewritten stylesheets.
 */
const CASES: Record<string, Partial<ChipProps>> = {};
for (const size of ['medium', 'small'] as const)
  for (const variant of ['filled', 'outlined'] as const)
    for (const kind of ['none', 'click', 'delete', 'clickDelete'] as const)
      for (const disabled of [false, true])
        CASES[`${size}-${variant}-${kind}${disabled ? '-disabled' : ''}`] = {
          size,
          variant,
          disabled,
          ...(kind.includes('lick') ? { onClick: () => {} } : {}),
          ...(kind.includes('elete') ? { onDelete: () => {} } : {}),
        };
CASES.icon = {
  icon: (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <circle cx="12" cy="12" r="8" />
    </svg>
  ),
};
CASES.iconSmallOutlinedDelete = { ...CASES.icon, size: 'small', variant: 'outlined', onDelete: () => {} };
CASES.iconColored = {
  icon: (
    <svg viewBox="0 0 24 24" width="18" height="18" color="primary">
      <circle cx="12" cy="12" r="8" />
    </svg>
  ),
};
CASES.longLabel = {
  label: 'A very long chip label that should be truncated with an ellipsis',
  style: { maxWidth: 160 },
};

const PROPS = [
  'display',
  'position',
  'box-sizing',
  'width',
  'height',
  'max-width',
  'margin',
  'padding',
  'border',
  'border-radius',
  'background-color',
  'box-shadow',
  'color',
  'fill',
  'opacity',
  'font-family',
  'font-size',
  'line-height',
  'white-space',
  'overflow',
  'text-overflow',
  'cursor',
  'outline',
  'user-select',
  'vertical-align',
  'transition',
  'pointer-events',
  'align-items',
  'justify-content',
  'flex-shrink',
  'text-decoration',
];
const PARTS = { root: '.MuiChip-root', label: '.MuiChip-label', icon: '.MuiChip-icon', del: '.MuiChip-deleteIcon' };

const pick = (el: Element | null) => {
  if (!el) return null;
  const cs = getComputedStyle(el);
  return Object.fromEntries(PROPS.map((p) => [p, cs.getPropertyValue(p)]));
};
const box = (el: Element | null) =>
  el ? (({ width, height }) => ({ width, height }))(el.getBoundingClientRect()) : null;
const measure = (host: Element) =>
  Object.fromEntries(
    Object.entries(PARTS).map(([name, sel]) => {
      const el = host.querySelector(sel);
      return [name, { style: pick(el), box: box(el) }];
    }),
  );

const forcePseudo = () => {
  const added: [CSSStyleSheet | CSSGroupingRule, number][] = [];
  const walk = (list: CSSRuleList, owner: CSSStyleSheet | CSSGroupingRule) => {
    for (let i = list.length - 1; i >= 0; i--) {
      const rule = list[i];
      if (rule instanceof CSSStyleRule && /:(hover|active)/.test(rule.selectorText)) {
        const text = rule.cssText.replace(
          rule.selectorText,
          rule.selectorText.replace(/:hover/g, '[data-force-hover]').replace(/:active/g, '[data-force-active]'),
        );
        try {
          owner.insertRule(text, i + 1);
          added.push([owner, i + 1]);
        } catch {
          /* selector the engine rejects: skip */
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
const setState = (el: Element, attr: string, on: boolean) => {
  for (let n: Element | null = el; n; n = n.parentElement) on ? n.setAttribute(attr, '') : n.removeAttribute(attr);
};

const Grid = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, max-content)', gap: 8, alignItems: 'center' }}>
    {Object.entries(CASES).map(([name, props]) =>
      (['mui', 'own'] as const).map((impl) => (
        <div key={`${name}-${impl}`} data-case={name} data-impl={impl}>
          {impl === 'mui' ? <ChipMui label={`Chip ${name}`} {...props} /> : <Chip label={`Chip ${name}`} {...props} />}
        </div>
      )),
    )}
  </div>
);

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

const play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  forcePseudo();
  const get = (name: string, impl: string) =>
    canvasElement.querySelector(`[data-case="${name}"][data-impl="${impl}"]`) as Element;
  const root = (name: string, impl: string) => get(name, impl).querySelector('.MuiChip-root') as HTMLElement;
  // Transitions would make a state's computed value depend on timing: finish them, then compare the end values.
  const settle = async () => {
    await new Promise((r) => requestAnimationFrame(r));
    for (const a of document.getAnimations()) a.finish();
  };
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
  const restBg = getComputedStyle(root('medium-outlined-click', 'mui')).backgroundColor;
  const restDelColor = getComputedStyle(
    get('medium-filled-delete', 'mui').querySelector('.MuiChip-deleteIcon') as Element,
  ).color;

  for (const [state, attr] of [
    ['hover', 'data-force-hover'],
    ['active', 'data-force-active'],
  ] as const) {
    for (const name of Object.keys(CASES)) for (const impl of ['mui', 'own']) setState(root(name, impl), attr, true);
    // the delete icon's own :hover
    for (const name of Object.keys(CASES))
      for (const impl of ['mui', 'own']) {
        const del = get(name, impl).querySelector('.MuiChip-deleteIcon');
        if (del) del.setAttribute(attr, '');
      }
    await settle();
    // Guard: the forced state really applies (MUI side changes), so an identical comparison is not vacuous.
    if (state === 'hover') {
      await expect(getComputedStyle(root('medium-outlined-click', 'mui')).backgroundColor).not.toBe(restBg);
      await expect(
        getComputedStyle(get('medium-filled-delete', 'mui').querySelector('.MuiChip-deleteIcon') as Element).color,
      ).not.toBe(restDelColor);
    }
    if (state === 'active')
      await expect(getComputedStyle(root('medium-filled-click', 'mui')).boxShadow).not.toBe('none');
    await compare(state);
    for (const el of canvasElement.querySelectorAll(`[${attr}]`)) el.removeAttribute(attr);
    let n: Element | null = canvasElement;
    while (n) {
      n.removeAttribute(attr);
      n = n.parentElement;
    }
  }

  // Keyboard focus-visible on every focusable chip (Tab from the previous focusable).
  for (const name of Object.keys(CASES)) {
    const focused: Record<string, unknown> = {};
    for (const impl of ['mui', 'own']) {
      const el = root(name, impl);
      if (el.tabIndex < 0 || el.getAttribute('role') !== 'button') continue;
      el.focus();
      el.blur();
      await userEvent.keyboard('{Shift}');
      el.focus();
      await settle();
      focused[impl] = {
        classes: [...new Set(el.classList)].filter((c) => !c.startsWith('css-') && c !== 'vg-typography-vanguard'),
        ...measure(get(name, impl)),
      };
      el.blur();
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

export default { ...SbDecorator({ title: 'Vanguard/Chip/ParityDifferential', component: Chip }) };
