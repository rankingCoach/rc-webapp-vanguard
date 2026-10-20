import { IconNames } from '@vanguard/Icon/IconNames';
import React from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button, ButtonTypes } from '../Button';
import { ButtonStory } from './_Button.default';
import { getButtonByTestId, getLayerStyle, Surface } from './_mutedSurfaces';

const description = `
Keyboard focus and corner shape for every type, as plain, rounded and icon-only buttons, plus \`inverted\` primary
and shimmer on the Ado teal.

Behaviour verified by the play function:
- keyboard focus (\`:focus-visible\`) draws a **2px outline with a 2px offset** on every type, with no box-shadow.
  Default, primary, secondary and shimmer read \`--button-<type>-focus-outline-color\` and fall back to
  \`--button-<type>-focus-box-shadow-color\` (the old ring colour) while the theme does not define it. Inverted buttons
  read \`--button-<type>-inverted-focus-outline-color\` and fall back to white;
- the ring stays while the button is pressed (\`:active\` + \`:focus-visible\`, e.g. holding Space): no rule that
  matches the pressed button touches the outline, so it keeps the \`:focus-visible\` ring checked above. Synthetic
  events cannot set \`:active\`, so this is read from the stylesheets; check it by tabbing to a button and holding Space;
- a mouse press shows no ring (\`:focus-visible\` does not match pointer focus; not covered here because synthetic
  pointer events cannot trigger the browser's focus-visible heuristics, check it by clicking);
- \`corner-shape: superellipse(1.3)\` (Chromium 139+, ignored elsewhere, which keeps the plain border-radius);
  \`rounded\` buttons keep \`round\` corners, and the muted fill layers inherit the shape.
`;

const ROWS = [
  { key: 'default', type: ButtonTypes.default, inverted: false },
  { key: 'primary', type: ButtonTypes.primary, inverted: false },
  { key: 'secondary', type: ButtonTypes.secondary, inverted: false },
  { key: 'shimmer', type: ButtonTypes.shimmer, inverted: false },
  { key: 'muted', type: ButtonTypes.muted, inverted: false },
  { key: 'primary-inverted', type: ButtonTypes.primary, inverted: true },
  { key: 'shimmer-inverted', type: ButtonTypes.shimmer, inverted: true },
] as const;
type Row = (typeof ROWS)[number];

const VARIANTS = [
  { key: 'plain', props: {}, label: 'Focus me' },
  { key: 'rounded', props: { rounded: true }, label: 'Rounded' },
  { key: 'icon', props: { icon: IconNames.add }, label: null },
] as const;

const sid = (row: string, variant: string) => `focus-${row}-${variant}`;

const RowButtons = ({ row }: { row: Row }) =>
  VARIANTS.map((variant) => (
    <Button
      key={variant.key}
      type={row.type}
      {...(row.inverted ? { inverted: true } : {})}
      {...variant.props}
      testId={sid(row.key, variant.key)}
    >
      {variant.label}
    </Button>
  ));

// Resolves a colour custom property in the button's own context (handles var() fallbacks and light-dark())
const resolveColor = (el: HTMLElement, value: string) => {
  const probe = document.createElement('span');
  probe.style.color = value;
  el.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
};

const ringColor = (el: HTMLElement, { type, inverted }: Row) => {
  if (inverted) return resolveColor(el, `var(--button-${type}-inverted-focus-outline-color, #fff)`);
  return type === ButtonTypes.muted
    ? resolveColor(el, 'var(--button-muted-focus-outline-color, #0062ff)')
    : resolveColor(el, `var(--button-${type}-focus-outline-color, var(--button-${type}-focus-box-shadow-color))`);
};

// The style rules that match the button while it is pressed: every selector with :active, which still matches the
// button once :active is taken out (`:is(*)` keeps descendant selectors such as `.x :active` valid)
const pressedRules = (el: HTMLElement) => {
  const found: CSSStyleRule[] = [];
  const matches = (selector: string) => {
    try {
      return el.matches(selector.replaceAll(':active', ':is(*)'));
    } catch {
      return false;
    }
  };
  const walk = (rules: CSSRuleList) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule) {
        // split the selector list on top-level commas only
        const selectors = rule.selectorText.split(/,(?![^(]*\))/);
        if (selectors.some((selector) => selector.includes(':active') && matches(selector))) found.push(rule);
      }
      if ('cssRules' in rule) walk((rule as CSSGroupingRule).cssRules);
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      walk(sheet.cssRules);
    } catch {
      // cross-origin sheet
    }
  }
  return found;
};

const OUTLINE_PROPS = ['outline-style', 'outline-width', 'outline-color', 'outline-offset'];

const cornerShape = (style: CSSStyleDeclaration) => style.getPropertyValue('corner-top-left-shape');

// Tests the keyboard focus ring and the corner shape of every type
export const ButtonFocusStates: ButtonStory = {
  globals: { theme: 'light' },
  parameters: { docs: { description: { story: description } } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px' }}>
      <button
        type="button"
        data-testid="focus-sentinel"
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden' }}
      >
        sentinel
      </button>
      {ROWS.filter((row) => !row.inverted).map((row) => (
        <div key={row.key} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ width: 80 }}>{row.key}</span>
          <RowButtons row={row} />
        </div>
      ))}
      {ROWS.filter((row) => row.inverted).map((row) => (
        <Surface key={row.key} surface={'teal'} caption={`${row.type} + inverted`}>
          <RowButtons row={row} />
        </Surface>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sentinel = canvas.getByTestId('focus-sentinel');
    const supportsCornerShape = CSS.supports('corner-shape', 'superellipse(1.3)');

    for (const row of ROWS) {
      const { type } = row;
      for (const variant of VARIANTS) {
        const button = getButtonByTestId(canvasElement, sid(row.key, variant.key));
        const name = `${row.key} ${variant.key}`;

        // keyboard: tab once from a sentinel placed right before the target, so :focus-visible applies
        button.parentElement!.before(sentinel);
        sentinel.focus();
        await userEvent.tab();
        await waitFor(() => expect(button).toHaveFocus());
        await expect(button.matches(':focus-visible')).toBe(true);
        await waitFor(() => {
          const style = getComputedStyle(button);
          expect(style.outlineStyle).toBe('solid');
          expect(style.outlineWidth).toBe('2px');
          expect(style.outlineOffset).toBe('2px');
          expect(style.outlineColor).toBe(ringColor(button, row));
          expect(style.boxShadow).toBe('none');
        });

        // pressed + keyboard focus: nothing that applies on :active may override the ring checked above
        const pressed = pressedRules(button);
        if (type !== ButtonTypes.muted) await expect(pressed.length, `${name} :active rules found`).toBeGreaterThan(0);
        for (const rule of pressed) {
          for (const prop of OUTLINE_PROPS) {
            await expect(rule.style.getPropertyValue(prop), `${name}: ${rule.selectorText} sets ${prop}`).toBe('');
          }
        }
        button.blur();

        // corner shape: squircle, except rounded buttons; the muted fill layers follow the button
        if (supportsCornerShape) {
          const expected = variant.key === 'rounded' ? 'round' : 'superellipse(1.3)';
          await expect(cornerShape(getComputedStyle(button)), `${name} corners`).toBe(expected);
          if (type === ButtonTypes.muted) {
            await expect(cornerShape(getLayerStyle(button, '::after'))).toBe(expected);
          }
        }
      }
    }
  },
};
