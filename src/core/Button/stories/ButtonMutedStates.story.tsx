import { IconNames } from '@vanguard/Icon/IconNames';
import React, { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../Button';
import { ButtonStory } from './_Button.default';
import {
  comboButtonProps,
  expectNotIsolated,
  getAlpha,
  getButtonByTestId,
  getFillAlpha,
  getHoverLayer,
  getLayerStyle,
  MUTED_COMBOS,
  Surface,
} from './_mutedSurfaces';

const description = `
Rest, **pressed** (\`pressed\` renders \`aria-pressed\` and keeps the hover-strength fill), **disabled** and
**loading** for each muted combination on its intended surface, plus an interactive toggle.

Behaviour verified by the play function:
- the rest fill (0.25 / white 18 %) never changes. On hover (and while pressed) a hover layer (0.40 / white 28 %)
  grows from the centre (scale 0.5 → 1, 400 ms) and adds its colour on top of the rest fill;
- \`disabled\` lowers opacity to 0.4 on the **layers only** (the button itself is never faded, so blending is not
  isolated) and swallows clicks;
- hover is visual-only (user-event cannot trigger a real CSS :hover); \`prefers-reduced-motion\` removes the grow
  animation and the transitions;
- the focus ring (2px, 2px offset) is the blue \`#0062ff\` or white depending on the surface matrix.
`;

const sid = (combo: string, state: string) => `states-${combo}-${state}`;

const Toggle = ({ comboIndex }: { comboIndex: number }) => {
  const [pressed, setPressed] = useState(false);
  const combo = MUTED_COMBOS[comboIndex];
  return (
    <Button
      {...comboButtonProps(combo, { pressed, icon: IconNames.add })}
      testId="states-toggle"
      onClick={() => setPressed((p) => !p)}
    >
      Toggle
    </Button>
  );
};

// Tests rest / pressed / disabled / loading states for each combination
export const ButtonMutedStates: ButtonStory = {
  globals: { theme: 'light' },
  args: { onClick: fn() },
  parameters: { docs: { description: { story: description } } },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {MUTED_COMBOS.map((combo) => (
        <Surface key={combo.key} surface={combo.surface} caption={`${combo.label}`}>
          <Button {...comboButtonProps(combo)} onClick={args.onClick} testId={sid(combo.key, 'rest')}>
            Rest
          </Button>
          <Button {...comboButtonProps(combo, { pressed: true })} testId={sid(combo.key, 'pressed')}>
            Pressed
          </Button>
          <Button {...comboButtonProps(combo)} disabled onClick={args.onClick} testId={sid(combo.key, 'disabled')}>
            Disabled
          </Button>
          <Button {...comboButtonProps(combo, { pressed: true })} disabled testId={sid(combo.key, 'pressed-disabled')}>
            Pressed + disabled
          </Button>
          <Button {...comboButtonProps(combo)} isLoading testId={sid(combo.key, 'loading')}>
            Loading
          </Button>
        </Surface>
      ))}
      <button
        type="button"
        data-testid="states-sentinel"
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden' }}
      >
        sentinel
      </button>
      <Surface surface="pale" caption="Interactive toggle (pressed + useState)">
        <Toggle comboIndex={0} />
      </Surface>
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    for (const combo of MUTED_COMBOS) {
      const rest = getButtonByTestId(canvasElement, sid(combo.key, 'rest'));
      const pressed = getButtonByTestId(canvasElement, sid(combo.key, 'pressed'));
      const pressedDisabled = getButtonByTestId(canvasElement, sid(combo.key, 'pressed-disabled'));
      const disabled = getButtonByTestId(canvasElement, sid(combo.key, 'disabled'));

      // pressed: aria-pressed and a stronger fill than rest
      await expect(pressed).toHaveAttribute('aria-pressed', 'true');
      await expect(rest).not.toHaveAttribute('aria-pressed', 'true');
      const light = combo.key === 'inverted' || combo.key === 'invertedOnDark';
      const restAlpha = light ? 0.18 : 0.25;
      const hoverAlpha = light ? 0.28 : 0.4;
      // the rest fill never changes: pressed keeps it as is
      await expect(getFillAlpha(rest), `${combo.key} rest fill`).toBeCloseTo(restAlpha, 3);
      await expect(getFillAlpha(pressed), `${combo.key} pressed rest fill`).toBeCloseTo(restAlpha, 3);
      await expect(getLayerStyle(pressed, '::after').opacity).toBe('1');
      // pressed: the hover layer has grown in on top (full size, opaque, blending) with the hover colour
      const pressedLayer = getComputedStyle(getHoverLayer(pressed));
      await expect(getAlpha(pressedLayer.backgroundColor), `${combo.key} hover layer`).toBeCloseTo(hoverAlpha, 3);
      await expect(pressedLayer.opacity).toBe('1');
      await expect(pressedLayer.transform).toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);
      await expect(pressedLayer.mixBlendMode).toBe(combo.blend);
      // same colour channels, only the alpha differs
      const channels = (c: string) => c.replace(/\/?\s*[\d.]+%?\s*\)$|,\s*[\d.]+\)$/, '');
      await expect(channels(pressedLayer.backgroundColor)).toBe(channels(getLayerStyle(rest, '::after').backgroundColor));
      // rest: the hover layer waits at half size, invisible; it grows and fades in over 400 ms
      // (with prefers-reduced-motion: full size and no transition, the layer only toggles its opacity)
      const restLayer = getComputedStyle(getHoverLayer(rest));
      await expect(restLayer.opacity).toBe('0');
      if (reducedMotion) {
        await expect(restLayer.transform).toBe('none');
        await expect(restLayer.transitionDuration).toBe('0s');
      } else {
        await expect(restLayer.transform).toBe('matrix(0.5, 0, 0, 0.5, 0, 0)');
        await expect(restLayer.transitionProperty).toContain('transform');
        await expect(restLayer.transitionDuration).toContain('0.4s');
      }

      // disabled: opacity on the layers only, never on the button
      await expect(disabled).toBeDisabled();
      await expectNotIsolated(disabled);
      await expect(getComputedStyle(disabled).opacity).toBe('1');
      await expect(getLayerStyle(disabled, '::after').opacity).toBe('0.4');
      await expect(getComputedStyle(getHoverLayer(disabled)).opacity).toBe('0');
      // pressed + disabled: rest fill and hover layer both faded to 0.4, button never faded
      await expectNotIsolated(pressedDisabled);
      await expect(getComputedStyle(pressedDisabled).opacity).toBe('1');
      await expect(getLayerStyle(pressedDisabled, '::after').opacity).toBe('0.4');
      await expect(getComputedStyle(getHoverLayer(pressedDisabled)).opacity).toBe('0.4');
      await expect(getComputedStyle(disabled.querySelector('.button-inner-container, [class*="inner-container"], [class*="innerContainer"]')!).opacity).toBe('0.4');
    }

    // disabled buttons do not fire onClick
    await userEvent.click(getButtonByTestId(canvasElement, sid('default', 'disabled')));
    await expect(args.onClick).not.toHaveBeenCalled();

    // focus ring via keyboard: tab once from a sentinel that precedes the target, so :focus-visible applies
    const sentinel = canvas.getByTestId('states-sentinel');
    for (const combo of MUTED_COMBOS) {
      const rest = getButtonByTestId(canvasElement, sid(combo.key, 'rest'));
      // move the sentinel directly before the target's wrapper (DOM only, restored by the story reload)
      rest.parentElement!.before(sentinel);
      sentinel.focus();
      await expect(sentinel).toHaveFocus();
      await userEvent.tab();
      await waitFor(() => expect(rest).toHaveFocus());
      await waitFor(() => expect(rest.matches(':focus-visible')).toBe(true));
      await waitFor(() => {
        const style = getComputedStyle(rest);
        expect(style.outlineStyle).toBe('solid');
        expect(style.outlineWidth).toBe('2px');
        expect(style.outlineOffset).toBe('2px');
        expect(style.outlineColor).toBe(combo.ring);
      });
      rest.blur();
    }

    // interactive toggle
    const toggle = canvas.getByTestId('states-toggle_button');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(toggle);
    await waitFor(() => expect(toggle).toHaveAttribute('aria-pressed', 'true'));
    // settled paint: the hover layer has fully grown in on top of the unchanged rest fill
    await waitFor(() => {
      expect(getComputedStyle(getHoverLayer(toggle)).opacity).toBe('1');
      expect(getComputedStyle(getHoverLayer(toggle)).transform).toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);
    });
    await expect(getFillAlpha(toggle)).toBeCloseTo(0.25, 3);
    await userEvent.click(toggle);
    await waitFor(() => expect(toggle).toHaveAttribute('aria-pressed', 'false'));
    await waitFor(() => expect(getComputedStyle(getHoverLayer(toggle)).opacity).toBe('0'));
    await expect(getFillAlpha(toggle)).toBeCloseTo(0.25, 3);
  },
};
