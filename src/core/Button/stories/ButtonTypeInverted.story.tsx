import { IconNames } from '@vanguard/Icon/IconNames';
import React from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button, ButtonProps, ButtonTypes } from '../Button';
import { ButtonStory } from './_Button.default';
import { expectForeground, getButtonByTestId, Surface, waitForIcons } from './_mutedSurfaces';

const description = `
\`inverted\` on \`primary\` and \`shimmer\`, for dark or coloured surfaces such as the recommended card: a white fill,
the text and icon in Ado's base colour (\`--ado-base\`), and a white focus ring.

- **Hover:** the fill turns \`color-mix(in srgb, #fff 88%, var(--ado-base))\`.
- **Shimmer:** the sweep stays, as a faint band of that hover tint running over the white fill. On hover the two swap,
  so a white glint runs over the tinted fill. Reduced motion stops it, like the regular shimmer.
- **Disabled:** the same colours at 40% opacity, with no sweep.
- **Dark theme:** unchanged. The button sits on its own dark surface, not on the page.

The colours come from the theme tokens \`--button-primary-inverted-*\` and \`--button-shimmer-inverted-*\` (VAN-85);
Vanguard falls back to these values for themes that don't define them.
`;

const ADO_BASE = 'rgb(0, 106, 133)';
const WHITE = 'rgb(255, 255, 255)';

const TYPES = [
  { key: 'primary', type: ButtonTypes.primary },
  { key: 'shimmer', type: ButtonTypes.shimmer },
] as const;

const STATES = [
  { key: 'rest', label: 'Get started', props: {} },
  { key: 'icon', label: 'Ask Ado', props: { icon: IconNames.add } },
  { key: 'rounded', label: 'Rounded', props: { rounded: true, icon: IconNames.arrowRight, iconPosition: 'right' } },
  { key: 'disabled', label: 'Disabled', props: { disabled: true, icon: IconNames.add } },
] as const;

const tid = (type: string, state: string) => `inverted-${type}-${state}`;

const InvertedMatrix = ({ onClick }: Pick<ButtonProps, 'onClick'>) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
    {/* keyboard sentinel for the focus-ring check */}
    <button
      data-testid={'inverted-sentinel'}
      style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
      aria-label={'sentinel'}
    />
    {TYPES.map(({ key, type }) => (
      <Surface key={key} surface={'teal'} caption={`${key} + inverted, on the Ado teal (recommended card)`}>
        {STATES.map((state) => (
          <Button onClick={onClick} key={state.key} {...state.props} type={type} inverted testId={tid(key, state.key)}>
            {state.label}
          </Button>
        ))}
      </Surface>
    ))}
    <Surface surface={'dark'} caption={'On a dark surface'}>
      {TYPES.map(({ key, type }) => (
        <Button onClick={onClick} key={key} type={type} inverted icon={IconNames.add} testId={`inverted-${key}-dark`}>
          {key}
        </Button>
      ))}
    </Surface>
  </div>
);

const playInverted: ButtonStory['play'] = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await waitForIcons(canvasElement, TYPES.length * 3 + TYPES.length);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  for (const { key } of TYPES) {
    for (const state of STATES) {
      const button = getButtonByTestId(canvasElement, tid(key, state.key));
      const style = getComputedStyle(button);
      await expectForeground(button, ADO_BASE, state.key !== 'rest');
      await expect(style.backgroundColor).toBe(WHITE);

      if (state.key === 'disabled') {
        await expect(button).toBeDisabled();
        await expect(style.opacity).toBe('0.4');
        await expect(style.backgroundImage).toBe('none');
        await expect(style.animationName).toBe('none');
        continue;
      }

      await expect(style.opacity).toBe('1');
      await expect(style.filter).toBe('none');
      if (key === 'shimmer') {
        // the sweep is kept, on the white fill (with prefers-reduced-motion it stands still)
        await expect(style.backgroundImage).toContain('linear-gradient');
        if (reducedMotion) {
          await expect(style.animationName).toBe('none');
        } else {
          await expect(style.animationName).toContain('adoShimmer');
        }
      } else {
        await expect(style.backgroundImage).toBe('none');
      }
    }
  }

  // clicks still go through
  const rest = getButtonByTestId(canvasElement, tid('primary', 'rest'));
  await userEvent.click(rest);
  await expect(args.onClick).toHaveBeenCalledTimes(1);
  await userEvent.click(getButtonByTestId(canvasElement, tid('primary', 'disabled')));
  await expect(args.onClick).toHaveBeenCalledTimes(1);

  // focus ring via keyboard: white, 2px, 2px offset
  const sentinel = canvas.getByTestId('inverted-sentinel');
  for (const { key } of TYPES) {
    const target = getButtonByTestId(canvasElement, tid(key, 'rest'));
    target.parentElement!.before(sentinel);
    sentinel.focus();
    await userEvent.tab();
    await waitFor(() => expect(target).toHaveFocus());
    await waitFor(() => {
      const style = getComputedStyle(target);
      expect(style.outlineStyle).toBe('solid');
      expect(style.outlineWidth).toBe('2px');
      expect(style.outlineOffset).toBe('2px');
      expect(style.outlineColor).toBe(WHITE);
      // the regular primary focus look (hover fill + box-shadow) is not applied
      expect(style.backgroundColor).toBe(WHITE);
      expect(style.boxShadow).toBe('none');
    });
    target.blur();
  }
};

// Inverted primary & shimmer, light theme
export const ButtonTypeInverted: ButtonStory = {
  globals: { theme: 'light' },
  parameters: { docs: { description: { story: description } } },
  args: { onClick: fn() },
  render: (args) => <InvertedMatrix onClick={args.onClick} />,
  play: playInverted,
};

// The same checks under the dark theme global: the colours don't change
export const ButtonTypeInvertedDarkTheme: ButtonStory = {
  globals: { theme: 'dark' },
  parameters: {
    docs: { description: { story: 'Inverted primary & shimmer with the dark theme: same colours as light.' } },
  },
  args: { onClick: fn() },
  render: (args) => <InvertedMatrix onClick={args.onClick} />,
  play: playInverted,
};
