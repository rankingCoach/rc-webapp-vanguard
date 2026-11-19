import { TRANSITION_LONGHANDS } from '@test-utils/transition-longhands';
import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { VanguardThemeProvider } from '../VanguardThemeProvider/VanguardThemeProvider';
import { SliderMui } from './_SliderMui.reference';
import { Slider, SliderProps } from './Slider';

/**
 * Track g differential in Chromium: the own Slider vs the former MUI path (_SliderMui.reference.tsx), side by side,
 * with and without VanguardThemeProvider, over value/range × marks × value labels × disabled × Vanguard type/size.
 * Computed styles + boxes/positions of root, rail, track, marks, mark labels, thumbs (incl. ::before/::after) and
 * value labels: at rest, thumb :hover (forced by cloning those rules in place with [data-force-hover]), keyboard
 * focus-visible + ArrowRight, and while pressed (real pointerdown on the rail → Mui-active), then released.
 */
const MARKS = [
  { value: 0, label: 'Low' },
  { value: 50, label: 'Mid' },
  { value: 100, label: 'High' },
];
const CASES: Record<string, SliderProps> = {
  single: { value: 30, min: 0, max: 100 },
  range: { value: [20, 70], min: 0, max: 100, valueLabelDisplay: 'on' },
  marks: { value: 50, min: 0, max: 100, step: 10, marks: MARKS, valueLabelDisplay: 'auto' },
  disabled: { value: 40, min: 0, max: 100, disabled: true },
  simpleSmall: { value: 60, min: 0, max: 100, type: 'simple', size: 'small' },
  primary: { value: [10, 90], min: 0, max: 100, type: 'primary', marks: MARKS },
};
const PROPS = [
  ...TRANSITION_LONGHANDS,
  'display',
  'position',
  'box-sizing',
  'width',
  'height',
  'margin',
  'padding',
  'top',
  'left',
  'border',
  'border-radius',
  'background-color',
  'box-shadow',
  'color',
  'opacity',
  'transform',
  'transition',
  'font-family',
  'font-size',
  'font-weight',
  'letter-spacing',
  'line-height',
  'white-space',
  'z-index',
  'pointer-events',
  'cursor',
  'content',
];
const pick = (el: Element, pseudo?: string) => {
  const cs = getComputedStyle(el, pseudo);
  return Object.fromEntries(PROPS.map((p) => [p, cs.getPropertyValue(p)]));
};
const measure = (host: Element) =>
  [...host.querySelectorAll('.MuiSlider-root, .MuiSlider-root span')].map((e) => {
    const { width, height, x, y } = e.getBoundingClientRect();
    const h = host.getBoundingClientRect();
    return {
      cls: [...e.classList].filter((c) => c.startsWith('Mui')).join(' '),
      style: pick(e),
      ...(e.classList.contains('MuiSlider-thumb') ? { before: pick(e, '::before'), after: pick(e, '::after') } : {}),
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
  // A keyboard step can reveal a value label and request a font that was unused in the resting frame.
  void document.body.offsetWidth;
  await document.fonts.ready;
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
  <div style={{ width: 360, padding: '40px 20px' }}>
    {Object.entries(CASES).map(([name, p]) =>
      (['mui', 'own'] as const).map((impl) => {
        const C = impl === 'mui' ? SliderMui : Slider;
        return (
          <div key={`${name}-${impl}`} data-case={name} data-impl={impl} style={{ marginBottom: 40 }}>
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

  const thumb = (name: string, impl: string) => get(name, impl).querySelector('.MuiSlider-thumb') as HTMLElement;
  // Vanguard's skin hovers on the root (`:hover .MuiSlider-thumb/-track`) and MUI's on the thumb: force both.
  const restBg = [
    getComputedStyle(thumb('single', 'mui')).backgroundColor,
    getComputedStyle(get('single', 'mui').querySelector('.MuiSlider-track') as Element).backgroundColor,
  ];
  for (const name of Object.keys(CASES))
    for (const impl of ['mui', 'own']) {
      thumb(name, impl).setAttribute('data-force-hover', '');
      (get(name, impl).querySelector('.MuiSlider-root') as Element).setAttribute('data-force-hover', '');
    }
  await settle();
  await expect([
    getComputedStyle(thumb('single', 'mui')).backgroundColor,
    getComputedStyle(get('single', 'mui').querySelector('.MuiSlider-track') as Element).backgroundColor,
  ]).not.toEqual(restBg);
  await compare('thumb hover');
  for (const el of canvasElement.querySelectorAll('[data-force-hover]')) el.removeAttribute('data-force-hover');

  // Keyboard: focus the first range input, ArrowRight (value + label + focus-visible ring), then blur.
  for (const name of Object.keys(CASES).filter((n) => !CASES[n].disabled)) {
    const snap: Record<string, unknown> = {};
    for (const impl of ['mui', 'own']) {
      const input = get(name, impl).querySelector('input[type="range"]') as HTMLInputElement;
      input.focus();
      await userEvent.keyboard('{ArrowRight}');
      await settle();
      snap[impl] = { visible: input.matches(':focus-visible'), m: measure(get(name, impl)) };
      input.blur();
      await settle();
    }
    await expect({ name, diffs: diff(snap.own, snap.mui) }).toEqual({ name, diffs: [] });
  }

  // Pointer: press on the rail at 80% (jump + Mui-active), compare, release.
  for (const name of ['single', 'range']) {
    const snap: Record<string, unknown> = {};
    for (const impl of ['mui', 'own']) {
      const root = get(name, impl).querySelector('.MuiSlider-root') as HTMLElement;
      const r = root.getBoundingClientRect();
      const x = r.left + r.width * 0.8;
      root.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: r.top + r.height / 2,
          button: 0,
          buttons: 1,
          pointerId: 7,
          pointerType: 'mouse',
        }),
      );
      await settle();
      snap[impl] = measure(get(name, impl));
      document.dispatchEvent(
        new PointerEvent('pointerup', {
          bubbles: true,
          clientX: x,
          clientY: r.top + r.height / 2,
          pointerId: 7,
          pointerType: 'mouse',
        }),
      );
      // Symmetric hand-off: MUI focuses the thumb input in a frame after pointerdown; blur it here on each side so the
      // next side's focus does not blur this one (MUI keeps focusVisible on a blur that matched :focus-visible).
      await new Promise((r) => requestAnimationFrame(r));
      (document.activeElement as HTMLElement | null)?.blur();
      await settle();
    }
    await expect((snap.mui as { cls: string }[]).some((m) => m.cls.includes('Mui-active'))).toBe(true);
    await expect({ name, diffs: diff(snap.own, snap.mui) }).toEqual({ name, diffs: [] });
  }
  await compare('released');
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

export default { ...SbDecorator({ title: 'Vanguard/Slider/ParityDifferential', component: Slider }) };
