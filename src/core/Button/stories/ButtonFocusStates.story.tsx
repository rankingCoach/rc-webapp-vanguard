import { IconNames } from '@vanguard/Icon/IconNames';
import React from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button, ButtonTypes } from '../Button';
import { ButtonStory } from './_Button.default';
import { getButtonByTestId, getLayerStyle } from './_mutedSurfaces';

const description = `
Keyboard focus and corner shape for every type, as plain, rounded and icon-only buttons.

Behaviour verified by the play function:
- keyboard focus (\`:focus-visible\`) draws a **2px outline with a 2px offset** on every type, with no box-shadow.
  Default, primary, secondary and shimmer read \`--button-<type>-focus-outline-color\` and fall back to
  \`--button-<type>-focus-box-shadow-color\` (the old ring colour) while the theme does not define it;
- a mouse press shows no ring (\`:focus-visible\` does not match pointer focus; not covered here because synthetic
  pointer events cannot trigger the browser's focus-visible heuristics, check it by clicking);
- \`corner-shape: superellipse(1.3)\` (Chromium 139+, ignored elsewhere, which keeps the plain border-radius);
  \`rounded\` buttons keep \`round\` corners, and the muted fill layers inherit the shape.
`;

const TYPES = [
  ButtonTypes.default,
  ButtonTypes.primary,
  ButtonTypes.secondary,
  ButtonTypes.shimmer,
  ButtonTypes.muted,
] as const;

const VARIANTS = [
  { key: 'plain', props: {}, label: 'Focus me' },
  { key: 'rounded', props: { rounded: true }, label: 'Rounded' },
  { key: 'icon', props: { icon: IconNames.add }, label: null },
] as const;

const sid = (type: string, variant: string) => `focus-${type}-${variant}`;

// Resolves a colour custom property in the button's own context (handles var() fallbacks and light-dark())
const resolveColor = (el: HTMLElement, value: string) => {
  const probe = document.createElement('span');
  probe.style.color = value;
  el.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
};

const ringColor = (el: HTMLElement, type: string) =>
  type === ButtonTypes.muted
    ? resolveColor(el, 'var(--button-muted-focus-outline-color, #0062ff)')
    : resolveColor(
        el,
        `var(--button-${type}-focus-outline-color, var(--button-${type}-focus-box-shadow-color))`,
      );

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
      {TYPES.map((type) => (
        <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ width: 80 }}>{type}</span>
          {VARIANTS.map((variant) => (
            <Button key={variant.key} type={type} {...variant.props} testId={sid(type, variant.key)}>
              {variant.label}
            </Button>
          ))}
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sentinel = canvas.getByTestId('focus-sentinel');
    const supportsCornerShape = CSS.supports('corner-shape', 'superellipse(1.3)');

    for (const type of TYPES) {
      for (const variant of VARIANTS) {
        const button = getButtonByTestId(canvasElement, sid(type, variant.key));

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
          expect(style.outlineColor).toBe(ringColor(button, type));
          expect(style.boxShadow).toBe('none');
        });
        button.blur();

        // corner shape: squircle, except rounded buttons; the muted fill layers follow the button
        if (supportsCornerShape) {
          const expected = variant.key === 'rounded' ? 'round' : 'superellipse(1.3)';
          await expect(cornerShape(getComputedStyle(button)), `${type} ${variant.key} corners`).toBe(expected);
          if (type === ButtonTypes.muted) {
            await expect(cornerShape(getLayerStyle(button, '::after'))).toBe(expected);
          }
        }
      }
    }
  },
};
