import { IconNames } from '@vanguard/Icon/IconNames';
import React from 'react';
import { expect } from 'storybook/test';

import { Button, ButtonSizes } from '../Button';
import { ButtonStory } from './_Button.default';
import { comboButtonProps, expectMutedSurface, getButtonByTestId, MUTED_COMBOS, Surface, waitForIcons } from './_mutedSurfaces';

const description = `
All four sizes (small, medium, large, extra large) of the muted button as label, icon-left, icon-right and icon-only,
for the default and the inverted treatment. Sizes are unchanged by the surface logic: the fill layer is inset 0 so it
follows the button's own box and radius.
`;

const SIZES = [ButtonSizes.small, ButtonSizes.medium, ButtonSizes.large, ButtonSizes.extraLarge] as const;
const COMBOS = [MUTED_COMBOS[0], MUTED_COMBOS[2]];
const VARIANTS = [
  { key: 'label', props: {} },
  { key: 'icon-left', props: { icon: IconNames.add, iconPosition: 'left' } },
  { key: 'icon-right', props: { icon: IconNames.add, iconPosition: 'right' } },
  { key: 'icon-only', props: { icon: IconNames.add }, noLabel: true },
] as const;

const id = (combo: string, size: string, variant: string) => `sizes-${combo}-${size}-${variant}`;

// Tests all sizes x label/icon variants
export const ButtonMutedSizes: ButtonStory = {
  globals: { theme: 'light' },
  parameters: { docs: { description: { story: description } } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {COMBOS.map((combo) => (
        <Surface key={combo.key} surface={combo.key === 'default' ? 'pale' : 'photo'} caption={combo.label}>
          {SIZES.map((size) => (
            <div key={size} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
              {VARIANTS.map((variant) => (
                <Button
                  key={variant.key}
                  {...comboButtonProps(combo, { size, ...variant.props })}
                  testId={id(combo.key, size, variant.key)}
                >
                  {'noLabel' in variant ? undefined : `${size}`}
                </Button>
              ))}
            </div>
          ))}
        </Surface>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    await waitForIcons(canvasElement, COMBOS.length * SIZES.length * 3);
    for (const combo of COMBOS) {
      let previousHeight = 0;
      for (const size of SIZES) {
        const label = getButtonByTestId(canvasElement, id(combo.key, size, 'label'));
        await expectMutedSurface(label, { fg: combo.fg, blend: combo.blend });
        const height = label.getBoundingClientRect().height;
        await expect(height).toBeGreaterThanOrEqual(previousHeight);
        previousHeight = height;

        const iconOnly = getButtonByTestId(canvasElement, id(combo.key, size, 'icon-only'));
        const rect = iconOnly.getBoundingClientRect();
        await expect(rect.width).toBeGreaterThan(0);
        await expect(rect.height).toBeGreaterThan(0);
      }
    }
  },
};
